import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { fetchAnalytics } from "@/lib/api"
import { demoDashboardData } from "@/data/demoData"
import CorrelationChart from "@/components/charts/CorrelationChart"

export default function Analytics() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setIsLoading(true)
        const analytics = await fetchAnalytics()
        setData(analytics)
      } catch (err: any) {
        setError(err?.message || "Failed to load analytics data")
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  const analyticsData = !isLoading ? data ?? demoDashboardData.analytics : null
  const correlations = analyticsData?.correlations ?? demoDashboardData.analytics.correlations
  const socioeconomicData = analyticsData?.socioeconomic_data ?? demoDashboardData.analytics.socioeconomic_data

  return (
    <div className="p-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="max-w-3xl text-slate-400">
          Explore the relationship between district crime counts and socio-economic indicators.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}. Falling back to offline data where available.</span>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-4">
        <CorrelationChart
          data={isLoading ? null : socioeconomicData}
          correlations={isLoading ? null : correlations}
          error={!!error && !data}
        />
      </div>
    </div>
  )
}
