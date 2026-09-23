import { useCallback } from "react"
import jsPDF from "jspdf"
import { toast } from "sonner"
import { formattedDate, numToWords } from "@/lib/format"
import { useAppStore } from "@/store/useAppStore"
import { type CanvasFontSources, renderDevanagariText } from "@/lib/pdf/canvas-text"
import {
  containsDevanagari,
  formatMarathiAmount,
  formatMarathiAmountInWords,
  toDevanagariDigits,
} from "@/lib/pdf/marathi-format"
import type { PrintConfig, PrintFieldPosition } from "@/types"
import "@/lib/pdf/mukta-font"

interface ReceiptData {
  receiptNo: string
  name: string
  amount: number | string
  date: unknown
  payment?: string
  otherDonation?: string
}

const FONT_SIZE_PT = 14

type PdfWithVfs = jsPDF & {
  getFileFromVFS?: (fileName: string) => string
}

export function usePdf() {
  const storePrintConfig = useAppStore((s) => s.printConfig)

  return useCallback(
    async (receiptData: ReceiptData, printConfig: PrintConfig = storePrintConfig) => {
      const { name, amount, date, amtText, receiptNo } = printConfig
      // No toggle — driven entirely by what's actually in the Name field on
      // this particular receipt, whether that's a fresh form submission or
      // an existing record being reprinted from Payment History.
      const devanagariMode = containsDevanagari(receiptData.name)

      const data = {
        ...receiptData,
        amount: Number(receiptData.amount),
        numInWords: numToWords(Number(receiptData.amount)),
        date: JSON.stringify(receiptData.date).includes("/")
          ? (receiptData.date as string)
          : formattedDate(receiptData.date as string | Date),
      }

      const doc = new jsPDF({ orientation: "portrait", unit: "in", format: "a4" })
      doc.setFontSize(FONT_SIZE_PT)
      doc.setFont("Mukta", "normal")
      const pdfWithVfs = doc as PdfWithVfs
      let canvasFonts: CanvasFontSources | null = null

      const getCanvasFonts = (): CanvasFontSources => {
        if (!canvasFonts) {
          const regular = pdfWithVfs.getFileFromVFS?.("Mukta-Regular.ttf")
          const bold = pdfWithVfs.getFileFromVFS?.("Mukta-Bold.ttf")
          if (!regular || !bold) {
            throw new Error("Mukta font data is not available in jsPDF VFS")
          }
          canvasFonts = { regular, bold }
        }
        return canvasFonts
      }

      // Draw text with jsPDF's plain vector renderer, sized/weighted per that
      // field's own printConfig entry.
      const drawVectorField = (field: PrintFieldPosition, text: string) => {
        doc.setFont("Mukta", field.bold ? "bold" : "normal")
        doc.setFontSize(field.fontSize)
        doc.text(text, field.x, field.y)
      }

      // Draw text via an offscreen canvas instead: the browser's own text
      // engine shapes Devanagari conjuncts/matras correctly (jsPDF's doc.text
      // does a naive 1:1 glyph lookup and can't). Anchors at the same
      // baseline point a doc.text() call would have used.
      const drawShapedField = async (field: PrintFieldPosition, text: string) => {
        const rendered = await renderDevanagariText(text, field.fontSize, { bold: field.bold }, getCanvasFonts())
        doc.addImage(
          rendered.dataUrl,
          "PNG",
          field.x,
          field.y - rendered.baselineOffsetIn,
          rendered.widthIn,
          rendered.heightIn
        )
      }

      const drawField = (field: PrintFieldPosition, text: string) =>
        devanagariMode ? drawShapedField(field, text) : drawVectorField(field, text)

      // Receipt number stays on the vector path unconditionally — it's
      // always a plain Latin/ASCII reference ID and has to keep matching
      // what's searchable in Payment History and the DB, so it never needs
      // Devanagari shaping even when the rest of the receipt does.
      drawVectorField(receiptNo, data.receiptNo)

      const dateText = devanagariMode ? toDevanagariDigits(data.date) : data.date
      await drawField(date, dateText)

      await drawField(name, data.name)

      if (data.payment === "Other") {
        const donationPrefix = devanagariMode ? "देणगी: " : "Donation: "
        await drawField(amount, donationPrefix + data.otherDonation)
      } else if (devanagariMode) {
        await drawField(amount, formatMarathiAmount(data.amount))
        await drawField(amtText, formatMarathiAmountInWords(data.amount))
      } else {
        await drawField(amount, "Rs. " + data.amount.toFixed(2).toString() + " Only")
        await drawField(amtText, data.numInWords + "Rupees Only")
      }

      doc.save(data.receiptNo + "_Receipt.pdf")
      toast.success(data.receiptNo + "_Receipt.pdf", { description: "Receipt is downloading..." })
    },
    [storePrintConfig]
  )
}
