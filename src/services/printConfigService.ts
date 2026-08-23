import { get, ref, set } from "firebase/database"
import { database } from "@/lib/firebase"
import { serializeForFirebase } from "@/lib/firebase-serialize"
import type { PrintConfig } from "@/types"

const PRINT_CONFIG_PATH = "printConfig/-O5n9Jygr5FQZMGgPOos"

export async function savePrintConfig(data: PrintConfig) {
  return set(ref(database, PRINT_CONFIG_PATH), serializeForFirebase(data))
}

export async function loadPrintConfig(): Promise<PrintConfig> {
  const snapshot = await get(ref(database, PRINT_CONFIG_PATH))
  return snapshot.val()
}
