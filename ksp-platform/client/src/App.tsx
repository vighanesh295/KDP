import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import Chatbot from "./pages/Chatbot"
import Analytics from "./pages/Analytics"
import StatDetails from "./pages/StatDetails"
import CrimeCategoryDetails from "./pages/CrimeCategoryDetails"
import Login from "./pages/Login"
import AuditTrail from "./pages/AuditTrail"
import NetworkAnalysis from "./pages/NetworkAnalysis"
import RepeatOffenders from "./pages/RepeatOffenders"
import { warmupBackend } from "./lib/warmup"
import { ChatProvider } from "./lib/ChatContext"
import { AuthProvider, ProtectedRoute } from "./lib/authStore"

function App() {
  useEffect(() => {
    warmupBackend();
  }, []);

  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <div className="min-h-screen bg-background text-foreground">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/chatbot" element={<Chatbot />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/network" element={<NetworkAnalysis />} />
                <Route path="/network/:name" element={<NetworkAnalysis />} />
                <Route path="/offenders" element={<RepeatOffenders />} />
                <Route path="/stats/:type" element={<StatDetails />} />
                <Route path="/crime-category/:type" element={<CrimeCategoryDetails />} />
                <Route path="/audit" element={<AuditTrail />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </ChatProvider>
    </AuthProvider>
  )
}

export default App
