import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import Chatbot from "./pages/Chatbot"
import Analytics from "./pages/Analytics"
import StatDetails from "./pages/StatDetails"
import CrimeCategoryDetails from "./pages/CrimeCategoryDetails"
import { warmupBackend } from "./lib/warmup"
import { ChatProvider } from "./lib/ChatContext"

function App() {
  useEffect(() => {
    warmupBackend();
  }, []);

  return (
    <ChatProvider>
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/stats/:type" element={<StatDetails />} />
            <Route path="/crime-category/:type" element={<CrimeCategoryDetails />} />
          </Routes>
        </div>
      </Router>
    </ChatProvider>
  )
}

export default App
