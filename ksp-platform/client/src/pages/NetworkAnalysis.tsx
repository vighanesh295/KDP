import { useMemo } from "react"
import { useParams } from "react-router-dom"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import NetworkGraph from "@/components/network/NetworkGraph"

export default function NetworkAnalysis() {
  const { name } = useParams<{ name?: string }>()
  const decodedName = useMemo(() => {
    if (!name) return undefined
    try {
      return decodeURIComponent(name)
    } catch {
      return name
    }
  }, [name])

  return (
    <DashboardLayout title={decodedName ? `Network: ${decodedName}` : "Network Analysis"}>
      <div className="space-y-6">
        <NetworkGraph personName={decodedName} />
      </div>
    </DashboardLayout>
  )
}
