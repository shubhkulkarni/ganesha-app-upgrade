import { Card, CardContent } from "@/components/ui/card"
import { AnimatedNumber } from "@/components/animated-number"
import { cn } from "@/lib/utils"

const TONE_STYLES: Record<string, string> = {
  total: "bg-primary",
  cash: "bg-emerald-500",
  upi: "bg-blue-500",
  receipts: "bg-muted-foreground",
}

const TONE_TINT: Record<string, string> = {
  total: "from-primary/20",
  cash: "from-emerald-500/20",
  upi: "from-blue-500/20",
  receipts: "from-muted",
}

interface SummaryCardProps {
  label: string
  value: number
  formatter?: (value: number) => string
  tone: "total" | "cash" | "upi" | "receipts"
  compact?: boolean
}

export function SummaryCard({ label, value, formatter, tone, compact }: SummaryCardProps) {
  return (
    <Card
      className={cn(
        "card-lift animate-in fade-in slide-in-from-bottom-2 relative overflow-hidden bg-gradient-to-br to-transparent py-0 duration-500",
        TONE_TINT[tone]
      )}
    >
      <div className={cn("absolute top-0 left-0 h-full w-1", TONE_STYLES[tone])} />
      <CardContent className={cn("py-4 pl-5", compact && "py-3.5")}>
        <p className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">{label}</p>
        <AnimatedNumber
          value={value}
          formatter={formatter}
          className="font-display mt-1.5 block text-2xl font-semibold tabular-nums"
        />
      </CardContent>
    </Card>
  )
}
