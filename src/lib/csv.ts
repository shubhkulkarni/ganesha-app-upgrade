interface CsvColumn {
  label: string
  key: string
}

function escapeCsvValue(value: unknown): string {
  const str = String(value ?? "")
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

export function downloadCsv(filename: string, columns: CsvColumn[], rows: Record<string, any>[]) {
  const headerLine = columns.map((c) => escapeCsvValue(c.label)).join(",")
  const lines = rows.map((row) => columns.map((c) => escapeCsvValue(row[c.key])).join(","))
  const csv = [headerLine, ...lines].join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
