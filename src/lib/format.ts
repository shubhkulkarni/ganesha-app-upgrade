export function formattedDate(dateStr: string | Date): string {
  const d = new Date(dateStr)
  return [d.getDate(), d.getMonth() + 1, d.getFullYear()]
    .map((n) => (n < 10 ? `0${n}` : `${n}`))
    .join("/")
}

export function getTotal(arr: { amount: number }[]): number {
  if (arr.length) return arr.map((i) => i.amount).reduce((a, b) => a + b)
  return 0
}

export function getIndianNumber(num: number): string {
  return num.toFixed(1).replace(/(\d)(?=(\d{2})+\d\.)/g, "$1,")
}

const WORDS = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
  "Eighteen", "Nineteen", "Twenty",
]
WORDS[30] = "Thirty"
WORDS[40] = "Forty"
WORDS[50] = "Fifty"
WORDS[60] = "Sixty"
WORDS[70] = "Seventy"
WORDS[80] = "Eighty"
WORDS[90] = "Ninety"

export function numToWords(amount: number): string {
  const amountStr = amount.toString()
  const number = amountStr.split(".")[0].split(",").join("")
  const nLength = number.length
  let wordsString = ""

  if (nLength <= 9) {
    const nArray = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    const receivedNArray: number[] = []
    for (let i = 0; i < nLength; i++) {
      receivedNArray[i] = Number(number.substr(i, 1))
    }
    for (let i = 9 - nLength, j = 0; i < 9; i++, j++) {
      nArray[i] = receivedNArray[j]
    }
    for (let i = 0, j = 1; i < 9; i++, j++) {
      if (i === 0 || i === 2 || i === 4 || i === 7) {
        if (nArray[i] === 1) {
          nArray[j] = 10 + nArray[j]
          nArray[i] = 0
        }
      }
    }
    let value = 0
    for (let i = 0; i < 9; i++) {
      if (i === 0 || i === 2 || i === 4 || i === 7) {
        value = nArray[i] * 10
      } else {
        value = nArray[i]
      }
      if (value !== 0) {
        wordsString += WORDS[value] + " "
      }
      if ((i === 1 && value !== 0) || (i === 0 && value !== 0 && nArray[i + 1] === 0)) {
        wordsString += "Crores "
      }
      if ((i === 3 && value !== 0) || (i === 2 && value !== 0 && nArray[i + 1] === 0)) {
        wordsString += "Lakhs "
      }
      if ((i === 5 && value !== 0) || (i === 4 && value !== 0 && nArray[i + 1] === 0)) {
        wordsString += "Thousand "
      }
      if (i === 6 && value !== 0 && nArray[i + 1] !== 0 && nArray[i + 2] !== 0) {
        wordsString += "Hundred and "
      } else if (i === 6 && value !== 0) {
        wordsString += "Hundred "
      }
    }
    wordsString = wordsString.split("  ").join(" ")
  }

  return wordsString
}
