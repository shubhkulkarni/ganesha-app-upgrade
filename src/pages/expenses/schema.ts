import { z } from "zod"

export const expenseSchema = z.object({
  expDescription: z.string().trim().min(1, "Expense description is required"),
  expAmount: z
    .string()
    .trim()
    .min(1, "Amount is required")
    .refine((v) => Number(v) > 0, "Amount must be greater than 0"),
  depositor: z.string().trim().min(1, "Depositor details are required"),
  recepient: z.string().trim().min(1, "Recepient details are required"),
  expDate: z.date({ error: "Date is required" }),
})

export type ExpenseFormValues = z.infer<typeof expenseSchema>

export const emptyExpense = (): ExpenseFormValues => ({
  expDescription: "",
  expAmount: "",
  depositor: "",
  recepient: "",
  expDate: new Date(),
})
