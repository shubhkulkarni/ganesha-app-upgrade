import { get, ref } from "firebase/database"
import { database } from "@/lib/firebase"
import { formattedDate } from "@/lib/format"
import type { Donation } from "@/types"

const currentYear = new Date().getFullYear()

export async function fetchPayments(year = `receipt${currentYear}`): Promise<Donation[]> {
  const snapshot = await get(ref(database, year))

  if (snapshot.exists()) {
    return Object.entries(snapshot.val() as Record<string, any>)
      .reverse()
      .map(([id, item]) => ({
        ...item,
        _id: id,
        date: formattedDate(item.date),
      }))
  }

  return []
}
