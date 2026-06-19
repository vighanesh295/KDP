import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, FolderOpen, CheckCircle2, MapPin, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend: string
  trendUp: boolean
}

function StatCard({ title, value, icon, trend, trendUp, onClick }: StatCardProps) {
  return (
    <Card
      className={`bg-[#1e293b] border-slate-700 text-white shadow-sm transition-all ${onClick ? 'cursor-pointer hover:border-slate-500 hover:bg-slate-900' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onClick(); } } : undefined}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-300">
          {title}
        </CardTitle>
        <div className="text-slate-400">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs flex items-center mt-1 text-slate-400">
          {trendUp ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400 mr-1" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-rose-400 mr-1" />
          )}
          <span className={trendUp ? "text-emerald-400 font-medium" : "text-rose-400 font-medium"}>
            {trend}
          </span>
          <span className="ml-1 text-slate-500">from last month</span>
        </p>
        {onClick && (
          <div className="mt-3">
            <span className="text-xs text-blue-400 hover:text-blue-300">Tap to ask AI</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface StatCardsProps {
  totalFirs?: number
  openCases?: number
  solvedCases?: number
  activeDistricts?: number
  isLoading?: boolean
  error?: boolean | string
  onTotalFirsClick?: () => void
  onOpenCasesClick?: () => void
  onSolvedCasesClick?: () => void
  onActiveDistrictsClick?: () => void
}

export default function StatCards({
  totalFirs = 0,
  openCases = 0,
  solvedCases = 0,
  activeDistricts = 0,
  isLoading,
  error,
  onTotalFirsClick,
  onOpenCasesClick,
  onSolvedCasesClick,
  onActiveDistrictsClick
}: StatCardsProps) {
  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="bg-[#1e293b] border-slate-700 text-slate-400 shadow-sm flex items-center justify-center h-28">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-500/80" />
              <span>Error loading stats</span>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-[#1e293b] border-slate-700 h-28 shadow-sm p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton className="h-8 w-16 mt-2" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard 
        title="Total FIRs" 
        value={totalFirs} 
        icon={<FileText className="h-4 w-4" />} 
        trend="+12%" 
        trendUp={true} 
        onClick={onTotalFirsClick}
      />
      <StatCard 
        title="Open Cases" 
        value={openCases} 
        icon={<FolderOpen className="h-4 w-4" />} 
        trend="-5%" 
        trendUp={false} 
        onClick={onOpenCasesClick}
      />
      <StatCard 
        title="Solved Cases" 
        value={solvedCases} 
        icon={<CheckCircle2 className="h-4 w-4" />} 
        trend="+18%" 
        trendUp={true} 
        onClick={onSolvedCasesClick}
      />
      <StatCard 
        title="Active Districts" 
        value={activeDistricts} 
        icon={<MapPin className="h-4 w-4" />} 
        trend="0%" 
        trendUp={true} 
        onClick={onActiveDistrictsClick}
      />
    </div>
  )
}
