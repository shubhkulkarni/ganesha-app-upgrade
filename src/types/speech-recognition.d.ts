// TypeScript's lib.dom.d.ts already declares SpeechRecognitionEvent,
// SpeechRecognitionErrorEvent, SpeechRecognitionResult(List), and
// SpeechRecognitionAlternative (they're referenced by other DOM APIs) — but
// NOT the main SpeechRecognition interface or the window constructors,
// since the Web Speech API itself is still non-standard. Only what's
// actually missing is declared here to avoid duplicate-identifier conflicts.

interface SpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

declare const SpeechRecognition: {
  prototype: SpeechRecognition
  new (): SpeechRecognition
}

interface Window {
  SpeechRecognition?: typeof SpeechRecognition
  webkitSpeechRecognition?: typeof SpeechRecognition
}
