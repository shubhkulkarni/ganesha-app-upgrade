import { signInWithEmailAndPassword, type AuthError } from "firebase/auth"
import { auth, usernameToEmail } from "@/lib/firebase"

interface Credentials {
  username: string
  password: string
}

const INVALID_CREDENTIAL_CODES = new Set([
  "auth/invalid-credential",
  "auth/user-not-found",
  "auth/wrong-password",
  "auth/invalid-email",
])

export async function signInService({ username, password }: Credentials) {
  try {
    const credential = await signInWithEmailAndPassword(auth, usernameToEmail(username), password)
    return credential.user
  } catch (err) {
    const code = (err as AuthError).code
    if (code && INVALID_CREDENTIAL_CODES.has(code)) {
      throw new Error("Invalid username or password")
    }
    throw err
  }
}
