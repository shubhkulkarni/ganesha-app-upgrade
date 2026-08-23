import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedNumberProps {
  value: number
  duration?: number
  formatter?: (value: number) => string
  className?: string
}

const defaultFormatter = (n: number) => Math.round(n).toLocaleString("en-IN")

export function AnimatedNumber({ value, duration = 900, formatter = defaultFormatter, className }: AnimatedNumberProps) {
  // Start every mount counting up from 0 — a number that's already-loaded
  // data (e.g. behind a loading skeleton) should still visibly arrive
  // instead of just appearing, which is what made the count-up invisible
  // in practice: it only animated on later value *changes*, not on mount.
  const [display, setDisplay] = useState(0)
  const fromRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const from = fromRef.current
    const to = value

    if (prefersReducedMotion || from === to) {
      setDisplay(to)
      fromRef.current = to
      return
    }

    const start = performance.now()

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(from + (to - from) * eased)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = to
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [value, duration])

  return (
    <span className={cn("animate-in fade-in zoom-in-95 duration-500", className)}>{formatter(display)}</span>
  )
}
