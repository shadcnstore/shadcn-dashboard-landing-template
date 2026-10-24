/** Download rows as a CSV file. Values are quoted so commas and quotes survive. */
export function downloadCsv(filename: string, header: string[], rows: (string | number | null)[][]): void {
  const quote = (value: string | number | null) => {
    const text = value === null ? "" : String(value)
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  const body = [header, ...rows].map((row) => row.map(quote).join(",")).join("\n")
  const url = URL.createObjectURL(new Blob([body], { type: "text/csv;charset=utf-8" }))
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
