import { useMemo, useState } from "react"

type SortDirection = "asc" | "desc"

export function useSortableRows<T>(rows: T[], defaultKey?: keyof T) {
  const [sortKey, setSortKey] = useState<keyof T | undefined>(defaultKey)
  const [direction, setDirection] = useState<SortDirection>("asc")

  const sorted = useMemo(() => {
    if (!sortKey) return rows
    return [...rows].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av === bv) return 0
      if (av === undefined || av === null) return 1
      if (bv === undefined || bv === null) return -1
      const result = av > bv ? 1 : -1
      return direction === "asc" ? result : -result
    })
  }, [rows, sortKey, direction])

  const toggleSort = (key: keyof T) => {
    if (key === sortKey) {
      setDirection((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setDirection("asc")
    }
  }

  return { sorted, sortKey, direction, toggleSort }
}
