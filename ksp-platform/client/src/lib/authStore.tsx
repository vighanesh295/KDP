import { createContext, useContext, useState, type ReactNode } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

type AuthUser = {
  username: string
  role: string
  name: string
} | null

interface AuthContextValue {
  user: AuthUser
  token: string | null
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null)
  const [token, setToken] = useState<string | null>(null)

  const login = async (username: string, password: string) => {
    try {
      const loginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      })

      if (!loginResponse.ok) {
        let detail = `${loginResponse.status} ${loginResponse.statusText}`
        try {
          const body = await loginResponse.json()
          if (body && body.detail) detail = body.detail
        } catch {}
        console.warn("Login failed:", detail)
        return { success: false, error: `Login failed: ${detail}` }
      }

      const loginData = await loginResponse.json()
      const accessToken = loginData.access_token
      if (!accessToken) {
        console.warn("Login response missing access_token")
        return { success: false, error: "Login response missing access_token" }
      }

      const meResponse = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (!meResponse.ok) {
        let detail = `${meResponse.status} ${meResponse.statusText}`
        try {
          const body = await meResponse.json()
          if (body && body.detail) detail = body.detail
        } catch {}
        console.warn("/auth/me failed:", detail)
        return { success: false, error: `/auth/me failed: ${detail}` }
      }

      const userInfo = await meResponse.json()
      setToken(accessToken)
      setUser({
        username: userInfo.username,
        role: userInfo.role,
        name: userInfo.name
      })
      return { success: true }
    } catch (error) {
      console.warn("Login failed", error)
      setToken(null)
      setUser(null)
      return { success: false, error: String(error) }
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

export function ProtectedRoute() {
  const { token } = useAuth()
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
