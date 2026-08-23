import { auth, emailToUsername } from "@/lib/firebase"

export function getCurrentUser(): string {
  const email = auth.currentUser?.email
  return email ? emailToUsername(email) : "Unknown"
}
