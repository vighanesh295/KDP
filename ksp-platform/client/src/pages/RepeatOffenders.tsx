import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { useAuth } from "@/lib/authStore"
import { fetchRepeatOffenders } from "@/lib/api"

interface RepeatOffender {
  name: string
  total_cases: number
  crime_types: string[]
  districts: string[]
  first_seen: string
  last_seen: string
  age: number | string | null
}

export default function RepeatOffenders() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [offenders, setOffenders] = useState<RepeatOffender[]>([])
  const [search, setSearch] = useState("")
  const [sortAscending, setSortAscending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOffenders() {
      try {
        setIsLoading(true)
        setError(null)
        const result = await fetchRepeatOffenders(token)
        setOffenders(result || [])
      } catch (err: any) {
        setError(err.message || "Failed to load repeat offenders")
      } finally {
        setIsLoading(false)
      }
    }

    loadOffenders()
  }, [token])

  const filteredOffenders = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    return offenders
      .filter((offender) => {
        if (!normalized) return true
        const matchesName = offender.name.toLowerCase().includes(normalized)
        const matchesDistrict = offender.districts.some((district) => district.toLowerCase().includes(normalized))
        return matchesName || matchesDistrict
      })
      .sort((a, b) => {
        if (sortAscending) {
          return a.total_cases - b.total_cases
        }
        return b.total_cases - a.total_cases
      })
  }, [offenders, search, sortAscending])

  return (
    <DashboardLayout title="Repeat Offenders">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-700 bg-[#111827] p-6 shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Repeat Offenders</p>
              <h2 className="text-2xl font-semibold text-white">Persons with multiple FIRs</h2>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or district"
                className="rounded-2xl border border-slate-700 bg-[#0f172a] px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600"
              />
              <button
                type="button"
                onClick={() => setSortAscending((prev) => !prev)}
                className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-100 hover:bg-slate-700"
              >
                Sort by cases: {sortAscending ? "Ascending" : "Descending"}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-700 bg-[#111827] p-4 overflow-auto shadow-lg">
          {error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
              {error}
            </div>
          ) : (
            <Table className="min-w-full border-separate border-spacing-0">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Total Cases</TableHead>
                  <TableHead>Crime Types</TableHead>
                  <TableHead>Districts</TableHead>
                  <TableHead>First Seen</TableHead>
                  <TableHead>Last Seen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-slate-400">
                      Loading repeat offenders...
                    </TableCell>
                  </TableRow>
                ) : filteredOffenders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-slate-400">
                      No repeat offenders match your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOffenders.map((offender) => (
                    <TableRow
                      key={offender.name}
                      className="cursor-pointer"
                      onClick={() => navigate(`/network/${encodeURIComponent(offender.name)}`)}
                    >
                      <TableCell className="font-medium text-slate-100">{offender.name}</TableCell>
                      <TableCell>{offender.total_cases}</TableCell>
                      <TableCell className="max-w-[260px] truncate text-slate-300">{offender.crime_types.join(", ")}</TableCell>
                      <TableCell className="max-w-[220px] truncate text-slate-300">{offender.districts.join(", ")}</TableCell>
                      <TableCell>{offender.first_seen}</TableCell>
                      <TableCell>{offender.last_seen}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
