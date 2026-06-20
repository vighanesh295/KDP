import { useState } from "react"
import { User, ShieldAlert, ChevronDown, ChevronUp, Volume2 } from "lucide-react"

interface Attachment {
  name: string
  type: string
  size: number
  path?: string
}

interface ChatMessageProps {
  role: "user" | "assistant"
  content: string
  source?: string
  reasoning?: string
  attachments?: Attachment[]
  language?: 'en' | 'kn'
}

export default function ChatMessage({ role, content, source, reasoning, attachments, language = 'en' }: ChatMessageProps) {
  const isUser = role === "user"
  const [open, setOpen] = useState(false)
  const [playing, setPlaying] = useState(false)
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window

  const handleSpeak = () => {
    if (!supported) return
    try {
      const synth = window.speechSynthesis
      synth.cancel()
      const utter = new SpeechSynthesisUtterance(content)
      utter.lang = language === 'kn' ? 'kn-IN' : 'en-IN'
      utter.onend = () => setPlaying(false)
      utter.onerror = () => setPlaying(false)
      setPlaying(true)
      synth.speak(utter)
    } catch (err) {
      setPlaying(false)
    }
  }

  return (
    <div className={`flex w-full mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"} items-end gap-3`}>
        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${isUser ? "bg-[#3b82f6]" : "bg-[#1e293b] border border-slate-700"}`}>
          {isUser ? (
            <User className="h-5 w-5 text-white" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-[#3b82f6]" />
          )}
        </div>

        <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
          <div className={`px-4 py-3 rounded-2xl ${
            isUser 
              ? "bg-[#3b82f6] text-white rounded-br-none shadow-md" 
              : "bg-[#1e293b] border border-slate-700 text-slate-200 rounded-bl-none shadow-sm"
          }`}>
            <div className="flex items-start gap-2">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
              {!isUser && supported && (
                <button
                  onClick={handleSpeak}
                  aria-pressed={playing}
                  title={playing ? 'Stop playback' : 'Play message'}
                  className="ml-1 text-slate-400 hover:text-slate-200 focus:outline-none"
                >
                  <span className="sr-only">Play message</span>
                  <Volume2 className={`w-4 h-4 ${playing ? 'text-emerald-400' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {attachments && attachments.length > 0 && (
            <div className="mt-2 rounded-xl bg-[#0b1220] border border-slate-800 p-3 text-xs text-slate-300 max-w-[36rem]">
              <div className="mb-2 text-slate-200 font-medium">Attached files</div>
              <ul className="space-y-2">
                {attachments.map((attachment, index) => (
                  <li key={index} className="flex items-center justify-between gap-3">
                    <span className="truncate">{attachment.path || attachment.name}</span>
                    <span className="shrink-0 text-slate-500">{attachment.type || 'file'} · {Math.round(attachment.size / 1024)} KB</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!isUser && reasoning && (
            <div className="mt-2 self-start">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200"
              >
                <span>Why this answer?</span>
                {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {open && (
                <div className="mt-2 rounded-md bg-[#0b1220] border border-slate-800 px-3 py-2 text-xs text-slate-300 max-w-[36rem] whitespace-pre-wrap">
                  {reasoning}
                </div>
              )}
            </div>
          )}

          {source === "offline" && !isUser && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/10 text-orange-500 border border-orange-500/20 mt-1.5 self-start">
              ⚡ Offline Mode
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
