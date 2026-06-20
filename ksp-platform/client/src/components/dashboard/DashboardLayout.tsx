import type { ReactNode } from "react"
import emblemImage from "../../assets/karnataka-emblem.jpg"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle, X } from "lucide-react"
import ChatPanel from "@/components/chatbot/ChatPanel"
import { useChat } from "@/lib/ChatContext"
import { useAuth } from "../../lib/authStore"

interface DashboardLayoutProps {
  children: ReactNode
  title: string
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { isChatOpen, openChat, closeChat } = useChat()
  const { user, logout } = useAuth()

  const navLinks = [
    { name: "Dashboard", path: "/" },
    { name: "Chatbot", path: "/chatbot" },
    { name: "Analytics", path: "/analytics" },
    { name: "Network Analysis", path: "/network" },
    { name: "Repeat Offenders", path: "/offenders" },
    ...(user?.role === "admin" ? [{ name: "Audit Trail", path: "/audit" }] : []),
  ]

  return (
    <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 lg:w-[240px] bg-[#1e293b] flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden border-r border-slate-700">
        <div className="py-4 flex flex-col items-center justify-center border-b border-slate-700 gap-2">
          <div className="bg-white rounded-full p-1 w-8 h-8 flex items-center justify-center shadow-lg">
            <img src={emblemImage} alt="Karnataka Emblem" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-bold tracking-widest text-slate-100 lg:block hidden uppercase">KSP</span>
        </div>
        <nav className="flex-1 py-6 px-2 lg:px-4 space-y-2">
          {navLinks.map((link) => {
            // Highlight exact match for root, or prefix match for section routes
            const isActive = link.path === "/" ? location.pathname === "/" : location.pathname.startsWith(link.path)
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center justify-center lg:justify-start px-2 lg:px-4 py-3 rounded-md transition-colors duration-200 ${
                  isActive 
                    ? "bg-[#3b82f6] text-white font-medium shadow-md" 
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
                title={link.name}
              >
                <span className="lg:hidden font-bold text-center">{link.name.charAt(0)}</span>
                <span className="hidden lg:block">{link.name}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-[#1e293b] border-b border-slate-700 flex items-center justify-between px-4 lg:px-8 flex-shrink-0">
          <h1 className="text-lg lg:text-xl font-semibold tracking-wide truncate">{title}</h1>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-emerald-400 border-emerald-400/50 bg-emerald-400/10 gap-2 px-3 py-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
              Live
            </Badge>
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium text-slate-100">{`${user?.name || "Unknown User"}`}</span>
              <span className="text-xs text-slate-400">{`${user?.role || "Unknown Role"}`}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => { logout(); navigate('/login') }}>
              Logout
            </Button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </main>
      </div>

      {/* Floating Ask AI Button */}
      <button
        onClick={() => openChat()}
        className={`fixed bottom-8 right-8 w-14 h-14 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-full shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] transition-all transform hover:scale-105 z-40 flex items-center justify-center ${
          isChatOpen ? "opacity-0 pointer-events-none translate-y-4" : "opacity-100 translate-y-0"
        }`}
        aria-label="Ask AI"
      >
        <MessageCircle className="w-7 h-7" />
      </button>

      {/* Chat Panel - Integrated into flex layout to push content */}
      <div
        className={`flex-shrink-0 bg-[#0f172a] transition-all duration-300 ease-in-out border-slate-700 overflow-hidden flex flex-col z-50 ${
          isChatOpen ? "w-full md:w-[380px] border-l absolute md:relative right-0 h-full" : "w-0 border-l-0"
        }`}
      >
        <div className="relative w-full md:w-[380px] h-full flex flex-col">
          <button
            onClick={() => closeChat()}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-[60]"
            aria-label="Close Chat"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex-1 h-full overflow-hidden [&>div]:h-full [&>div]:max-w-none [&>div]:border-none [&>div]:shadow-none [&>div]:rounded-none pt-2">
            <ChatPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
