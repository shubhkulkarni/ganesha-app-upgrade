import type { YearOption } from "@/types"

const FIRST_RECORDED_YEAR = 2020
const LEGACY_KEY_YEAR = 2019

/** Years the app has receipt data for, newest first. Derived from the current date instead of a hardcoded list that needed manual updates every year. */
export function getReceiptYears(): YearOption[] {
  const currentYear = new Date().getFullYear()
  const years: YearOption[] = []

  for (let year = currentYear; year >= FIRST_RECORDED_YEAR; year--) {
    years.push({ text: String(year), key: `receipt${year}` })
  }

  years.push({ text: String(LEGACY_KEY_YEAR), key: "receipt" })

  return years
}

export const DELETE_ALL_BARRED_KEYS = ["receipt", "receipt2020", "receipt2021"]
