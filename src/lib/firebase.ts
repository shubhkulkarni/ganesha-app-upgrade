import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getDatabase } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyAaeEaZJ84E-GVJCoTtJSTdbqTgpwLQYlc",
  authDomain: "tembeganesha.firebaseapp.com",
  databaseURL: "https://tembeganesha.firebaseio.com",
  projectId: "tembeganesha",
  storageBucket: "tembeganesha.firebasestorage.app",
  messagingSenderId: "705791517305",
  appId: "1:705791517305:web:af6454dd8666d3c8152aa8",
}

export const firebaseApp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const database = getDatabase(firebaseApp)

/** Firebase email/password auth needs an email; the app's identity is a bare username. */
export const AUTH_EMAIL_DOMAIN = "tembeganesha-mandal.app"

export function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${AUTH_EMAIL_DOMAIN}`
}

export function emailToUsername(email: string): string {
  return email.split("@")[0]
}
