import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { useChat } from "@/lib/ChatContext"

interface DistrictData {
  name: string
  count: number
  lat: number
  lng: number
  topCrime?: string
}

interface CrimeHeatmapProps {
  districts: DistrictData[] | null | undefined
  error?: boolean | string
}

export default function CrimeHeatmap({ districts, error }: CrimeHeatmapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const { openChat } = useChat()

  // Initialize map and markers
  useEffect(() => {
    if (!mapContainerRef.current || !districts) return

    // Ensure we only initialize the map once
    if (!mapRef.current) {
      // A safety check for React Strict Mode to avoid "Map container is already initialized" error
      const container = mapContainerRef.current as any
      if (container._leaflet_id) {
        container._leaflet_id = null
      }

      mapRef.current = L.map(mapContainerRef.current).setView([14.5, 75.7], 7)

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(mapRef.current)
    }

    // Clear existing circle markers
    mapRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.CircleMarker) {
        layer.remove()
      }
    })

    // Draw markers
    districts.forEach((d) => {
      let color = "#10b981" // Green for low
      if (d.count > 50) color = "#ef4444" // Red for high
      else if (d.count > 20) color = "#f59e0b" // Orange for medium

      // Radius scales with count, between 6 and 25
      const radius = Math.max(6, Math.min(d.count / 2, 25))

      L.circleMarker([d.lat, d.lng], {
        radius,
        fillColor: color,
        color: color,
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.5
      })
        .addTo(mapRef.current!)
        .on("click", () => {
          const msg = `Tell me about crime trends in ${d.name} and what actions KSP should take.`;
          openChat(msg);
        })
        .bindPopup(`
          <div style="font-family: sans-serif; color: #0f172a;">
            <strong style="font-size: 15px; color: #1e293b;">${d.name}</strong><br/>
            <div style="margin-top: 4px;">
              <span style="color: #64748b;">Total FIRs:</span> <span style="font-weight: 600; color: #0f172a;">${d.count}</span><br/>
              <span style="color: #64748b;">Top Crime:</span> <span style="font-weight: 600; color: #0f172a;">${d.topCrime || "Data Unavailable"}</span>
            </div>
          </div>
        `)
    })

  }, [districts])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <Card className="col-span-full bg-[#1e293b] border-slate-700 flex flex-col shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-200">Karnataka Crime Heatmap</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-6 px-6">
        {error ? (
          <div className="w-full h-[450px] flex flex-col items-center justify-center text-slate-400 gap-3">
            <AlertCircle className="h-8 w-8 text-rose-500/80" />
            <p>Unable to load map data.</p>
          </div>
        ) : !districts ? (
          <Skeleton className="w-full h-[450px]" />
        ) : (
          <div 
            ref={mapContainerRef} 
            className="w-full h-[450px] rounded-xl z-0"
            style={{ isolation: 'isolate' }}
          ></div>
        )}
      </CardContent>
    </Card>
  )
}
