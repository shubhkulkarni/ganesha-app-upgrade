import type { Donation } from "@/types"

export interface PaymentStats {
  cash: number
  upi: number
  card: number
  other: number
  total: number
  receipts: number
  receivedBySet: Set<string>
}

export interface SummaryRow {
  cash: number
  upi: number
  card: number
  other: number
  total: number
  receipts: number
  receivedByCount: number
}

// Rounded explicitly: AnimatedNumber renders intermediate eased (non-integer)
// values while counting up, and toLocaleString alone would leak that as
// fractional rupees (e.g. "Rs. 4,45,214.609") on any mid-animation frame.
export const money = (value: number) => `Rs. ${Math.round(value || 0).toLocaleString("en-IN")}`

export const getEmptyStats = (): PaymentStats => ({
  cash: 0,
  upi: 0,
  card: 0,
  other: 0,
  total: 0,
  receipts: 0,
  receivedBySet: new Set(),
})

export const addPayment = (stats: PaymentStats, item: Donation) => {
  const amount = Number(item.amount || 0)
  const payment = String(item.payment || "").toLowerCase()

  if (payment === "cash") stats.cash += amount
  else if (payment === "upi") stats.upi += amount
  else if (payment === "card") stats.card += amount
  else stats.other += 1

  stats.total += amount
  stats.receipts += 1
  stats.receivedBySet.add(item.receivedBy || "Unknown")
}

export const toSummaryRow = (stats: PaymentStats): SummaryRow => ({
  cash: stats.cash,
  upi: stats.upi,
  card: stats.card,
  other: stats.other,
  total: stats.total,
  receipts: stats.receipts,
  receivedByCount: stats.receivedBySet.size,
})
