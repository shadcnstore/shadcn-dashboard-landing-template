#!/usr/bin/env node
// Vendors the Dashboard Kit into a template: copies `kit/` from a tagged
// commit of shadcnstore/dashboard-kit, records what it copied, and checks the
// template provides what the Kit needs. Buyers get the copy, never this repo.
//
// Copy this file to the template as scripts/kit-sync.mjs, then:
//
//   node scripts/kit-sync.mjs --ref v1.0.0     sync kit/ to that tag
//   node scripts/kit-sync.mjs --check          fail if kit/ was edited by hand, or a requirement is missing
//   node scripts/kit-sync.mjs --ref v1.1.0 --dry-run
//   --allow-untagged   accept a branch or commit for --ref (testing only; a lock should name a tag)
//   --exclude <glob>   leave Kit files out (repeatable; `*` within a folder, `**` across folders,
//                      paths relative to kit/). Saved in the lock, so later syncs and --check keep
//                      the same edition. Pass --exclude none to clear the saved list.
//   --framework <name> the app framework the Kit is vendored into: `next` (default) or `vite`
//                      (Vite + React Router). Picks kit/framework/'s adapter for that framework
//                      (kit.json -> frameworks). Saved in the lock like --exclude.
//
// Source, first that exists: --source <path or git URL>, $KIT_SOURCE, a
// sibling ../dashboard-kit checkout, then git@github.com:shadcnstore/dashboard-kit.git.
// Node 20+, git and tar. No npm dependencies.

import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import { existsSync, realpathSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync, cpSync, mkdirSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const DEFAULT_REMOTE = "git@github.com:shadcnstore/dashboard-kit.git"
const LOCK = "kit.lock.json"

function parseArgs(argv) {
  const args = { ref: null, source: null, check: false, dryRun: false, allowUntagged: false, exclude: null, framework: null, root: process.cwd() }
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]
    if (arg === "--ref") args.ref = argv[++index]
    else if (arg === "--source") args.source = argv[++index]
    else if (arg === "--root") args.root = resolve(argv[++index])
    else if (arg === "--check") args.check = true
    else if (arg === "--dry-run") args.dryRun = true
    else if (arg === "--allow-untagged") args.allowUntagged = true
    else if (arg === "--exclude") {
      const glob = argv[++index]
      if (!glob) throw new Error("--exclude needs a glob, e.g. --exclude 'shader/**'")
      args.exclude = glob === "none" ? [] : [...(args.exclude ?? []), glob]
    }
    else if (arg === "--framework") {
      args.framework = argv[++index]
      if (!args.framework) throw new Error("--framework needs a name, e.g. --framework vite")
    }
    else if (arg === "--help" || arg === "-h") args.help = true
    else throw new Error(`Unknown argument ${arg}. Try --help.`)
  }
  return args
}

const git = (cwd, ...args) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim()

function hash(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex")
}

/** OS litter that is never part of the Kit and never counts as an edit. */
const JUNK = new Set([".DS_Store", "Thumbs.db"])

function walk(dir, base = dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir).filter((entry) => !JUNK.has(entry)).flatMap((entry) => {
    const path = join(dir, entry)
    return statSync(path).isDirectory() ? walk(path, base) : [relative(base, path).split("\\").join("/")]
  })
}

function removeEmptyDirs(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) {
      removeEmptyDirs(path)
      if (readdirSync(path).length === 0) rmSync(path, { recursive: true })
    }
  }
}

function hashes(dir) {
  return Object.fromEntries(walk(dir).sort().map((file) => [file, hash(join(dir, file))]))
}

/** A glob over kit/-relative paths as a RegExp: `**` spans folders, `*` stays inside one. */
export function globToRegExp(glob) {
  let source = ""
  for (let index = 0; index < glob.length; index++) {
    const char = glob[index]
    if (char === "*" && glob[index + 1] === "*") {
      index++
      if (glob[index + 1] === "/") {
        // `**/` is zero or more whole folders, never part of a file name.
        source += "(?:.*/)?"
        index++
      } else source += ".*"
    } else if (char === "*") source += "[^/]*"
    else if (char === "?") source += "[^/]"
    else source += char.replace(/[.+^${}()|[\]\\]/g, "\\$&")
  }
  return new RegExp(`^${source}$`)
}

const DEFAULT_FRAMEWORK = "next"

/**
 * The frameworks a Kit manifest supports. Each maps kit/-relative targets to
 * the variant file that becomes them (`{ "framework/index.tsx":
 * "framework/react-router.tsx" }`) and adds its own dependencies. A manifest
 * from before v1.1.0 has no list, and supports Next.js only.
 */
export function frameworksOf(manifest) {
  return manifest?.frameworks ?? { [DEFAULT_FRAMEWORK]: { files: {}, dependencies: {} } }
}

/**
 * Turns an extracted kit/ into one framework's edition: each variant the
 * framework names replaces its target, and every other framework's variant
 * files are removed. One Kit source, one adapter per app, nothing forked.
 */
export function applyFramework(kitDir, framework) {
  const frameworks = frameworksOf(JSON.parse(readFileSync(join(kitDir, "kit.json"), "utf8")))
  const chosen = frameworks[framework]
  if (!chosen) throw new Error(`This Kit has no "${framework}" framework. It supports: ${Object.keys(frameworks).join(", ")}.`)
  const files = chosen.files ?? {}
  for (const [target, variant] of Object.entries(files)) cpSync(join(kitDir, variant), join(kitDir, target))
  const targets = new Set(Object.keys(files))
  const variants = new Set(Object.values(frameworks).flatMap((entry) => Object.values(entry.files ?? {})))
  for (const variant of variants) {
    if (!targets.has(variant)) rmSync(join(kitDir, variant), { force: true })
  }
}

/** Whether a kit/-relative file is left out by any of the globs. */
export function isExcluded(file, globs) {
  const patterns = globs.map(globToRegExp)
  return patterns.some((pattern) => pattern.test(file))
}

const isCheckout = (path) => existsSync(join(path, ".git")) || existsSync(join(path, "HEAD"))

/**
 * A local checkout to read the tag from. An explicit --source wins outright:
 * a local path is used as is, anything else is cloned as a URL. Only without
 * --source do $KIT_SOURCE and a sibling ../dashboard-kit get a look.
 */
function openSource(source, root) {
  const local = (path) => ({ dir: resolve(path), label: relative(root, resolve(path)) || ".", cleanup: () => {} })
  if (source && isCheckout(source)) return local(source)
  if (!source) {
    for (const candidate of [process.env.KIT_SOURCE, resolve(root, "../dashboard-kit")].filter(Boolean)) {
      if (isCheckout(candidate)) return local(candidate)
    }
  }
  const url = source ?? DEFAULT_REMOTE
  const dir = mkdtempSync(join(tmpdir(), "kit-source-"))
  execFileSync("git", ["clone", "--quiet", "--bare", url, dir], { stdio: ["ignore", "ignore", "inherit"] })
  return { dir, label: url, cleanup: () => rmSync(dir, { recursive: true, force: true }) }
}

/** "^5.104.5" -> [5, 104, 5]. Null for anything that is not a plain, caret or tilde version. */
function parseVersion(spec) {
  const match = String(spec).trim().match(/^[\^~]?(\d+)\.(\d+)\.(\d+)/)
  return match ? match.slice(1, 4).map(Number) : null
}

/**
 * Whether the version a template installed (its package.json spec, e.g.
 * "^5.104.5") satisfies the range the Kit needs (e.g. "^5.104.0"): exact,
 * caret and tilde ranges, compared on the installed spec's lowest version.
 * Unknown spec shapes are given the benefit of the doubt.
 */
export function satisfies(installed, required) {
  const have = parseVersion(installed)
  const need = parseVersion(required)
  if (!have || !need) return true
  const compare = have[0] - need[0] || have[1] - need[1] || have[2] - need[2]
  const operator = String(required).trim()[0]
  if (operator === "^") {
    // npm caret: ^1.2.3 allows <2.0.0, ^0.2.3 allows <0.3.0, ^0.0.3 allows only 0.0.3.
    if (need[0] > 0) return have[0] === need[0] && compare >= 0
    if (need[1] > 0) return have[0] === 0 && have[1] === need[1] && compare >= 0
    return compare === 0
  }
  if (operator === "~") return have[0] === need[0] && have[1] === need[1] && compare >= 0
  return compare === 0
}

/** The template's global stylesheet, from components.json (shadcn's own pointer), else app/globals.css. */
function globalsPath(root) {
  try {
    const css = JSON.parse(readFileSync(join(root, "components.json"), "utf8")).tailwind?.css
    if (css) return join(root, css)
  } catch {}
  return join(root, "app", "globals.css")
}

/** Same rules as kit/theme/contract.ts checkGlobalsCss, for templates that have not run their tests yet. */
function checkGlobals(root) {
  const path = globalsPath(root)
  if (!existsSync(path)) return []
  const css = readFileSync(path, "utf8").replace(/\/\*[\s\S]*?\*\//g, "")
  const problems = []
  if (!/@import\s+["'][^"']*kit\/kit\.css["']/.test(css)) problems.push(`${relative(root, path)} does not import kit/kit.css`)
  if (/--font-heading\s*:/.test(css)) problems.push(`${relative(root, path)} redefines --font-heading, which overrides the Kit's --heading-font. Delete that line (shadcn init writes it) and set --heading-font instead`)
  return problems
}

/** What the Kit needs from the template, from kit/kit.json. Returns problems; empty means fine. */
function checkRequirements(root, framework = DEFAULT_FRAMEWORK) {
  const manifestPath = join(root, "kit", "kit.json")
  if (!existsSync(manifestPath)) return { errors: ["kit/kit.json is missing"], warnings: [] }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"))
  const { requires } = manifest
  const frameworks = frameworksOf(manifest)
  if (!frameworks[framework]) {
    return { errors: [`kit.lock.json names the "${framework}" framework, which this Kit does not support (${Object.keys(frameworks).join(", ")})`], warnings: [] }
  }
  const dependencies = { ...requires.dependencies, ...frameworks[framework].dependencies }
  const errors = []
  const warnings = []
  for (const [file, what] of Object.entries(requires.modules ?? {})) {
    if (!existsSync(join(root, file))) errors.push(`${file} is missing: it ${what}`)
  }
  const missingUi = (requires.ui ?? []).filter((name) => !existsSync(join(root, "components", "ui", `${name}.tsx`)))
  if (missingUi.length) errors.push(`components/ui is missing ${missingUi.join(", ")}. Run: pnpm dlx shadcn@latest add ${missingUi.join(" ")}`)
  const pkgPath = join(root, "package.json")
  const pkg = existsSync(pkgPath) ? JSON.parse(readFileSync(pkgPath, "utf8")) : {}
  const installed = { ...pkg.dependencies, ...pkg.devDependencies }
  for (const [name, range] of Object.entries(dependencies)) {
    if (!installed[name]) errors.push(`package.json lacks ${name} (Kit needs ${range})`)
    else if (!satisfies(installed[name], range)) warnings.push(`${name} is ${installed[name]}, outside the ${range} the Kit was built against`)
  }
  errors.push(...checkGlobals(root))
  return { errors, warnings }
}

function check(root) {
  const lockPath = join(root, LOCK)
  if (!existsSync(lockPath)) {
    console.error(`No ${LOCK}. Run a sync first: node scripts/kit-sync.mjs --ref <tag>`)
    return 1
  }
  const lock = JSON.parse(readFileSync(lockPath, "utf8"))
  const actual = hashes(join(root, "kit"))
  const drift = []
  for (const [file, digest] of Object.entries(lock.files)) {
    if (!actual[file]) drift.push(`deleted   kit/${file}`)
    else if (actual[file] !== digest) drift.push(`modified  kit/${file}`)
  }
  for (const file of Object.keys(actual)) {
    if (!lock.files[file]) drift.push(`added     kit/${file}`)
  }
  const { errors, warnings } = checkRequirements(root, lock.framework ?? DEFAULT_FRAMEWORK)
  for (const warning of warnings) console.warn(`warning: ${warning}`)
  if (drift.length || errors.length) {
    if (drift.length) {
      console.error(`kit/ differs from ${lock.ref} (${lock.commit.slice(0, 7)}). Change the Kit repo and sync instead of editing kit/ here:`)
      for (const line of drift) console.error(`  ${line}`)
    }
    for (const error of errors) console.error(`error: ${error}`)
    return 1
  }
  const edition = lock.framework && lock.framework !== DEFAULT_FRAMEWORK ? `, ${lock.framework} edition` : ""
  console.log(`kit/ matches ${lock.ref} (${lock.commit.slice(0, 7)}${edition}), ${Object.keys(lock.files).length} files.`)
  return 0
}

function sync({ ref, source, root, dryRun, allowUntagged, exclude: excludeArg, framework: frameworkArg }) {
  if (!ref) throw new Error("--ref <tag or commit> is required, e.g. --ref v1.0.0")
  const kitDir = join(root, "kit")
  const lockPath = join(root, LOCK)
  const previous = existsSync(lockPath) ? JSON.parse(readFileSync(lockPath, "utf8")) : null
  const exclude = excludeArg ?? previous?.exclude ?? []
  const framework = frameworkArg ?? previous?.framework ?? DEFAULT_FRAMEWORK
  if (previous && existsSync(kitDir)) {
    const lock = previous
    const actual = hashes(kitDir)
    const edited = [
      ...Object.keys(lock.files).filter((file) => actual[file] && actual[file] !== lock.files[file]),
      ...Object.keys(actual).filter((file) => !lock.files[file]),
    ]
    if (edited.length) {
      throw new Error(`kit/ has local edits that a sync would overwrite (${edited.join(", ")}). Move them to the Kit repo first.`)
    }
  }
  const origin = openSource(source, root)
  try {
    const isTag = (() => {
      try {
        git(origin.dir, "rev-parse", "--verify", "--quiet", `refs/tags/${ref}`)
        return true
      } catch {
        return false
      }
    })()
    if (!isTag && !allowUntagged) {
      throw new Error(`--ref ${ref} is not a tag in ${origin.label}. Sync released tags only (or pass --allow-untagged while testing).`)
    }
    const commit = git(origin.dir, "rev-parse", `${ref}^{commit}`)
    const staging = mkdtempSync(join(tmpdir(), "kit-sync-"))
    try {
      const archive = execFileSync("git", ["archive", "--format=tar", commit, "kit"], { cwd: origin.dir, maxBuffer: 256 * 1024 * 1024 })
      execFileSync("tar", ["-x", "-C", staging], { input: archive })
      applyFramework(join(staging, "kit"), framework)
      if (framework !== DEFAULT_FRAMEWORK) console.log(`Framework: ${framework}.`)
      const self = execFileSync("git", ["show", `${commit}:bin/kit-sync.mjs`], { cwd: origin.dir, encoding: "utf8" })
      const own = join(root, "scripts", "kit-sync.mjs")
      if (existsSync(own) && readFileSync(own, "utf8") !== self) {
        // An older script would vendor this Kit wrongly (before 1.1.0 it copied every framework's adapter), so stop before writing.
        throw new Error(`scripts/kit-sync.mjs differs from ${ref}'s bin/kit-sync.mjs. Copy that one over (cp <dashboard-kit>/bin/kit-sync.mjs scripts/), then sync again.`)
      }
      const patterns = exclude.map(globToRegExp)
      const left = Object.keys(hashes(join(staging, "kit"))).filter((file) => patterns.some((pattern) => pattern.test(file)))
      const protectedFiles = ["kit.json", "framework/index.tsx", "framework/types.ts"].filter((file) => left.includes(file))
      if (protectedFiles.length) throw new Error(`--exclude may not remove ${protectedFiles.join(", ")}: the Kit cannot work without them.`)
      for (const file of left) rmSync(join(staging, "kit", file))
      if (exclude.length) console.log(`Excluding ${left.length} file(s) matching ${exclude.join(", ")}.`)
      const incoming = hashes(join(staging, "kit"))
      const current = hashes(kitDir)
      const added = Object.keys(incoming).filter((file) => !current[file])
      const changed = Object.keys(incoming).filter((file) => current[file] && current[file] !== incoming[file])
      const removed = Object.keys(current).filter((file) => !incoming[file])
      console.log(`${ref} (${commit.slice(0, 7)}) from ${origin.label}: ${added.length} added, ${changed.length} changed, ${removed.length} removed.`)
      for (const file of [...added.map((f) => `+ ${f}`), ...changed.map((f) => `~ ${f}`), ...removed.map((f) => `- ${f}`)]) console.log(`  ${file}`)
      if (dryRun) return 0
      rmSync(kitDir, { recursive: true, force: true })
      mkdirSync(kitDir, { recursive: true })
      cpSync(join(staging, "kit"), kitDir, { recursive: true })
      removeEmptyDirs(kitDir)
      writeFileSync(lockPath, JSON.stringify({ ref, commit, ...(framework !== DEFAULT_FRAMEWORK ? { framework } : {}), ...(exclude.length ? { exclude } : {}), files: incoming }, null, 2) + "\n")
    } finally {
      rmSync(staging, { recursive: true, force: true })
    }
  } finally {
    origin.cleanup()
  }
  const { errors, warnings } = checkRequirements(root, framework)
  for (const warning of warnings) console.warn(`warning: ${warning}`)
  for (const error of errors) console.error(`error: ${error}`)
  if (errors.length) return 1
  console.log(`Wrote kit/ and ${LOCK}. Commit both.`)
  return 0
}

const runAsCli = Boolean(process.argv[1]) && realpathSync(resolve(process.argv[1])) === realpathSync(fileURLToPath(import.meta.url))
if (runAsCli) try {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    console.log(readFileSync(new URL(import.meta.url), "utf8").split("\n").filter((line) => line.startsWith("//")).map((line) => line.slice(3)).join("\n"))
    process.exit(0)
  }
  process.exit(args.check ? check(args.root) : sync(args))
} catch (error) {
  console.error(`kit-sync: ${error.message}`)
  process.exit(1)
}
