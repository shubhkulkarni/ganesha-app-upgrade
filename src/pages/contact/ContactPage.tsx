import underConstruction from "@/assets/underConstruction.svg"
import { DecorativePattern } from "@/components/decorative-pattern"

export default function ContactPage() {
  return (
    <div className="relative flex h-full animate-in fade-in flex-col items-center justify-center gap-6 overflow-hidden rounded-xl py-16 text-center duration-500">
      <DecorativePattern className="text-primary" />
      <img src={underConstruction} alt="Under construction" className="relative w-full max-w-sm" />
      <h1 className="font-display relative text-xl font-semibold sm:text-3xl">
        Under Construction. Coming soon.
      </h1>
    </div>
  )
}
