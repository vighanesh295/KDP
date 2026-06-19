import { User, ShieldAlert } from "lucide-react"

interface ChatMessageProps {
  role: "user" | "assistant"
  content: string
  source?: string
}

export default function ChatMessage({ role, content, source }: ChatMessageProps) {
  const isUser = role === "user"

  return (
    <div className={`flex w-full mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"} items-end gap-3`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${isUser ? "bg-[#3b82f6]" : "bg-[#1e293b] border border-slate-700"}`}>
          {isUser ? (
            <User className="h-5 w-5 text-white" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-[#3b82f6]" />
          )}
        </div>
        
        {/* Message Bubble */}
        <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
          <div className={`px-4 py-3 rounded-2xl ${
            isUser 
              ? "bg-[#3b82f6] text-white rounded-br-none shadow-md" 
              : "bg-[#1e293b] border border-slate-700 text-slate-200 rounded-bl-none shadow-sm"
          }`}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
          </div>
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
