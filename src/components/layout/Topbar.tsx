import { useState, type KeyboardEvent } from "react"
import { Link } from "react-router-dom"
import { signOut } from "firebase/auth"
import { Bell, LogOut, Menu, Search, UserRound } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { getCurrentUser } from "@/lib/auth"
import { auth } from "@/lib/firebase"
import { useAppStore } from "@/store/useAppStore"
import { currentYearKey, usePaymentsQuery } from "@/hooks/use-payments"

const ADMIN_PHRASE = atob("YWRtaW5AMTIzNGRodW5kaGlyYWo=")

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const [searchTxt, setSearchTxt] = useState("")
  const setAdminMode = useAppStore((s) => s.setAdminMode)
  const { data: payments } = usePaymentsQuery(currentYearKey())
  const currentUser = getCurrentUser()
  const year = new Date().getFullYear()

  const onSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTxt === ADMIN_PHRASE) {
      setAdminMode(true)
      toast.warning("Admin mode activated !")
      setSearchTxt("")
    }
  }

  const logoutHandler = () => {
    // AppRouter's onAuthStateChanged listener picks this up and swaps to the login screen.
    signOut(auth)
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 md:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick} aria-label="Open menu">
        <Menu className="size-5" />
      </Button>

      <h1 className="font-devanagari truncate text-base font-semibold text-primary md:text-lg">
        <span className="hidden md:inline">श्री टेंबे गणेशोत्सव {year}</span>
        <span className="md:hidden">गणेशोत्सव {year}</span>
      </h1>

      <div className="ml-auto flex items-center gap-1.5 md:gap-2">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="w-56 pl-8"
            value={searchTxt}
            onChange={(e) => setSearchTxt(e.target.value)}
            onKeyDown={onSearchKeyDown}
          />
        </div>

        <ThemeToggle />

        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-5" />
          {!!payments?.length && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]"
            >
              {payments.length > 99 ? "99+" : payments.length}
            </Badge>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Account menu">
              <UserRound className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="capitalize">{currentUser}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/donate">Donate</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/payment-history">Payment history</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={logoutHandler}>
              <LogOut className="size-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
