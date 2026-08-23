/**
 * The Firebase Realtime Database SDK does NOT auto-convert `Date` objects
 * the way `axios` used to (axios calls `JSON.stringify`, which calls
 * `Date.prototype.toJSON` → an ISO string, for free). `push()`/`set()` see a
 * `Date` as neither a primitive nor a plain object and silently drop that
 * key entirely — no error, no write failure, just a field that's missing
 * forever. That's exactly what happened to `date`/`expDate` on every
 * donation and expense submitted after the migration off axios.
 *
 * Run every payload through this before writing so any `Date` — now or in
 * a field added later — gets serialized instead of silently vanishing.
 */
export function serializeForFirebase<T>(value: T): T {
  if (value instanceof Date) {
    return value.toISOString() as unknown as T
  }
  if (Array.isArray(value)) {
    return value.map((item) => serializeForFirebase(item)) as unknown as T
  }
  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {}
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      result[key] = serializeForFirebase(entry)
    }
    return result as T
  }
  return value
}
