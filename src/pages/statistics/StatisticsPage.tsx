import { useMemo, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePaymentsQuery, currentYearKey } from "@/hooks/use-payments"
import { getReceiptYears } from "@/lib/years"
import { SummaryCard } from "./SummaryCard"
import { addPayment, getEmptyStats, money, toSummaryRow } from "./stats"

export default function StatisticsPage() {
  const years = getReceiptYears()
  const [recordYear, setRecordYear] = useState(currentYearKey())
  const [selectedDate, setSelectedDate] = useState("")
  const { data: payments = [], isLoading } = usePaymentsQuery(recordYear)

  const dashboardSummary = useMemo(() => {
    const stats = getEmptyStats()
    payments.forEach((item) => addPayment(stats, item))
    return toSummaryRow(stats)
  }, [payments])

  const dateSummary = useMemo(() => {
    const map: Record<string, ReturnType<typeof getEmptyStats>> = {}
    payments.forEach((item) => {
      if (!map[item.date]) map[item.date] = getEmptyStats()
      addPayment(map[item.date], item)
    })
    return Object.entries(map).map(([date, stats]) => ({ date, ...toSummaryRow(stats) }))
  }, [payments])

  const chartData = useMemo(
    () => dateSummary.map((row) => ({ date: row.date, Total: row.total })).slice(-14),
    [dateSummary]
  )

  const selectedDateRows = useMemo(
    () => payments.filter((item) => item.date === selectedDate),
    [payments, selectedDate]
  )

  const selectedDateSummary = useMemo(() => {
    const stats = getEmptyStats()
    selectedDateRows.forEach((item) => addPayment(stats, item))
    return toSummaryRow(stats)
  }, [selectedDateRows])

  const receivedBySummary = useMemo(() => {
    const map: Record<string, ReturnType<typeof getEmptyStats>> = {}
    selectedDateRows.forEach((item) => {
      const receivedBy = item.receivedBy || "Unknown"
      if (!map[receivedBy]) map[receivedBy] = getEmptyStats()
      addPayment(map[receivedBy], item)
    })
    return Object.entries(map).map(([receivedBy, stats]) => ({ receivedBy, ...toSummaryRow(stats) }))
  }, [selectedDateRows])

  const selectedYearText = recordYear.replace("receipt", "") || "2019"

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-500">
      <Card>
        <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-display text-xl">Collection Statistics</CardTitle>
            <CardDescription className="mt-1">Date wise collection with received by breakup</CardDescription>
          </div>
          <Select
            value={recordYear}
            onValueChange={(v) => {
              setSelectedDate("")
              setRecordYear(v)
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y.key} value={y.key}>
                  {y.text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard label="Total Collection" value={dashboardSummary.total} formatter={money} tone="total" />
        <SummaryCard label="Cash" value={dashboardSummary.cash} formatter={money} tone="cash" />
        <SummaryCard label="UPI" value={dashboardSummary.upi} formatter={money} tone="upi" />
        <SummaryCard label="Receipts" value={dashboardSummary.receipts} tone="receipts" />
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="space-y-2 py-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : !selectedDate ? (
        <>
          {chartData.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent collection trend</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} width={40} />
                    <Tooltip formatter={(v) => money(Number(v))} />
                    <Bar dataKey="Total" fill="#ea7c1f" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Date Wise Collection</CardTitle>
                <CardDescription>Showing {selectedYearText} collection grouped by date</CardDescription>
              </div>
              <Badge variant="secondary">{dateSummary.length} days</Badge>
            </CardHeader>
            <CardContent>
              {!dateSummary.length ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No donation records found for {selectedYearText}
                </p>
              ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Cash</TableHead>
                        <TableHead className="text-right">UPI</TableHead>
                        <TableHead className="text-right">Card</TableHead>
                        <TableHead className="text-right">Other</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Receipts</TableHead>
                        <TableHead className="text-right">Received By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dateSummary.map((row) => (
                        <TableRow key={row.date} className="cursor-pointer" onClick={() => setSelectedDate(row.date)}>
                          <TableCell className="font-semibold whitespace-nowrap">{row.date}</TableCell>
                          <TableCell className="text-right whitespace-nowrap text-emerald-600 dark:text-emerald-400">{money(row.cash)}</TableCell>
                          <TableCell className="text-right whitespace-nowrap text-blue-600 dark:text-blue-400">{money(row.upi)}</TableCell>
                          <TableCell className="text-right whitespace-nowrap">{money(row.card)}</TableCell>
                          <TableCell className="text-right whitespace-nowrap">{row.other}</TableCell>
                          <TableCell className="text-right font-semibold whitespace-nowrap">{money(row.total)}</TableCell>
                          <TableCell className="text-right whitespace-nowrap">{row.receipts}</TableCell>
                          <TableCell className="text-right whitespace-nowrap">{row.receivedByCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => setSelectedDate("")}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <div>
              <CardTitle className="text-base">{selectedDate} Collection</CardTitle>
              <CardDescription>Received by wise breakup for selected date</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <SummaryCard label="Date Total" value={selectedDateSummary.total} formatter={money} tone="total" compact />
              <SummaryCard label="Cash" value={selectedDateSummary.cash} formatter={money} tone="cash" compact />
              <SummaryCard label="UPI" value={selectedDateSummary.upi} formatter={money} tone="upi" compact />
              <SummaryCard label="Receipts" value={selectedDateSummary.receipts} tone="receipts" compact />
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Received By</TableHead>
                    <TableHead className="text-right">Cash</TableHead>
                    <TableHead className="text-right">UPI</TableHead>
                    <TableHead className="text-right">Card</TableHead>
                    <TableHead className="text-right">Other</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Receipts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receivedBySummary.map((row) => (
                    <TableRow key={row.receivedBy}>
                      <TableCell className="font-semibold whitespace-nowrap">{row.receivedBy}</TableCell>
                      <TableCell className="text-right whitespace-nowrap text-emerald-600 dark:text-emerald-400">{money(row.cash)}</TableCell>
                      <TableCell className="text-right whitespace-nowrap text-blue-600 dark:text-blue-400">{money(row.upi)}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{money(row.card)}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{row.other}</TableCell>
                      <TableCell className="text-right font-semibold whitespace-nowrap">{money(row.total)}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{row.receipts}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
