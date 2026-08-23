import { useCallback, useEffect } from "react"
import { Eye, Save } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePdf } from "@/lib/pdf/use-pdf"
import { savePrintConfig } from "@/services/printConfigService"
import { useAppStore } from "@/store/useAppStore"
import { usePrintForm } from "./use-print-form"
import type { PrintConfig } from "@/types"

// Devanagari mode isn't a toggle — it's auto-detected from whatever's in the
// Name field on the actual receipt. Two sample names here so calibration can
// still be previewed both ways without needing a real Marathi-named donation.
const englishSampleData = {
  receiptNo: "TGM/24/00001",
  name: "Test Name",
  amount: 1000,
  date: new Date(),
  payment: "Cash" as const,
  mobile: "8975384733",
  otherDonation: "Test Donation",
}

const marathiSampleData = {
  ...englishSampleData,
  name: "चाचणी नाव",
  otherDonation: "चाचणी देणगी",
}

const FIELD_LABELS: { key: keyof PrintConfig; label: string }[] = [
  { key: "receiptNo", label: "Receipt No." },
  { key: "date", label: "Date" },
  { key: "name", label: "Name" },
  { key: "amount", label: "Amount / Donation Description" },
  { key: "amtText", label: "Amount Text" },
]

export default function PrintConfigPage() {
  const storePrintConfig = useAppStore((s) => s.printConfig)
  const setPrintConfig = useAppStore((s) => s.setPrintConfig)
  const { form, changehandler, isFormChanged, setIsFormChanged } = usePrintForm(storePrintConfig)
  const generatePdf = usePdf()

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }
    if (isFormChanged) window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isFormChanged])

  const onPreviewEnglish = useCallback(() => {
    generatePdf(englishSampleData, form)
  }, [form, generatePdf])

  const onPreviewMarathi = useCallback(() => {
    generatePdf(marathiSampleData, form)
  }, [form, generatePdf])

  const onSubmit = useCallback(async () => {
    const code = prompt("Enter admin code to save this setting")
    if (code !== "admin123") return alert("Invalid code")
    const consent = window.confirm(
      "Are you sure you want to save this setting? Caution: Your old setting cannot be recovered."
    )
    if (!consent) return

    setPrintConfig(form)
    localStorage.setItem("printConfig", JSON.stringify(form))
    try {
      await savePrintConfig(form)
      setIsFormChanged(false)
      toast.success("Print configuration saved")
    } catch {
      toast.error("Error saving print config")
    }
  }, [form, setPrintConfig, setIsFormChanged])

  return (
    <div className="mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-500">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Receipt print configuration</CardTitle>
          <CardDescription>
            Tune where each field prints on the physical receipt template, in inches from the top-left corner.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {FIELD_LABELS.map(({ key, label }) => (
            <div key={key} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{label} Horizontal</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    value={form[key].x}
                    onChange={(e) => changehandler(key, "x", e.target.value)}
                    className="pr-12"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
                    inch
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{label} Vertical</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    value={form[key].y}
                    onChange={(e) => changehandler(key, "y", e.target.value)}
                    className="pr-12"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
                    inch
                  </span>
                </div>
              </div>
            </div>
          ))}

          <div className="rounded-lg border p-4">
            <Label>Devanagari mode</Label>
            <p className="mt-1 text-sm text-muted-foreground">
              No toggle needed — a receipt automatically prints in Marathi (correctly shaped conjuncts, Devanagari
              numerals, translated amount) whenever the donor's Name contains any Devanagari script, even mixed
              with English. A plain English name prints exactly as before.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" onClick={onPreviewEnglish} className="flex-1 sm:flex-none">
              <Eye className="size-4" />
              Preview (English name)
            </Button>
            <Button variant="outline" onClick={onPreviewMarathi} className="flex-1 sm:flex-none">
              <Eye className="size-4" />
              Preview (Marathi name)
            </Button>
            <Button onClick={onSubmit} className="flex-1 sm:flex-none">
              <Save className="size-4" />
              Save setting
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
