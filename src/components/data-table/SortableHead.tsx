import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { TableHead } from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface SortableHeadProps {
  label: string
  active: boolean
  direction: "asc" | "desc"
  onClick: () => void
  align?: "left" | "right"
  className?: string
}

export function SortableHead({ label, active, direction, onClick, align = "left", className }: SortableHeadProps) {
  const Icon = !active ? ArrowUpDown : direction === "asc" ? ArrowUp : ArrowDown

  return (
    <TableHead className={cn(align === "right" && "text-right", className)}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 text-xs font-semibold whitespace-nowrap hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
          align === "right" && "flex-row-reverse"
        )}
      >
        {label}
        <Icon className="size-3" />
      </button>
    </TableHead>
  )
}
