import { useCallback, useEffect, useRef, useState } from "react"
import { Mic, Square } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type VoiceLang = "mr-IN" | "en-IN"

interface VoiceInputButtonProps {
  /** The field's current value, so a recording session starts from what's
   * already typed instead of overwriting it. */
  value: string
  /** Called live, on every interim AND final recognition update, with the
   * full replacement value (existing text + this session's transcript so
   * far) — not just once at the end. */
  onChange: (value: string) => void
  className?: string
}

/** Compact tap-to-speak control meant to sit inside an input as a trailing
 * icon (see DonationForm's Name field). Renders nothing at all if the
 * browser doesn't support SpeechRecognition — the input it sits in keeps
 * working as a plain text field either way. */
export function VoiceInputButton({ value, onChange, className }: VoiceInputButtonProps) {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  // Shown in its own always-on-top caption bubble below the input — a
  // guaranteed-visible readout of what's being heard, independent of
  // whatever's happening in the (possibly narrow, possibly obscured) field
  // itself.
  const [liveTranscript, setLiveTranscript] = useState("")
  const [lang, setLang] = useState<VoiceLang>("mr-IN")
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const baseValueRef = useRef("")
  const finalTranscriptRef = useRef("")
  // Keep the latest field value available inside the closures below without
  // having to recreate the recognition instance every keystroke.
  const valueRef = useRef(value)
  valueRef.current = value

  useEffect(() => {
    setSupported(!!(window.SpeechRecognition ?? window.webkitSpeechRecognition))
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const startListening = useCallback(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!Ctor) return

    const recognition = new Ctor()
    recognition.lang = lang
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    baseValueRef.current = valueRef.current
    finalTranscriptRef.current = ""
    setLiveTranscript("")

    recognition.onstart = () => setListening(true)
    recognition.onend = () => {
      setListening(false)
      setLiveTranscript("")
    }
    recognition.onerror = (event) => {
      setListening(false)
      setLiveTranscript("")
      if (event.error === "no-speech" || event.error === "aborted") return
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        toast.error("Microphone access denied")
      } else {
        toast.error("Voice input failed — try typing instead")
      }
    }
    recognition.onresult = (event) => {
      let interimTranscript = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0]?.transcript ?? ""
        if (result.isFinal) {
          finalTranscriptRef.current += transcript
        } else {
          interimTranscript += transcript
        }
      }
      const sessionText = (finalTranscriptRef.current + interimTranscript).trim()
      setLiveTranscript(sessionText)
      const combined = baseValueRef.current
        ? sessionText
          ? `${baseValueRef.current} ${sessionText}`
          : baseValueRef.current
        : sessionText
      onChange(combined)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [lang, onChange])

  if (!supported) return null

  return (
    <div className={cn("relative flex items-center gap-1", className)}>
      <button
        type="button"
        onClick={() => setLang((prev) => (prev === "mr-IN" ? "en-IN" : "mr-IN"))}
        className="rounded px-1 text-[10px] font-medium text-muted-foreground hover:bg-accent"
        aria-label="Toggle voice input language"
        tabIndex={-1}
      >
        {lang === "mr-IN" ? "MR" : "EN"}
      </button>
      <button
        type="button"
        onClick={listening ? stopListening : startListening}
        aria-label={listening ? "Stop listening" : "Speak name"}
        tabIndex={-1}
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full transition-colors",
          listening
            ? "animate-pulse bg-destructive text-destructive-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
      >
        {listening ? <Square className="size-3" fill="currentColor" /> : <Mic className="size-3.5" />}
      </button>

      {listening && (
        <div
          role="status"
          className="absolute top-full right-0 z-50 mt-1.5 min-w-48 rounded-lg border border-destructive/30 bg-popover px-3 py-2 text-sm text-popover-foreground shadow-lg"
        >
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-destructive uppercase">
            <span className="size-1.5 animate-pulse rounded-full bg-destructive" />
            Listening…
          </div>
          {liveTranscript || <span className="text-muted-foreground">Say the name now</span>}
        </div>
      )}
    </div>
  )
}
