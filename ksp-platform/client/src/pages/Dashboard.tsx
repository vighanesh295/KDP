import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AlertCircle } from "lucide-react"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import StatCards from "@/components/dashboard/StatCards"
import TrendChart from "@/components/charts/TrendChart"
import CategoryChart from "@/components/charts/CategoryChart"
import HotspotChart from "@/components/charts/HotspotChart"
import CrimeHeatmap from "@/components/heatmap/CrimeHeatmap"
import AlertFeed from "@/components/dashboard/AlertFeed"
import { fetchAnalytics, fetchAnomalies, fetchHotspots } from "@/lib/api"
import { useChat } from "@/lib/ChatContext"
import { demoDashboardData } from "@/data/demoData"

export default function Dashboard() {
  const navigate = useNavigate()
  const { openChat } = useChat()
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
        setAnomalies(anomaliesRes?.alerts?.length ? anomaliesRes.alerts : demoDashboardData.anomalies.alerts)
        setHotspots(hotspotsRes?.predictions?.length ? hotspotsRes.predictions : demoDashboardData.hotspots.predictions)
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleTotalFirsClick = () => {
    navigate("/stats/total-firs")
  }

  const handleOpenCasesClick = () => {
    navigate("/stats/open-cases")
  }

  const handleSolvedCasesClick = () => {
    navigate("/stats/solved-cases")
  }

  const handleActiveDistrictsClick = () => {
    navigate("/stats/active-districts")
  }

  const handleCategoryClick = (category: string) => {
    const slug = category.toLowerCase().replace(/\s+/g, "-")
    navigate(`/crime-category/${slug}`)
  }

  const trendData = isLoading ? null : (data?.monthly_trend?.length ? data.monthly_trend : demoDashboardData.analytics.monthly_trend)
  const crimeData = isLoading ? null : (data?.crime_breakdown?.length ? data.crime_breakdown : demoDashboardData.analytics.crime_breakdown)
  const districtData = isLoading ? null : (data?.districts?.length ? data.districts : demoDashboardData.analytics.districts)
  const hotspotData = isLoading ? null : (hotspots?.length ? hotspots : demoDashboardData.hotspots.predictions)
  const anomalyData = isLoading ? null : (anomalies?.length ? anomalies : demoDashboardData.anomalies.alerts)

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
          onTotalFirsClick={handleTotalFirsClick}
          onOpenCasesClick={handleOpenCasesClick}
          onSolvedCasesClick={handleSolvedCasesClick}
          onActiveDistrictsClick={handleActiveDistrictsClick}
        />

        {/* Charts Area */}
        <div className="grid gap-4 md:grid-cols-1 xl:grid-cols-7 mb-8 min-w-0">
          <div className="xl:col-span-4 min-w-0">
            <CategoryChart data={isLoading ? null : crimeData} error={!!error} onCategoryClick={handleCategoryClick} />
          </div>
          <div className="xl:col-span-3 min-w-0">
            <TrendChart data={isLoading ? null : trendData} error={!!error} />
          </div>
        </div>

        {/* Heatmap Area */}
        <div className="mt-8 min-w-0">
          <CrimeHeatmap districts={isLoading ? null : districtData} error={!!error} />
        </div>

        {/* Predictive Analytics & Alerts */}
        <div className="grid gap-4 md:grid-cols-1 xl:grid-cols-7 mt-8 pb-8 min-w-0">
          <div className="xl:col-span-4 min-w-0">
            <HotspotChart predictions={hotspotData} error={!!error} />
          </div>
          <div className="xl:col-span-3 min-w-0">
            <AlertFeed alerts={anomalyData} error={!!error} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
