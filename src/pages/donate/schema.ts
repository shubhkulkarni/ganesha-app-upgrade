import { z } from "zod"

export const donationSchema = z
  .object({
    receiptNo: z.string().min(1),
    date: z.date({ error: "Date is required" }),
    name: z.string().trim().min(1, "Name is required"),
    amount: z.string().optional(),
    otherDonation: z.string().optional(),
    mobile: z.string().optional(),
    payment: z.enum(["Cash", "UPI", "Card", "Other"], { error: "Payment mode is required" }),
  })
  .superRefine((data, ctx) => {
    if (data.payment === "Other") {
      if (!data.otherDonation?.trim()) {
        ctx.addIssue({ code: "custom", message: "Donation description is required", path: ["otherDonation"] })
      }
    } else if (!data.amount?.trim()) {
      ctx.addIssue({ code: "custom", message: "Amount is required", path: ["amount"] })
    }

    if (data.mobile?.trim() && (data.mobile.length !== 10 || Number.isNaN(Number(data.mobile)))) {
      ctx.addIssue({ code: "custom", message: "Mobile no. is invalid", path: ["mobile"] })
    }
  })

export type DonationFormValues = z.infer<typeof donationSchema>

export function getReceiptNo(latest?: { receiptNo: string }): string {
  const currentYear = new Date().getFullYear()
  const yr = String(currentYear).slice(-2)
  if (!latest) return `TGM/${yr}/00001`

  const parts = latest.receiptNo.split("/")
  const last = Number(parts[parts.length - 1])
  const padding = String(last + 1).padStart(5, "0")
  return `TGM/${yr}/${padding}`
}
