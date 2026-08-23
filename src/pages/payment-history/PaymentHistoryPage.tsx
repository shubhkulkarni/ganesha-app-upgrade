import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Download, RefreshCcw, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SortableHead } from "@/components/data-table/SortableHead"
import { AnimatedNumber } from "@/components/animated-number"
import { usePaymentsQuery, currentYearKey } from "@/hooks/use-payments"
import { deleteData } from "@/services/deleteService"
import { usePdf } from "@/lib/pdf/use-pdf"
import { getIndianNumber, getTotal } from "@/lib/format"
import { downloadCsv } from "@/lib/csv"
import { useSortableRows } from "@/lib/use-sortable-rows"
import { getReceiptYears, DELETE_ALL_BARRED_KEYS } from "@/lib/years"
import { useAppStore } from "@/store/useAppStore"
import { cn } from "@/lib/utils"
import type { Donation } from "@/types"

const CSV_COLUMNS = [
  { label: "Receipt no.", key: "receiptNo" },
  { label: "Fullname", key: "name" },
  { label: "Amount", key: "amount" },
  { label: "Mobile", key: "mobile" },
  { label: "Date", key: "date" },
  { label: "Payment mode", key: "payment" },
  { label: "Received By", key: "receivedBy" },
  { label: "Donation description", key: "otherDonation" },
]

export default function PaymentHistoryPage() {
  const years = getReceiptYears()
  const [recordYear, setRecordYear] = useState(currentYearKey())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<"selected" | "all" | null>(null)
  const generatePdf = usePdf()
  const queryClient = useQueryClient()
  const adminMode = useAppStore((s) => s.adminMode)
  const setAdminMode = useAppStore((s) => s.setAdminMode)

  const { data: payments = [], isLoading, isFetching, refetch } = usePaymentsQuery(recordYear)
  const { sorted, sortKey, direction, toggleSort } = useSortableRows<Donation>(payments, "date")

  const total = getTotal(payments)

  const exportHandler = () => {
    downloadCsv(`donation_${new Date().toISOString().slice(0, 10)}.csv`, CSV_COLUMNS, payments)
  }

  const onDeleteSelected = async () => {
    if (!selectedId) return
    try {
      await deleteData(recordYear, selectedId)
      await queryClient.invalidateQueries({ queryKey: ["payments", recordYear] })
      setSelectedId(null)
      toast.success("Record deleted")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error deleting record")
    }
    setConfirmAction(null)
  }

  const onDeleteAll = async () => {
    if (DELETE_ALL_BARRED_KEYS.includes(recordYear)) {
      toast.error("'Delete all' option is disabled for this year!")
      setConfirmAction(null)
      return
    }
    try {
      await deleteData(recordYear)
      await queryClient.invalidateQueries({ queryKey: ["payments", recordYear] })
      toast.success("All records deleted")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error deleting records")
    }
    setConfirmAction(null)
  }

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-500">
      <Card>
        <CardContent className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div>
              <p className="font-display text-3xl font-semibold tabular-nums">
                <AnimatedNumber value={total} formatter={getIndianNumber} />{" "}
                <span className="text-lg font-medium text-muted-foreground">₹</span>
              </p>
              <p className="text-xs text-muted-foreground">Total collection for selected year</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCcw className={cn("size-4", isFetching && "animate-spin")} />
              {isFetching ? "Refreshing..." : "Refresh"}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={recordYear} onValueChange={setRecordYear}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y.key} value={y.key}>
                    {y.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="secondary" onClick={exportHandler}>
              <Download className="size-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>

        {adminMode && payments.length > 0 && (
          <CardContent className="flex flex-wrap gap-2 border-t pt-4">
            <Button variant="destructive" size="sm" disabled={!selectedId} onClick={() => setConfirmAction("selected")}>
              <Trash2 className="size-4" />
              Delete selected record
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setConfirmAction("all")}>
              <Trash2 className="size-4" />
              Delete all in {recordYear.replace("receipt", "") || "2019"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAdminMode(false)}>
              Exit to Normal Mode
            </Button>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardContent className="py-4">
          <p className="mb-3 rounded-full bg-primary/10 px-4 py-1.5 text-center text-xs font-semibold text-primary sm:text-sm">
            Double click on any record to download the PDF receipt
          </p>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !payments.length ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No records found for this year.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHead label="Receipt No." active={sortKey === "receiptNo"} direction={direction} onClick={() => toggleSort("receiptNo")} />
                    <SortableHead label="Fullname" active={sortKey === "name"} direction={direction} onClick={() => toggleSort("name")} />
                    <SortableHead label="Amount" active={sortKey === "amount"} direction={direction} onClick={() => toggleSort("amount")} align="right" />
                    <SortableHead label="Date" active={sortKey === "date"} direction={direction} onClick={() => toggleSort("date")} />
                    <SortableHead label="Mobile" active={sortKey === "mobile"} direction={direction} onClick={() => toggleSort("mobile")} />
                    <SortableHead label="Payment mode" active={sortKey === "payment"} direction={direction} onClick={() => toggleSort("payment")} />
                    <SortableHead label="Received By" active={sortKey === "receivedBy"} direction={direction} onClick={() => toggleSort("receivedBy")} />
                    <SortableHead label="Donation description" active={sortKey === "otherDonation"} direction={direction} onClick={() => toggleSort("otherDonation")} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((row) => (
                    <TableRow
                      key={row._id}
                      data-selected={selectedId === row._id}
                      className={cn("cursor-pointer", selectedId === row._id && "bg-accent")}
                      onClick={() => setSelectedId((prev) => (prev === row._id ? null : row._id))}
                      onDoubleClick={() => generatePdf(row)}
                    >
                      <TableCell className="font-medium whitespace-nowrap">{row.receiptNo}</TableCell>
                      <TableCell className="whitespace-nowrap">{row.name}</TableCell>
                      <TableCell className="text-right tabular-nums whitespace-nowrap">{row.amount}</TableCell>
                      <TableCell className="whitespace-nowrap">{row.date}</TableCell>
                      <TableCell className="whitespace-nowrap">{row.mobile}</TableCell>
                      <TableCell className="whitespace-nowrap">{row.payment}</TableCell>
                      <TableCell className="whitespace-nowrap">{row.receivedBy}</TableCell>
                      <TableCell className="whitespace-nowrap">{row.otherDonation}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirmAction !== null} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "all"
                ? `This will permanently delete all records for ${recordYear.replace("receipt", "") || "2019"}. This operation cannot be reverted.`
                : "This will permanently delete this record. This operation cannot be reverted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={confirmAction === "all" ? onDeleteAll : onDeleteSelected}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
