import { NavLink } from "react-router-dom"
import { NAV_MENU } from "@/constants/nav-menu"
import { Badge } from "@/components/ui/badge"
import { DecorativePattern } from "@/components/decorative-pattern"
import { cn } from "@/lib/utils"
import { currentYearKey, usePaymentsQuery } from "@/hooks/use-payments"
import logo from "@/assets/icon.png"

interface NavContentProps {
  onNavigate?: () => void
}

export function NavContent({ onNavigate }: NavContentProps) {
  const { data: payments } = usePaymentsQuery(currentYearKey())

  return (
    <div className="relative flex h-full flex-col">
      <div className="relative overflow-hidden border-b border-sidebar-border/60 bg-gradient-to-br from-primary/10 to-transparent">
        <DecorativePattern className="text-primary" />
        <div className="relative flex items-center gap-3 px-5 py-6">
          <img
            src={logo}
            alt="Shri Tembe Ganesh Mandal"
            className="h-11 w-11 rounded-full object-cover shadow-sm ring-2 ring-primary/20"
          />
          <div className="min-w-0">
            <p className="font-display truncate text-sm font-semibold text-sidebar-foreground">
              Tembe Ganesh Mandal
            </p>
            <p className="text-xs text-muted-foreground">Donation Manager</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-3">
        {NAV_MENU.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-all duration-150 hover:translate-x-0.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive &&
                    "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                )
              }
            >
              <span className="flex items-center gap-3">
                <Icon className="size-4.5 shrink-0" />
                {item.title}
              </span>
              {item.title === "Payment History" && !!payments?.length && (
                <Badge variant="destructive" className="rounded-full px-1.5 text-[10px]">
                  {payments.length > 999 ? "999+" : payments.length}
                </Badge>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="px-5 py-4 text-xs text-muted-foreground">version 3.0.1</div>
    </div>
  )
}
