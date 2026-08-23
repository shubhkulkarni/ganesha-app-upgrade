import { push, ref } from "firebase/database"
import { database } from "@/lib/firebase"
import { serializeForFirebase } from "@/lib/firebase-serialize"

const currentYear = new Date().getFullYear()

export async function createDonation(data: Record<string, unknown>) {
  const newRef = await push(ref(database, `receipt${currentYear}`), serializeForFirebase(data))
  return { name: newRef.key }
}
