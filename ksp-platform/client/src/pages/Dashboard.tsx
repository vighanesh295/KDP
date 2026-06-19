import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import StatCards from "@/components/dashboard/StatCards"
import TrendChart from "@/components/charts/TrendChart"
import CategoryChart from "@/components/charts/CategoryChart"
import HotspotChart from "@/components/charts/HotspotChart"
import CrimeHeatmap from "@/components/heatmap/CrimeHeatmap"
import AlertFeed from "@/components/dashboard/AlertFeed"
import { fetchAnalytics, fetchAnomalies, fetchHotspots } from "@/lib/api"

export default function Dashboard() {
  const [data, setData] = useState<any>(null)
  const [anomalies, setAnomalies] = useState<any>(null)
  const [hotspots, setHotspots] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        const [analyticsRes, anomaliesRes, hotspotsRes] = await Promise.all([
          fetchAnalytics(),
          fetchAnomalies(),
          fetchHotspots()
        ])
        
        if (!analyticsRes) throw new Error("No data received")
        setData(analyticsRes)
        setAnomalies(anomaliesRes?.alerts || [])
        setHotspots(hotspotsRes?.predictions || hotspotsRes || [])
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <DashboardLayout title="Intelligence Overview">
      <div className="space-y-6 relative min-h-[calc(100vh-8rem)]">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/50 rounded-lg p-4 flex items-center gap-3 text-rose-400">
            <AlertCircle className="h-5 w-5" />
            <p>{error}. Operating with limited functionality.</p>
          </div>
        )}

        {/* Top Stats */}
        <StatCards 
          totalFirs={data?.total_firs} 
          openCases={data?.open_cases} 
          solvedCases={data?.solved_cases}
          activeDistricts={data?.districts?.length || 0}
          isLoading={isLoading}
          error={!!error}
        />

        {/* Charts Area */}
        <div className="grid gap-4 md:grid-cols-1 xl:grid-cols-7 mb-8 min-w-0">
          <div className="xl:col-span-4 min-w-0">
            <CategoryChart data={isLoading ? null : data?.crime_breakdown} error={!!error} />
          </div>
          <div className="xl:col-span-3 min-w-0">
            <TrendChart data={isLoading ? null : data?.monthly_trend} error={!!error} />
          </div>
        </div>

        {/* Heatmap Area */}
        <div className="mt-8 min-w-0">
          <CrimeHeatmap districts={isLoading ? null : data?.districts} error={!!error} />
        </div>

        {/* Predictive Analytics & Alerts */}
        <div className="grid gap-4 md:grid-cols-1 xl:grid-cols-7 mt-8 pb-8 min-w-0">
          <div className="xl:col-span-4 min-w-0">
            <HotspotChart predictions={isLoading ? null : hotspots} error={!!error} />
          </div>
          <div className="xl:col-span-3 min-w-0">
            <AlertFeed alerts={isLoading ? null : anomalies} error={!!error} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
