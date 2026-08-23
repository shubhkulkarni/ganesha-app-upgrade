export type PaymentMode = "Cash" | "UPI" | "Card" | "Other"

export interface Donation {
  _id: string
  receiptNo: string
  name: string
  amount: number
  date: string
  payment: PaymentMode | ""
  mobile: string
  otherDonation: string
  receivedBy: string
}

export interface DonationDraft {
  name: string
  amount: string
  date: Date | null
  payment: PaymentMode | ""
  mobile: string
  receiptNo: string
  otherDonation: string
}

export interface Expense {
  _id: string
  expDescription: string
  expAmount: number
  expDate: string
  depositor: string
  recepient: string
}

export interface ExpenseDraft {
  expDescription: string
  expAmount: number | string
  expDate: Date | null
  depositor: string
  recepient: string
}

export interface PrintFieldPosition {
  x: number
  y: number
}

export interface PrintConfig {
  name: PrintFieldPosition
  amount: PrintFieldPosition
  date: PrintFieldPosition
  amtText: PrintFieldPosition
  receiptNo: PrintFieldPosition
}

export interface YearOption {
  text: string
  key: string
}
