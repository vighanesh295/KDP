import { useState } from "react"
import { SendHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("")

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim())
      setText("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-[#0f172a] border-t border-slate-800">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message to KSP Copilot..."
        disabled={disabled}
        className="flex-1 bg-[#1e293b] border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-0 focus-visible:border-[#3b82f6]"
      />
      <Button 
        onClick={handleSend} 
        disabled={disabled || !text.trim()}
        className="bg-[#3b82f6] hover:bg-blue-600 text-white h-10 px-4 transition-all"
      >
        <span className="sr-only">Send</span>
        <SendHorizontal className="h-5 w-5" />
      </Button>
    </div>
  )
}
