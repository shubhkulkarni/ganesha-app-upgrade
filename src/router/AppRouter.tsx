import { Suspense, lazy, useEffect } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import { toast } from "sonner"
import { Loader } from "@/components/loader"
import { AppShell } from "@/components/layout/AppShell"
import { auth } from "@/lib/firebase"
import { loadPrintConfig } from "@/services/printConfigService"
import { mergePrintConfigDefaults } from "@/lib/pdf/print-config-defaults"
import { useAppStore } from "@/store/useAppStore"

const LoginPage = lazy(() => import("@/pages/login/LoginPage"))
const DonatePage = lazy(() => import("@/pages/donate/DonatePage"))
const PaymentHistoryPage = lazy(() => import("@/pages/payment-history/PaymentHistoryPage"))
const ExpensesPage = lazy(() => import("@/pages/expenses/ExpensesPage"))
const PrintConfigPage = lazy(() => import("@/pages/print-config/PrintConfigPage"))
const StatisticsPage = lazy(() => import("@/pages/statistics/StatisticsPage"))
const ContactPage = lazy(() => import("@/pages/contact/ContactPage"))

const PRINT_CONFIG_STORAGE_KEY = "printConfig"

export function AppRouter() {
  const authStatus = useAppStore((s) => s.authStatus)
  const setAuthStatus = useAppStore((s) => s.setAuthStatus)
  const setPrintConfig = useAppStore((s) => s.setPrintConfig)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthStatus(user ? "authenticated" : "unauthenticated")
    })
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Security Rules require a signed-in user, so this can only run once
    // auth has actually resolved — firing it on the login screen would just
    // fail with permission-denied.
    if (authStatus !== "authenticated") return

    loadPrintConfig()
      .then((data) => {
        setPrintConfig(data)
        localStorage.setItem(PRINT_CONFIG_STORAGE_KEY, JSON.stringify(data))
      })
      .catch(() => {
        const cached = localStorage.getItem(PRINT_CONFIG_STORAGE_KEY)
        if (cached) {
          setPrintConfig(mergePrintConfigDefaults(JSON.parse(cached)))
        } else {
          toast.error("Error loading print config. Refresh the page to try again")
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus])

  if (authStatus === "checking") {
    return <Loader />
  }

  if (authStatus === "unauthenticated") {
    return (
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    )
  }

  return (
    <AppShell>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/payment-history" element={<PaymentHistoryPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/receipt-print-config" element={<PrintConfigPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/donate" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  )
}
