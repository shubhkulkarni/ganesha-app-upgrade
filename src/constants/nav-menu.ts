import {
  HandCoins,
  ClipboardCheck,
  Wallet,
  Printer,
  BarChart3,
  Mail,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  path: string
  icon: LucideIcon
}

export const NAV_MENU: NavItem[] = [
  { title: "Donate", path: "/donate", icon: HandCoins },
  { title: "Payment History", path: "/payment-history", icon: ClipboardCheck },
  { title: "Expenses", path: "/expenses", icon: Wallet },
  { title: "Print configuration", path: "/receipt-print-config", icon: Printer },
  { title: "Statistics", path: "/statistics", icon: BarChart3 },
  { title: "Contact", path: "/contact", icon: Mail },
]
