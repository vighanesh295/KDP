import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

interface CategoryData {
  type: string
  count: number
}

interface CategoryChartProps {
  data: CategoryData[] | null | undefined
  error?: boolean | string
  onCategoryClick?: (category: string) => void
}

const COLORS = [
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#06b6d4', // cyan-500
  '#ef4444', // red-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
  '#6366f1'  // indigo-500
];

export default function CategoryChart({ data, error, onCategoryClick }: CategoryChartProps) {
  if (error) {
    return (
      <Card className="lg:col-span-4 bg-[#1e293b] border-slate-700 flex flex-col shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-200">Crime Categories</CardTitle>
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
      <Card className="lg:col-span-4 bg-[#1e293b] border-slate-700 flex flex-col shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-200">Crime Categories</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-6">
          <Skeleton className="w-[200px] h-[200px] rounded-full" />
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="lg:col-span-4 bg-[#1e293b] border-slate-700 flex flex-col shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-200">Crime Categories</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400 gap-3">
          <AlertCircle className="h-8 w-8 text-rose-500/80" />
          <p>No crime category data is available right now.</p>
        </CardContent>
      </Card>
    )
  }

  // Optional: If there are too many categories, you might want to slice to top 8 and group the rest into "Other", 
  // but for now we'll render all the data the API gives us.

  return (
    <Card className="lg:col-span-4 bg-[#1e293b] border-slate-700 flex flex-col shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-200">Crime Categories</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-6 px-2 min-h-[250px] flex flex-col items-center justify-center">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Pie
                data={data}
                cx="40%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="count"
                nameKey="type"
                stroke="none"
                onClick={(payload: any) => {
                  if (onCategoryClick && payload?.payload?.type) {
                    onCategoryClick(payload.payload.type)
                  }
                }}
                cursor={onCategoryClick ? "pointer" : "default"}
              >
                {data.map((_entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', border: '1px solid #334155' }}
                itemStyle={{ color: '#e2e8f0', fontWeight: 500 }}
              />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {onCategoryClick && (
          <p className="mt-4 text-xs text-slate-400 text-center px-4">
            Click any crime segment to view detailed FIR patterns, case counts, and district-level information.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
