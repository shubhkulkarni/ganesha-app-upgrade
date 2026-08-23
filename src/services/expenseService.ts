import { get, push, ref } from "firebase/database"
import { database } from "@/lib/firebase"
import { formattedDate } from "@/lib/format"
import { serializeForFirebase } from "@/lib/firebase-serialize"
import type { Expense } from "@/types"

const currentYear = new Date().getFullYear()

export async function saveExpensesService(data: Record<string, unknown>) {
  const newRef = await push(ref(database, `expenses${currentYear}`), serializeForFirebase(data))
  return { name: newRef.key }
}

export async function loadExpensesService(): Promise<Expense[]> {
  const snapshot = await get(ref(database, `expenses${currentYear}`))
  if (snapshot.exists()) {
    return Object.entries(snapshot.val() as Record<string, any>)
      .reverse()
      .map(([id, item]) => ({ ...item, _id: id, expDate: formattedDate(item.expDate) }))
  }
  return []
}
