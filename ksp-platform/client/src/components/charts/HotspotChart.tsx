import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

interface Prediction {
  district: string
  risk_level?: string
  risk?: string
  confidence: number
}

interface HotspotChartProps {
  predictions: Prediction[] | null | undefined
  error?: boolean | string
}

export default function HotspotChart({ predictions, error }: HotspotChartProps) {
  if (error) {
    return (
      <Card className="col-span-full lg:col-span-4 bg-[#1e293b] border-slate-700 flex flex-col shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-200">Predicted Hotspot Risk</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400 gap-3">
          <AlertCircle className="h-8 w-8 text-rose-500/80" />
          <p>Unable to load chart data.</p>
        </CardContent>
      </Card>
    )
  }

  if (!predictions) {
    return (
      <Card className="col-span-full lg:col-span-4 bg-[#1e293b] border-slate-700 flex flex-col shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-200">Predicted Hotspot Risk</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-6">
          <Skeleton className="w-full h-[250px]" />
        </CardContent>
      </Card>
    )
  }

  // Normalize data for chart: use risk percentage, identify risk string
  const chartData = predictions.map(p => {
    const riskStr = (p.risk_level || p.risk || "Low Risk").toLowerCase()
    let color = "#10b981" // green
    if (riskStr.includes("high")) color = "#ef4444" // red
    else if (riskStr.includes("medium")) color = "#f59e0b" // orange

    return {
      district: p.district,
      riskScore: Math.round(p.confidence * 100),
      riskLabel: p.risk_level || p.risk || "Low Risk",
      color: color
    }
  })

  // Sort by risk score descending so highest is on the left
  chartData.sort((a, b) => b.riskScore - a.riskScore)
  
  // Show only top 15 for readability, unless there are fewer
  const displayData = chartData.slice(0, 15)

  return (
    <Card className="col-span-full lg:col-span-4 bg-[#1e293b] border-slate-700 flex flex-col shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-200">Predicted Hotspot Risk (Top 15)</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-6 px-2 flex items-center justify-center">
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="district" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                axisLine={false}
                dy={15}
                angle={-45}
                textAnchor="end"
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                itemStyle={{ color: '#e2e8f0', fontWeight: 500 }}
                cursor={{ fill: '#334155', opacity: 0.4 }}
                formatter={(value: any, _name: any, props: any) => {
                  return [`${value}% (${props.payload.riskLabel})`, 'Confidence']
                }}
              />
              <Bar dataKey="riskScore" radius={[4, 4, 0, 0]}>
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
