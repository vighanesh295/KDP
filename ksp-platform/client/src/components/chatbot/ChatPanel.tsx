import { useState, useRef, useEffect, useCallback } from "react"
import ChatMessage from "./ChatMessage"
import ChatInput from "./ChatInput"
import { sendChatMessage } from "../../lib/api"

interface Message {
  role: "user" | "assistant"
  content: string
  source?: string
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I am the KSP Intelligence Copilot. How can I assist you with FIRs or analytics today?" }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSend = useCallback(async (text: string) => {
    // Add user message
    setMessages(prev => [...prev, { role: "user", content: text }])
    setIsLoading(true)

    try {
      const data = await sendChatMessage(text)
      setMessages(prev => [
        ...prev, 
        { 
          role: "assistant", 
          content: data.response || data.reply || "No response received",
          source: data.source || (data.isFallback ? "offline" : undefined)
        }
      ])
    } catch {
      setMessages(prev => [
        ...prev, 
        { role: "assistant", content: "Error communicating with KSP Copilot." }
      ])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const handleExternalMessage = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        handleSend(customEvent.detail)
      }
    }
    window.addEventListener("open-chat-with-message", handleExternalMessage)
    return () => window.removeEventListener("open-chat-with-message", handleExternalMessage)
  }, [handleSend])

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] w-full max-w-4xl mx-auto bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-[#1e293b] px-6 py-4 border-b border-slate-800 flex items-center justify-between shadow-sm z-10">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
          KSP Copilot
        </h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar">
        {messages.map((msg, index) => (
          <ChatMessage key={index} role={msg.role} content={msg.content} source={msg.source} />
        ))}
        
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#1e293b] border border-slate-700 flex items-center justify-center">
                <span className="w-2 h-2 bg-[#3b82f6] rounded-full animate-pulse"></span>
              </div>
              <div className="px-4 py-3 rounded-2xl bg-[#1e293b] border border-slate-700 rounded-bl-none flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  )
}
