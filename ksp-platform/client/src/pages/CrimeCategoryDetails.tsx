import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, MapPin, ShieldCheck, FileSearch, TrendingUp } from "lucide-react"
import { fetchCrimeCategoryDetails } from "@/lib/api"
import { useAuth } from "../lib/authStore"
import { demoDashboardData } from "@/data/demoData"

interface CrimeCategoryData {
  crime_type: string
  total_cases: number
  open_cases: number
  under_investigation: number
  closed_cases: number
  monthly_trend: { month: string; count: number }[]
  districts: { district: string; count: number }[]
  ipc_breakdown: { ipc_section: string; count: number }[]
  patterns: string[]
  sample_firs: {
    fir_number: string
    district: string
    date: string
    status: string
    ipc_section: string
    station: string
  }[]
}

const emptyData: CrimeCategoryData = {
  crime_type: "Unknown",
  total_cases: 0,
  open_cases: 0,
  under_investigation: 0,
  closed_cases: 0,
  monthly_trend: [],
  districts: [],
  ipc_breakdown: [],
  patterns: ["No detail data available."],
  sample_firs: []
}

function toCrimeType(raw: string | undefined) {
  if (!raw) return "Unknown"
  return decodeURIComponent(raw).replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export default function CrimeCategoryDetails() {
  const navigate = useNavigate()
  const { type } = useParams<{ type: string }>()
  const { token } = useAuth()
  const crimeType = useMemo(() => toCrimeType(type), [type])
  const [data, setData] = useState<CrimeCategoryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDetails() {
      if (!crimeType || crimeType === "Unknown") {
        setError("Invalid crime category.")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const result = await fetchCrimeCategoryDetails(crimeType, token)
        setData(result)
      } catch (err: any) {
        console.error(err)
        setError("Unable to load category details.")
      } finally {
        setIsLoading(false)
      }
    }
    loadDetails()
  }, [crimeType])

  const pageData = data || emptyData
  const fallbackAllowed = !data && !isLoading

  const topDistricts = pageData.districts.slice(0, 5)
  const topIpcs = pageData.ipc_breakdown.slice(0, 5)
  const monthlyTrend = pageData.monthly_trend.length ? pageData.monthly_trend : demoDashboardData.analytics.monthly_trend

  return (
    <DashboardLayout title={`${crimeType} Details`}>
      <div className="space-y-6">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <Card className="border-slate-700 bg-[#111827]">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-100">{crimeType} Intelligence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-400">
                  Explore an operational profile for {crimeType}. This page shows case counts, trends, district impact, top IPC sections, and sample FIR details.
                </p>
                {fallbackAllowed && (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-200">
                    Data is using demo fallback values in offline mode.
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Total Cases", value: pageData.total_cases, icon: <FileSearch className="h-4 w-4" /> },
                { label: "Open Cases", value: pageData.open_cases, icon: <MapPin className="h-4 w-4" /> },
                { label: "Under Investigation", value: pageData.under_investigation, icon: <ShieldCheck className="h-4 w-4" /> },
                { label: "Closed Cases", value: pageData.closed_cases, icon: <TrendingUp className="h-4 w-4" /> }
              ].map((stat) => (
                <Card key={stat.label} className="border-slate-700 bg-[#111827]">
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>{stat.label}</span>
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-semibold text-white">{stat.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-slate-700 bg-[#111827]">
              <CardHeader>
                <CardTitle>Monthly Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" stroke="#64748b" tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-slate-700 bg-[#111827]">
                <CardHeader>
                  <CardTitle>Top Districts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topDistricts.length === 0 ? (
                    <p className="text-slate-400">No district breakdown available.</p>
                  ) : (
                    topDistricts.map((item) => (
                      <div key={item.district} className="flex items-center justify-between rounded-2xl bg-[#0f172a] p-3">
                        <span className="text-slate-200 font-medium">{item.district}</span>
                        <span className="text-slate-100 font-semibold">{item.count}</span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-700 bg-[#111827]">
                <CardHeader>
                  <CardTitle>Top IPC Sections</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topIpcs.length === 0 ? (
                    <p className="text-slate-400">No IPC breakdown available.</p>
                  ) : (
                    topIpcs.map((item) => (
                      <div key={item.ipc_section} className="flex items-center justify-between rounded-2xl bg-[#0f172a] p-3">
                        <span className="text-slate-200 font-medium">{item.ipc_section}</span>
                        <span className="text-slate-100 font-semibold">{item.count}</span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-slate-700 bg-[#111827]">
              <CardHeader>
                <CardTitle>Patterns & Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pageData.patterns.map((pattern, index) => (
                  <div key={index} className="rounded-2xl bg-[#0f172a] p-4 text-slate-200">
                    <span className="text-slate-400">• </span>{pattern}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-700 bg-[#111827]">
              <CardHeader>
                <CardTitle>Recent FIRs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1,2,3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : pageData.sample_firs.length === 0 ? (
                  <p className="text-slate-400">No sample FIR records available.</p>
                ) : (
                  pageData.sample_firs.map((fir, index) => (
                    <div key={index} className="rounded-2xl bg-[#0f172a] p-4 border border-slate-800">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-100 font-semibold">{fir.fir_number}</span>
                        <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{fir.status}</span>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">{fir.district} · {fir.date}</p>
                      <p className="text-sm text-slate-400 mt-2">{fir.ipc_section} · {fir.station}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-[#111827]">
              <CardHeader>
                <CardTitle>Operational Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-400">
                <p>Use the chat panel or ask the AI for deeper drill-downs on this crime category, including evolving patterns and recommended field actions.</p>
                <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Scroll to Top</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
