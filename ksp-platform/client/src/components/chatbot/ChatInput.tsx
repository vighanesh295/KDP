import { useState, useEffect, useRef } from "react"
import { SendHorizontal, Mic, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
  language?: 'en' | 'kn'
  canSendEmpty?: boolean
  onAttach?: () => void
}

export default function ChatInput({ onSend, disabled, language = 'en', canSendEmpty = false, onAttach }: ChatInputProps) {
  const [text, setText] = useState("")
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef<any | null>(null)

  const handleSend = () => {
    const trimmed = text.trim()
    if ((!trimmed && !canSendEmpty) || disabled) {
      return
    }
    onSend(trimmed)
    setText("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSupported(false)
      return
    }
    setSupported(true)
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch {}
        recognitionRef.current = null
      }
    }
  }, [])

  const startRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return
    const recognition = new SpeechRecognition()
    recognition.lang = language === 'kn' ? 'kn-IN' : 'en-IN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      try {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join(' ')
        setText(transcript)
      } catch (err) {
        // ignore
      }
    }

    recognition.onend = () => {
      setListening(false)
      recognitionRef.current = null
    }

    recognition.onerror = () => {
      setListening(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
      setListening(true)
    } catch (err) {
      setListening(false)
      recognitionRef.current = null
    }
  }

  const stopRecognition = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
      recognitionRef.current = null
    }
    setListening(false)
  }

  const handleMicClick = () => {
    if (!supported) return
    if (listening) stopRecognition()
    else startRecognition()
  }

  const canSend = text.trim().length > 0 || canSendEmpty

  return (
    <div className="flex items-center gap-3 p-4 bg-[#0f172a] border-t border-slate-800">
      <div className="flex items-center gap-2 flex-1">
        {onAttach && (
          <button
            type="button"
            onClick={onAttach}
            title="Attach files"
            className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#1f2937] text-slate-200 hover:bg-slate-700 focus:outline-none transition-colors"
          >
            <span className="sr-only">Attach files</span>
            <PlusCircle className="h-5 w-5" />
          </button>
        )}

        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message to KSP Copilot..."
          disabled={disabled}
          className="flex-1 bg-[#1e293b] border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-0 focus-visible:border-[#3b82f6]"
        />

        {supported && (
          <button
            type="button"
            onClick={handleMicClick}
            aria-pressed={listening}
            title={listening ? 'Stop recording' : 'Start voice input'}
            className={`inline-flex relative items-center justify-center h-10 w-10 rounded-md bg-[#1f2937] text-white hover:bg-slate-700 focus:outline-none transition-colors ${listening ? 'ring-2 ring-red-600' : ''}`}>
            <span className="sr-only">Toggle microphone</span>
            <Mic className="h-5 w-5" />
            {listening && (
              <span className="absolute right-3 top-3 block h-2 w-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true"></span>
            )}
          </button>
        )}
      </div>
      <Button
        onClick={handleSend}
        disabled={disabled || !canSend}
        className="bg-[#3b82f6] hover:bg-blue-600 text-white h-10 px-4 transition-all"
      >
        <span className="sr-only">Send</span>
        <SendHorizontal className="h-5 w-5" />
      </Button>
    </div>
  )
}
