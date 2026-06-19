import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

interface TrendData {
  month: string
  count: number
}

interface TrendChartProps {
  data: TrendData[] | null | undefined
  error?: boolean | string
}

export default function TrendChart({ data, error }: TrendChartProps) {
  if (error) {
    return (
      <Card className="lg:col-span-3 bg-[#1e293b] border-slate-700 flex flex-col shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-200">Monthly FIR Trend</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400 gap-3">
          <AlertCircle className="h-8 w-8 text-rose-500/80" />
          <p>Unable to load chart data.</p>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="lg:col-span-3 bg-[#1e293b] border-slate-700 flex flex-col shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-200">Monthly FIR Trend</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-6">
          <Skeleton className="w-full h-full min-h-[250px]" />
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="lg:col-span-3 bg-[#1e293b] border-slate-700 flex flex-col shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-200">Monthly FIR Trend</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400 gap-3">
          <AlertCircle className="h-8 w-8 text-rose-500/80" />
          <p>No monthly FIR trend data is available right now.</p>
        </CardContent>
      </Card>
    )
  }

  // Format YYYY-MM into a shorter readable format
  const formatMonth = (tickItem: any) => {
    if (!tickItem) return ""
    const parts = tickItem.split("-")
    if (parts.length === 2) {
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1)
      return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
    }
    return tickItem
  }

  return (
    <Card className="lg:col-span-3 bg-[#1e293b] border-slate-700 flex flex-col shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-200">Monthly FIR Trend</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-6 px-2 min-h-[250px] flex items-end">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="#64748b" 
                fontSize={12} 
                tickFormatter={formatMonth}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                itemStyle={{ color: '#3b82f6', fontWeight: 500 }}
                labelFormatter={(tickItem: any) => formatMonth(tickItem)}
                cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                name="Cases"
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} 
                activeDot={{ r: 6, fill: '#60a5fa', stroke: '#0f172a', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
