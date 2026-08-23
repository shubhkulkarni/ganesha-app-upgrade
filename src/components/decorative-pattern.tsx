import { cn } from "@/lib/utils"

interface DecorativePatternProps {
  className?: string
}

/** A soft rangoli-dot texture that fades out toward the edges — decorative only. */
export function DecorativePattern({ className }: DecorativePatternProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "bg-motif pointer-events-none absolute inset-0 text-primary opacity-[0.08] dark:opacity-[0.14]",
        className
      )}
      style={{
        maskImage: "radial-gradient(ellipse at center, black 0%, transparent 72%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, transparent 72%)",
      }}
    />
  )
}
