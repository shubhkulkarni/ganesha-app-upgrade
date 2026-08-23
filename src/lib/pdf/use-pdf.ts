import { useCallback } from "react"
import jsPDF from "jspdf"
import { toast } from "sonner"
import { formattedDate, numToWords } from "@/lib/format"
import { useAppStore } from "@/store/useAppStore"
import { renderDevanagariText } from "@/lib/pdf/canvas-text"
import {
  containsDevanagari,
  formatMarathiAmount,
  formatMarathiAmountInWords,
  toDevanagariDigits,
} from "@/lib/pdf/marathi-format"
import type { PrintConfig } from "@/types"
import "@/lib/pdf/sarai-font"

interface ReceiptData {
  receiptNo: string
  name: string
  amount: number | string
  date: unknown
  payment?: string
  otherDonation?: string
}

const FONT_SIZE_PT = 14

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
      // Sarai_07 is only registered under the "normal" style (see sarai-font.js).
      // Requesting "400"/"bold" doesn't match that registration and makes jsPDF
      // silently fall back to Times-Roman, which can't render Devanagari glyphs —
      // so keep every call pinned to "normal" to actually use the embedded font.
      doc.setFont("Sarai_07", "normal")

      // Draw text with jsPDF's plain vector renderer — fine for receiptNo/date/
      // amount, which are always Latin/numeric.
      const drawVectorText = (text: string, x: number, y: number) => doc.text(text, x, y)

      // Draw text via an offscreen canvas instead: the browser's own text
      // engine shapes Devanagari conjuncts/matras correctly (jsPDF's doc.text
      // does a naive 1:1 glyph lookup and can't). Anchors at the same
      // baseline point a doc.text() call would have used.
      const drawShapedText = async (text: string, x: number, y: number) => {
        const rendered = await renderDevanagariText(text, FONT_SIZE_PT)
        doc.addImage(rendered.dataUrl, "PNG", x, y - rendered.baselineOffsetIn, rendered.widthIn, rendered.heightIn)
      }

      const drawText = devanagariMode ? drawShapedText : drawVectorText

      // Receipt number stays a plain Latin/ASCII reference ID either way — it
      // has to keep matching what's searchable in Payment History and the DB.
      doc.text(data.receiptNo, receiptNo.x, receiptNo.y)

      const dateText = devanagariMode ? toDevanagariDigits(data.date) : data.date
      await drawText(dateText, date.x, date.y)

      await drawText(data.name, name.x, name.y)

      if (data.payment === "Other") {
        const donationPrefix = devanagariMode ? "देणगी: " : "Donation: "
        await drawText(donationPrefix + data.otherDonation, amount.x, amount.y)
      } else if (devanagariMode) {
        await drawText(formatMarathiAmount(data.amount), amount.x, amount.y)
        await drawText(formatMarathiAmountInWords(data.amount), amtText.x, amtText.y)
      } else {
        doc.text("Rs. " + data.amount.toFixed(2).toString() + " Only", amount.x, amount.y)
        doc.text(data.numInWords + "Rupees Only", amtText.x, amtText.y)
      }

      doc.save(data.receiptNo + "_Receipt.pdf")
      toast.success(data.receiptNo + "_Receipt.pdf", { description: "Receipt is downloading..." })
    },
    [storePrintConfig]
  )
}
