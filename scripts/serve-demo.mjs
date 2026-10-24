// Serves the static demo build (`out/`) exactly the way demo.shadcnstore.com
// does, so detail pages can be tested locally before deploying:
//
//   DEMO_BUILD=1 pnpm build && node scripts/serve-demo.mjs
//   open http://localhost:4173/chronicle/
//
// Resolution order matches nginx: the file, then `.html`, then `/index.html`,
// then the placeholder page for dynamic routes (`<route>/_`), then 404.
import { createServer } from "node:http"
import { readFile, stat } from "node:fs/promises"
import { extname, join, normalize } from "node:path"
import { gzipSync } from "node:zlib"

const ROOT = join(process.cwd(), "out")
const BASE = "/chronicle"
const PORT = Number(process.env.PORT ?? 4173)

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".txt": "text/x-component",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
}

async function isFile(path) {
  try {
    return (await stat(path)).isFile()
  } catch {
    return false
  }
}

/** The same rewrite the nginx vhost applies for dynamic routes. */
export function placeholderFor(path) {
  // /orders/1042/__next._full.txt -> /orders/_/__next._full.txt
  const segment = path.match(/^(.*\/)[^/]+(\/__next\.[^/]+\.txt)$/)
  if (segment) {
    return `${segment[1]}_${segment[2]}`
  }
  // /orders/1042, /orders/1042.txt, /orders/1042.html -> /orders/_...
  const page = path.match(/^(.*\/)[^/.]+(\.txt|\.html)?$/)
  if (page) {
    return `${page[1]}_${page[2] ?? ".html"}`
  }
  return null
}

async function resolve(path) {
  const candidates = [path, `${path}.html`, join(path, "index.html")]
  const placeholder = placeholderFor(path)
  if (placeholder) {
    candidates.push(placeholder)
  }
  for (const candidate of candidates) {
    const file = normalize(join(ROOT, candidate))
    if (file.startsWith(ROOT) && (await isFile(file))) {
      return file
    }
  }
  return null
}

createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost")
  if (!url.pathname.startsWith(BASE)) {
    response.writeHead(302, { location: `${BASE}/` }).end()
    return
  }
  const path = decodeURIComponent(url.pathname.slice(BASE.length)) || "/"
  const file = await resolve(path)
  if (!file) {
    const notFound = join(ROOT, "404.html")
    response.writeHead(404, { "content-type": TYPES[".html"], "x-robots-tag": "noindex, follow" })
    response.end((await isFile(notFound)) ? await readFile(notFound) : "Not found")
    return
  }
  // Compressed like the nginx vhost (gzip on for HTML, CSS, JS, JSON, SVG), so Lighthouse runs here match production.
  const type = TYPES[extname(file)] ?? "application/octet-stream"
  const body = await readFile(file)
  const gzip = /gzip/.test(request.headers["accept-encoding"] ?? "") && /html|css|javascript|json|svg|component/.test(type)
  response.writeHead(200, {
    "content-type": type,
    "x-robots-tag": "noindex, follow",
    ...(gzip ? { "content-encoding": "gzip", vary: "Accept-Encoding" } : {}),
  })
  response.end(gzip ? gzipSync(body) : body)
}).listen(PORT, () => {
  console.log(`Demo at http://localhost:${PORT}${BASE}/`)
})
