import type { PrintConfig } from "@/types"

export const DEFAULT_PRINT_CONFIG: PrintConfig = {
  receiptNo: { x: 2.4, y: 2.3, fontSize: 14, bold: false },
  date: { x: 5.8, y: 2.3, fontSize: 14, bold: false },
  name: { x: 2.4, y: 2.67, fontSize: 16, bold: true },
  amount: { x: 2.4, y: 3.07, fontSize: 14, bold: false },
  amtText: { x: 2.4, y: 3.47, fontSize: 14, bold: false },
}

/** Fills in `fontSize`/`bold` (and any other missing keys) per field from the
 * defaults above. Needed because print configs saved to Firebase or
 * localStorage before those fields existed only have `x`/`y` — without this,
 * PDF generation would hit `undefined` font sizes for old saved configs. */
export function mergePrintConfigDefaults(data: Partial<PrintConfig> | null | undefined): PrintConfig {
  const merged = {} as PrintConfig
  for (const key of Object.keys(DEFAULT_PRINT_CONFIG) as (keyof PrintConfig)[]) {
    merged[key] = { ...DEFAULT_PRINT_CONFIG[key], ...data?.[key] }
  }
  return merged
}
