import { useState, useRef, useEffect, useCallback } from "react"
import { jsPDF } from "jspdf"
import ChatMessage from "./ChatMessage"
import ChatInput from "./ChatInput"
import { sendChatMessage } from "../../lib/api"
import { useAuth } from "../../lib/authStore"

interface Attachment {
  name: string
  type: string
  size: number
  path?: string
}

interface Message {
  role: "user" | "assistant"
  content: string
  source?: string
  reasoning?: string
  attachments?: Attachment[]
}

interface ChatSession {
  id: string
  title: string
  createdAt: string
  messages: Message[]
}

const STORAGE_KEY = "ksp_chat_sessions"

const initialAssistantMessage: Message = {
  role: "assistant",
  content: "Hello! I am the KSP Intelligence Copilot. How can I assist you with FIRs or analytics today?",
  reasoning: ""
}

const createSession = (title?: string, messages: Message[] = [initialAssistantMessage]): ChatSession => ({
  id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
  title: title || `New Chat ${new Date().toLocaleString()}`,
  createdAt: new Date().toISOString(),
  messages: [...messages],
})

const getInitialSessions = (): ChatSession[] => {
  if (typeof window === "undefined") {
    return [createSession("New Chat")]
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length && parsed[0]?.messages) {
        return parsed
      }
    }
  } catch {
    // ignore parse errors
  }

  return [createSession("New Chat")]
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} bytes`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

export default function ChatPanel() {
  const { token, user } = useAuth()
  const initialSessions = getInitialSessions()
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions)
  const [activeSessionId, setActiveSessionId] = useState(initialSessions[0].id)
  const [messages, setMessages] = useState<Message[]>(initialSessions[0].messages)
  const [language, setLanguage] = useState<'en' | 'kn'>('en')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isDragActive, setIsDragActive] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const newChat = () => {
    const sessionCount = sessions.length + 1
    const session = createSession(`New Chat ${sessionCount}`)
    setSessions((prev) => [session, ...prev])
    setActiveSessionId(session.id)
    setMessages(session.messages)
    setIsHistoryOpen(false)
  }

  const selectSession = (sessionId: string) => {
    setActiveSessionId(sessionId)
    setIsHistoryOpen(false)
  }

  const activeSession = sessions.find((session) => session.id === activeSessionId) ?? sessions[0]

  useEffect(() => {
    const active = sessions.find((session) => session.id === activeSessionId)
    if (active && active.messages !== messages) {
      setMessages(active.messages)
    }
  }, [activeSessionId, sessions])

  useEffect(() => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === activeSessionId ? { ...session, messages } : session
      )
    )
  }, [messages, activeSessionId])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  }, [sessions])

  const exportConversation = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" })
    const now = new Date()
    const dateLabel = now.toISOString().split("T")[0]
    const timestamp = now.toLocaleString()
    const officerName = user?.name || "Unknown Officer"

    const marginLeft = 40
    const lineHeight = 18
    let cursorY = 60

    doc.setFontSize(16)
    doc.text("KSP Intelligence Assistant — Conversation Log", marginLeft, cursorY)

    doc.setFontSize(10)
    cursorY += lineHeight * 1.5
    doc.text(`Exported: ${timestamp}`, marginLeft, cursorY)
    cursorY += lineHeight
    doc.text(`Officer: ${officerName}`, marginLeft, cursorY)
    cursorY += lineHeight * 1.5

    messages.forEach((message) => {
      const roleLabel = message.role === "user" ? "Officer" : "Assistant"
      const header = `${roleLabel}:`
      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      doc.text(header, marginLeft, cursorY)
      cursorY += lineHeight

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      const contentText = message.content
      const textLines = doc.splitTextToSize(contentText, 520)
      textLines.forEach((line) => {
        if (cursorY > 760) {
          doc.addPage()
          cursorY = 40
        }
        doc.text(line, marginLeft + 10, cursorY)
        cursorY += lineHeight
      })

      if (message.attachments?.length) {
        message.attachments.forEach((attachment) => {
          const attachmentLabel = `Attachment: ${attachment.path || attachment.name}`
          if (cursorY > 760) {
            doc.addPage()
            cursorY = 40
          }
          doc.text(attachmentLabel, marginLeft + 10, cursorY)
          cursorY += lineHeight
        })
      }

      cursorY += lineHeight / 2
      if (cursorY > 760) {
        doc.addPage()
        cursorY = 40
      }
    })

    doc.save(`ksp-conversation-${dateLabel}.pdf`)
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length) {
      setSelectedFiles((prev) => [...prev, ...files])
    }
    e.target.value = ""
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleClearFiles = () => {
    setSelectedFiles([])
  }

  const getFileLabel = (file: File) => {
    return ((file as any).webkitRelativePath || file.name) as string
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragActive(false)
    const files = Array.from(event.dataTransfer.files)
    if (files.length) {
      setSelectedFiles((prev) => [...prev, ...files])
    }
  }

  const handleSend = useCallback(async (text: string) => {
    const trimmedText = text.trim()
    const attachments = selectedFiles.map((file) => ({
      name: file.name,
      type: file.type || "unknown",
      size: file.size,
      path: getFileLabel(file),
    }))

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: trimmedText || "Attached files sent",
        attachments: attachments.length ? attachments : undefined,
      },
    ])
    setIsLoading(true)

    try {
      const data = await sendChatMessage(trimmedText, token, language, selectedFiles)
      const answer = data?.response || data?.answer || data?.reply || "No response received"
      const reasoning = data?.reasoning || ""

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: answer,
          reasoning,
          source: data?.source || (data?.isFallback ? "offline" : undefined),
        },
      ])
      setSelectedFiles([])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error communicating with KSP Copilot.", reasoning: "" },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [language, selectedFiles, token])

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
    <div className="relative flex flex-col h-full w-full max-w-full bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      <input
        type="file"
        multiple
        accept="image/*,.pdf,.txt,.md,.csv,.json,.doc,.docx"
        hidden
        ref={fileInputRef as React.RefObject<HTMLInputElement>}
        onChange={handleFileChange}
        {...({ webkitdirectory: true, directory: true } as any)}
      />

      {/* Header */}
      <div className="bg-[#1e293b] px-6 py-4 border-b border-slate-800 flex flex-col gap-3 md:flex-row md:items-center md:justify-between shadow-sm z-10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
              KSP Copilot
            </h2>
          </div>
          <p className="text-sm text-slate-400">{activeSession.title}</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsHistoryOpen((prev) => !prev)}
              className="text-sm rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-slate-200 hover:bg-slate-700"
            >
              {isHistoryOpen ? 'Hide history' : 'Chat history'}
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`text-sm px-2 py-1 rounded-md ${language === 'en' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
              aria-pressed={language === 'en'}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('kn')}
              className={`text-sm px-2 py-1 rounded-md ${language === 'kn' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
              aria-pressed={language === 'kn'}
            >
              ಕನ್ನಡ
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={exportConversation}
              className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className={`absolute inset-y-0 left-0 z-30 w-full max-w-sm transform bg-[#0b1221] border-r border-slate-700 shadow-2xl transition-transform duration-300 md:relative md:w-80 ${isHistoryOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
            <div>
              <p className="text-sm font-semibold text-white">Chat History</p>
              <p className="text-xs text-slate-400">Saved conversations</p>
            </div>
            <button
              type="button"
              onClick={() => setIsHistoryOpen(false)}
              className="text-slate-400 hover:text-slate-100"
            >
              Close
            </button>
          </div>
          <div className="px-4 py-3 border-b border-slate-800">
            <button
              type="button"
              onClick={newChat}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-left text-sm font-medium text-white hover:bg-slate-800"
            >
              + New chat
            </button>
          </div>
          <div className="overflow-y-auto h-[calc(100vh-14rem)] space-y-2 px-4 py-3">
            {sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => selectSession(session.id)}
                className={`w-full text-left rounded-2xl border px-4 py-3 transition-colors duration-200 ${session.id === activeSessionId ? 'border-slate-500 bg-slate-800 text-white' : 'border-slate-700 bg-[#111827] text-slate-200 hover:bg-slate-900'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium truncate">{session.title}</span>
                  <span className="text-[11px] text-slate-500">{new Date(session.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2">{session.messages[session.messages.length - 1]?.content || 'No messages yet'}</p>
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1 flex flex-col">
          {selectedFiles.length > 0 && (
            <div className="bg-[#0f172a] border-b border-slate-800 px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-100">Attachments</p>
                  <p className="text-xs text-slate-500">Drag additional files here or attach a folder.</p>
                </div>
                <button
                  type="button"
                  onClick={handleClearFiles}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Clear all
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="rounded-xl bg-[#111827] px-4 py-3 flex items-center justify-between gap-4 text-sm text-slate-200">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{getFileLabel(file)}</div>
                      <div className="text-xs text-slate-500">{file.type || 'Unknown type'} · {formatBytes(file.size)}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            className={`flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar ${isDragActive ? 'bg-slate-800/70' : ''}`}
            onDragOver={(event) => {
              event.preventDefault()
              setIsDragActive(true)
            }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={handleDrop}
          >
            {messages.map((msg, index) => (
              <ChatMessage key={index} role={msg.role} content={msg.content} source={msg.source} reasoning={msg.reasoning} attachments={msg.attachments} language={language} />
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

          <ChatInput
            onSend={handleSend}
            disabled={isLoading}
            language={language}
            canSendEmpty={selectedFiles.length > 0}
            onAttach={() => fileInputRef.current?.click()}
          />
        </div>
      </div>
    </div>
  )
}
