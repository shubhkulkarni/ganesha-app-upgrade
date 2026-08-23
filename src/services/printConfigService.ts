import { get, ref, set } from "firebase/database"
import { database } from "@/lib/firebase"
import { serializeForFirebase } from "@/lib/firebase-serialize"
import { mergePrintConfigDefaults } from "@/lib/pdf/print-config-defaults"
import type { PrintConfig } from "@/types"

const PRINT_CONFIG_PATH = "printConfig/-O5n9Jygr5FQZMGgPOos"

export async function savePrintConfig(data: PrintConfig) {
  return set(ref(database, PRINT_CONFIG_PATH), serializeForFirebase(data))
}

export async function loadPrintConfig(): Promise<PrintConfig> {
  const snapshot = await get(ref(database, PRINT_CONFIG_PATH))
  // Configs saved before fontSize/bold existed only have x/y — fill in the
  // rest from defaults so PDF generation never hits an undefined font size.
  return mergePrintConfigDefaults(snapshot.val())
}
