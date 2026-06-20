import { useState } from "react"
import emblemImage from "../assets/karnataka-emblem.jpg"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../lib/authStore"

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token, login } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/"

  if (token) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    const result = await login(username.trim(), password)
    if (result?.success) {
      navigate(from, { replace: true })
    } else {
      setError(result?.error || "Invalid credentials")
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/30">
        <div className="text-center mb-8">
          <div className="bg-white rounded-full p-3 w-24 h-24 flex items-center justify-center shadow-lg mx-auto mb-4">
            <img src={emblemImage} alt="Karnataka State Emblem" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-semibold">KARNATAKA STATE POLICE</h1>
          <p className="mt-2 text-sm text-slate-400">⚜️ SATYAMEVA JAYATE ⚜️</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-300">Username</label>
            <input
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              placeholder="Officer123"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}
