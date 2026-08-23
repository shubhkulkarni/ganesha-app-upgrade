import { Loader2 } from "lucide-react"
import logo from "@/assets/icon.png"

export function Loader() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
      <img src={logo} alt="Shri Tembe Ganesh Mandal" className="h-20 w-20 rounded-full object-cover shadow-md" />
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span className="text-lg font-medium">Loading...</span>
      </div>
    </div>
  )
}
