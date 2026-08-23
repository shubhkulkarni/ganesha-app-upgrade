import { create } from "zustand"
import { DEFAULT_PRINT_CONFIG } from "@/lib/pdf/print-config-defaults"
import type { PrintConfig } from "@/types"

/**
 * Firebase restores the signed-in session asynchronously (it reads IndexedDB),
 * so there's a brief window on load where auth is neither confirmed true nor
 * false. Routing on a bare boolean during that window caused a real bug
 * (deep link → flash "unauthenticated" → redirected to /login → bounced to
 * /donate before the real state arrived). "checking" lets the router hold on
 * a loader instead of guessing.
 */
export type AuthStatus = "checking" | "authenticated" | "unauthenticated"

interface AppState {
  authStatus: AuthStatus
  adminMode: boolean
  printConfig: PrintConfig
  setAuthStatus: (status: AuthStatus) => void
  setAdminMode: (adminMode: boolean) => void
  setPrintConfig: (config: PrintConfig) => void
}

export const useAppStore = create<AppState>((set) => ({
  authStatus: "checking",
  adminMode: false,
  printConfig: DEFAULT_PRINT_CONFIG,
  setAuthStatus: (authStatus) => set({ authStatus }),
  setAdminMode: (adminMode) => set({ adminMode }),
  setPrintConfig: (printConfig) => set({ printConfig }),
}))
