import { useEffect, useMemo, useState } from "react"
import {
  ComposedChart,
  Scatter,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

interface FeatureRecord {
  district: string
  crime_count: number
  [key: string]: number | string | null
}

interface CorrelationChartProps {
  data: FeatureRecord[] | null | undefined
  correlations: Record<string, number | null> | null | undefined
  error?: boolean | string
}

function getCorrelationMeta(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return {
      label: "No correlation data",
      description: "Select a feature to view its crime relationship.",
      color: "text-slate-400",
    }
  }

  const sign = value >= 0 ? "positive" : "negative"
  const absValue = Math.abs(value)
  if (absValue >= 0.75) {
    return {
      label: `Strong ${sign} correlation`,
      description: "The selected feature is closely linked with crime intensity.",
      color: "text-emerald-400",
    }
  }

  if (absValue >= 0.5) {
    return {
      label: `Moderate ${sign} correlation`,
      description: "There is a noticeable relationship between feature and crime.",
      color: "text-amber-300",
    }
  }

  return {
    label: `${sign === "positive" ? "Weak" : "Weak negative"} correlation`,
    description: "The feature shows only a mild link to crime counts.",
    color: "text-slate-400",
  }
}

function getGradientColor(value: number, minValue: number, maxValue: number) {
  if (maxValue === minValue) return "#38bdf8"
  const t = (value - minValue) / (maxValue - minValue)
  const r = Math.round(59 + t * (251 - 59))
  const g = Math.round(130 + t * (112 - 130))
  const b = Math.round(246 + t * (3 - 246))
  return `rgb(${r},${g},${b})`
}

function CustomDot(props: any) {
  const { cx, cy, payload } = props
  if (cx === undefined || cy === undefined) return null
  return (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      fill={payload.fill}
      fillOpacity={0.9}
      stroke={payload.fill}
      strokeWidth={1}
      style={{ filter: 'drop-shadow(0 0 12px rgba(56,189,248,0.18))' }}
    />
  )
}

export default function CorrelationChart({ data, correlations, error }: CorrelationChartProps) {
  const featureOptions = useMemo(() => {
    if (!correlations) return []
    return Object.keys(correlations)
  }, [correlations])

  const [selectedFeature, setSelectedFeature] = useState<string>(featureOptions[0] ?? "")

  useEffect(() => {
    if (featureOptions.length === 0) {
      setSelectedFeature("")
      return
    }

    if (!featureOptions.includes(selectedFeature)) {
      setSelectedFeature(featureOptions[0])
    }
  }, [featureOptions, selectedFeature])

  const chartData = useMemo(() => {
    if (!data || !selectedFeature) return []

    const rawPoints = data
      .map((row) => {
        const rawValue = row[selectedFeature]
        const value = typeof rawValue === "string" ? Number(rawValue) : rawValue
        return {
          x: Number(value),
          y: Number(row.crime_count),
          district: row.district,
          crime_count: Number(row.crime_count),
          rawFeatureValue: Number(value),
        }
      })
      .filter((item) => !Number.isNaN(item.x) && !Number.isNaN(item.y))

    const low = Math.min(...rawPoints.map((item) => item.crime_count))
    const high = Math.max(...rawPoints.map((item) => item.crime_count))

    return rawPoints.map((item) => ({
      ...item,
      fill: getGradientColor(item.crime_count, low, high),
    }))
  }, [data, selectedFeature])

  const correlationValue = selectedFeature ? correlations?.[selectedFeature] : null
  const correlationMeta = useMemo(() => getCorrelationMeta(correlationValue), [correlationValue])

  const regression = useMemo(() => {
    if (chartData.length < 2) return null
    const n = chartData.length
    const sumX = chartData.reduce((sum, item) => sum + item.x, 0)
    const sumY = chartData.reduce((sum, item) => sum + item.y, 0)
    const sumXY = chartData.reduce((sum, item) => sum + item.x * item.y, 0)
    const sumXX = chartData.reduce((sum, item) => sum + item.x * item.x, 0)
    const denominator = n * sumXX - sumX * sumX
    if (denominator === 0) return null
    const slope = (n * sumXY - sumX * sumY) / denominator
    const intercept = (sumY - slope * sumX) / n
    return { slope, intercept }
  }, [chartData])

  const trendLineData = useMemo(() => {
    if (!regression || chartData.length === 0) return []
    const xValues = chartData.map((item) => item.x)
    const minX = Math.min(...xValues)
    const maxX = Math.max(...xValues)
    return [
      { x: minX, y: regression.slope * minX + regression.intercept },
      { x: maxX, y: regression.slope * maxX + regression.intercept },
    ]
  }, [chartData, regression])

  const outliers = useMemo(() => {
    if (!regression) return []
    return [...chartData]
      .map((item) => ({
        ...item,
        residual: item.y - (regression.slope * item.x + regression.intercept),
      }))
      .sort((a, b) => b.residual - a.residual)
      .slice(0, 3)
  }, [chartData, regression])

  if (error) {
    return (
      <Card className="bg-[#17263a] border-slate-700 border-t-2 border-cyan-500/30 flex flex-col shadow-lg shadow-slate-950/20">
        <CardHeader>
          <CardTitle className="text-slate-200">Feature Correlation</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400 gap-3">
          <AlertCircle className="h-8 w-8 text-rose-500/80" />
          <p>Unable to load correlation chart data.</p>
        </CardContent>
      </Card>
    )
  }

  if (!data || !correlations) {
    return (
      <Card className="bg-[#17263a] border-slate-700 border-t-2 border-cyan-500/30 flex flex-col shadow-lg shadow-slate-950/20">
        <CardHeader>
          <CardTitle className="text-slate-200">Feature Correlation</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-6">
          <Skeleton className="w-full h-full min-h-[280px]" />
        </CardContent>
      </Card>
    )
  }

  if (featureOptions.length === 0) {
    return (
      <Card className="bg-[#17263a] border-slate-700 border-t-2 border-cyan-500/30 flex flex-col shadow-lg shadow-slate-950/20">
        <CardHeader>
          <CardTitle className="text-slate-200">Feature Correlation</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400 gap-3">
          <AlertCircle className="h-8 w-8 text-rose-500/80" />
          <p>No socio-economic features are available for correlation analysis.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#17263a] border-slate-700 border-t-2 border-cyan-500/30 flex flex-col shadow-lg shadow-slate-950/20">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <CardTitle className="text-slate-200">Crime Count vs Socioeconomic Feature</CardTitle>
              <p className="text-sm text-slate-400 max-w-2xl">
                Scatter plot of district crime counts versus the selected socio-economic measure.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:items-end sm:justify-end">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="min-w-[220px]">
                  <label className="block text-xs uppercase tracking-[0.28em] text-slate-500 mb-2">
                    Select feature
                  </label>
                  <select
                    value={selectedFeature}
                    onChange={(event) => setSelectedFeature(event.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-600"
                  >
                    {featureOptions.map((feature) => (
                      <option key={feature} value={feature}>
                        {feature.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
                  {chartData.length} district point{chartData.length === 1 ? "" : "s"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0 flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-1">
            <span className="text-[11px] uppercase tracking-[0.32em] text-slate-500">Correlation coefficient</span>
            <span className={`text-4xl font-semibold ${correlationMeta.color}`}>
              {correlationValue === null || Number.isNaN(correlationValue)
                ? "N/A"
                : correlationValue.toFixed(4)}
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3">
            <span className={`h-2.5 w-2.5 rounded-full ${correlationMeta.color.replace('text-', 'bg-')}`} />
            <div>
              <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Strength</div>
              <div className={`text-sm font-medium ${correlationMeta.color}`}>{correlationMeta.label}</div>
            </div>
          </div>
        </div>

        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart margin={{ top: 12, right: 24, left: 0, bottom: 0 }} data={chartData}>
              <CartesianGrid stroke="#334155" strokeOpacity={0.12} vertical={false} />
              <XAxis
                type="number"
                dataKey="x"
                name={selectedFeature}
                label={{ value: selectedFeature.replace(/_/g, " "), position: "insideBottom", offset: -8, fill: "#94a3b8" }}
                stroke="#94a3b8"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Crime Count"
                label={{ value: "Crime Count", angle: -90, position: "insideLeft", fill: "#94a3b8" }}
                stroke="#94a3b8"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  color: '#f8fafc',
                  borderRadius: '12px',
                }}
                cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }}
                formatter={(value: any, name: string) => [value, name === 'x' ? selectedFeature.replace(/_/g, ' ') : name === 'y' ? 'Crime Count' : name]}
                labelFormatter={(label) => `District: ${chartData.find((item) => item.x === label)?.district ?? ''}`}
              />
              {trendLineData.length > 1 && (
                <Line
                  type="linear"
                  data={trendLineData}
                  dataKey="y"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={false}
                />
              )}
              <Scatter data={chartData} fill="#38bdf8" shape={<CustomDot />} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-3xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-300">
          <div className="flex items-center justify-between gap-4 mb-3 text-slate-500">
            <span className="uppercase tracking-[0.24em] text-[11px]">Top trend outliers</span>
            <span>{correlationMeta.description}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {outliers.map((item) => (
              <div key={item.district} className="rounded-2xl border border-slate-700 bg-[#0f172a]/90 p-3">
                <div className="text-sm font-semibold text-slate-100">{item.district}</div>
                <div className="mt-1 text-xs text-slate-500">
                  +{item.residual.toFixed(1)} above trend
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
