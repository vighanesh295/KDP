import { AlertTriangle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useChat } from "@/lib/ChatContext"

export interface Alert {
  district: string
  crime_type?: string
  message: string
  severity: "high" | "medium"
}

interface AlertFeedProps {
  alerts: Alert[] | null | undefined
  error?: boolean | string
}

export default function AlertFeed({ alerts, error }: AlertFeedProps) {
  const { openChat } = useChat()

  return (
    <Card className="col-span-full lg:col-span-3 bg-[#1e293b] border-slate-700 flex flex-col shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-500" />
          Anomaly Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-6 px-4 max-h-[400px] overflow-y-auto custom-scrollbar">
        {error ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-slate-400 gap-3">
            <AlertCircle className="h-8 w-8 text-rose-500/80" />
            <p>Unable to load alerts.</p>
          </div>
        ) : !alerts ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="w-full h-16" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-emerald-500" />
            </div>
            <p>No anomalies detected at this time.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border-l-4 bg-slate-800/50 flex flex-col gap-1.5 ${
                  alert.severity === 'high' 
                    ? 'border-rose-500 hover:bg-slate-800' 
                    : 'border-amber-500 hover:bg-slate-800'
                } transition-colors`}
              >
                <div className="flex items-center justify-between">
                  <strong className="text-sm text-slate-200">{alert.district}</strong>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    alert.severity === 'high' 
                      ? 'bg-rose-500/20 text-rose-400' 
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{alert.message}</p>
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => {
                      const msg = `Why is ${alert.district} showing a ${alert.crime_type || 'crime'} spike and what should KSP do about it?`;
                      openChat(msg);
                    }}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Ask AI &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
