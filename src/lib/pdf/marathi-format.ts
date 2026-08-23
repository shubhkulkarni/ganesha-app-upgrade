// Locale-specific subpath import — the bare "to-words" package export bundles
// all 135 locales, which bloated this app's PDF chunk from ~740KB to ~1.5MB.
import { ToWords } from "to-words/mr-IN"

const toWordsMarathi = new ToWords()

const DEVANAGARI_DIGITS = "०१२३४५६७८९"

/** True if `text` contains any Devanagari script character — even mixed
 * with English, e.g. "Ramesh रमेश". Used to auto-detect whether a receipt
 * should print in Marathi, driven entirely by what's in the Name field. */
export function containsDevanagari(text: string): boolean {
  return /[ऀ-ॿ]/.test(text)
}

/** Transliterates ASCII digits 0-9 to Devanagari digits — leaves everything
 * else (slashes, punctuation) untouched. Used for receipt dates, not the
 * receipt number, which stays a plain searchable/matchable ID. */
export function toDevanagariDigits(text: string): string {
  return text.replace(/[0-9]/g, (d) => DEVANAGARI_DIGITS[Number(d)])
}

/** "₹1,200" style figure, in Devanagari numerals with Indian grouping. */
function formatDevanagariRupees(amount: number): string {
  return new Intl.NumberFormat("mr-IN-u-nu-deva").format(Math.round(amount))
}

/** e.g. "रु. १,२०० फक्त" — whole-rupee amounts only (this app never deals in paise). */
export function formatMarathiAmount(amount: number): string {
  return `रु. ${formatDevanagariRupees(amount)} फक्त`
}

/** e.g. "एक हजार दोनशे रुपये फक्त". The mr-IN locale's built-in "only" text is
 * intentionally blank (see to-words' Locale config), so फक्त is appended here. */
export function formatMarathiAmountInWords(amount: number): string {
  const words = toWordsMarathi.convert(Math.round(amount), {
    currency: true,
    ignoreZeroCurrency: true,
  })
  return `${words} फक्त`
}
