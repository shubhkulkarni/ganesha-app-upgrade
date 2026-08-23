import { ref, remove } from "firebase/database"
import { database } from "@/lib/firebase"

export async function deleteData(year: string, id?: string) {
  const path = id ? `${year}/${id}` : year
  return remove(ref(database, path))
}
