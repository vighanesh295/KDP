import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table"
import { useAuth } from "../lib/authStore"
import { fetchAuditLogs } from "../lib/api"

interface AuditEntry {
  timestamp: string
  username: string
  role: string
  endpoint: string
  query: string
  response_summary: string
}

export default function AuditTrail() {
  const { token, user } = useAuth()
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return

    async function loadLogs() {
      try {
        setIsLoading(true)
        const result = await fetchAuditLogs(token)
        setLogs(result.logs || [])
      } catch (err: any) {
        setError(err.message || "Failed to load audit logs")
      } finally {
        setIsLoading(false)
      }
    }

    loadLogs()
  }, [token])

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />
  }

  return (
    <DashboardLayout title="Audit Trail">
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-700 bg-[#111827] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Audit logs</p>
              <h2 className="text-2xl font-semibold text-white">Recent admin activity</h2>
            </div>
            <div className="text-right text-sm text-slate-400">
              {isLoading ? "Refreshing..." : `${logs.length} entries loaded`}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-700 bg-[#111827] p-4 overflow-auto">
          {error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
              {error}
            </div>
          ) : (
            <Table className="min-w-full border-separate border-spacing-0">
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Query</TableHead>
                  <TableHead>Summary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((entry, index) => (
                  <TableRow key={`${entry.timestamp}-${index}`}>
                    <TableCell className="font-medium text-slate-100">
                      {new Date(entry.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{entry.username}</TableCell>
                    <TableCell>{entry.endpoint}</TableCell>
                    <TableCell className="max-w-[240px] truncate text-slate-300">
                      {entry.query}
                    </TableCell>
                    <TableCell className="max-w-[260px] truncate text-slate-300">
                      {entry.response_summary}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption>
                Showing the most recent {logs.length} audit entries.
              </TableCaption>
            </Table>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
