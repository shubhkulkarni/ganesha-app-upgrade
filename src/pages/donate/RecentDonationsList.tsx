import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePdf } from "@/lib/pdf/use-pdf"
import type { Donation } from "@/types"

interface RecentDonationsListProps {
  donations: Donation[]
}

export function RecentDonationsList({ donations }: RecentDonationsListProps) {
  const generatePdf = usePdf()

  if (!donations.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No donations recorded yet.</p>
  }

  return (
    <ul className="divide-y">
      {donations.slice(0, 10).map((item) => (
        <li key={item.receiptNo} className="flex items-center justify-between gap-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium sm:text-base">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.date}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <span className="text-sm font-semibold">{item.amount} ₹</span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Download receipt"
              onClick={() => generatePdf(item)}
            >
              <Download className="size-4 text-emerald-600 dark:text-emerald-400" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
