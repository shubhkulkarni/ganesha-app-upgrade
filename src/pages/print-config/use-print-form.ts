import { useCallback, useEffect, useState } from "react"
import type { PrintConfig, PrintFieldPosition } from "@/types"

export function usePrintForm(initial: PrintConfig) {
  const [form, setForm] = useState(initial)
  const [isFormChanged, setIsFormChanged] = useState(false)

  // `initial` arrives from a Zustand store hydrated by an async fetch, so on
  // first mount it's often still the fallback default and updates a moment
  // later. Re-sync once that real value lands, but only before the admin has
  // started editing — never clobber in-progress unsaved changes.
  useEffect(() => {
    if (!isFormChanged) {
      setForm(initial)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, isFormChanged])

  const changehandler = useCallback(
    (key: keyof PrintConfig, subkey: keyof PrintFieldPosition, value: string) => {
      setIsFormChanged(true)
      setForm((prev) => ({
        ...prev,
        [key]: { ...prev[key], [subkey]: Number(value) },
      }))
    },
    []
  )

  return { form, changehandler, isFormChanged, setIsFormChanged }
}
