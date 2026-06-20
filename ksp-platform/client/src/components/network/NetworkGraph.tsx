import { useEffect, useRef, useState } from "react"
import ForceGraph2D from "react-force-graph-2d"
import { fetchNetworkGraph, fetchPersonNetwork } from "@/lib/api"
import { useAuth } from "@/lib/authStore"

interface NetworkNode {
  id: string
  label: string
  type: "accused" | "district"
  case_count: number
}

interface NetworkEdge {
  source: string
  target: string
  weight: number
}

interface GraphData {
  nodes: NetworkNode[]
  edges: NetworkEdge[]
}

interface NetworkGraphProps {
  personName?: string
}

export default function NetworkGraph({ personName }: NetworkGraphProps) {
  const { token } = useAuth()
  const graphRef = useRef<any>(null)
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] })
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null)
  const [caseHistory, setCaseHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [panelLoading, setPanelLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadGraph() {
      setLoading(true)
      setError(null)
      setSelectedNode(null)
      setCaseHistory([])

      try {
        if (personName) {
          const data = await fetchPersonNetwork(personName, token)
          const nodes = data.nodes || []
          const edges = data.edges || []
          if (!nodes.length) {
            setError(`No network data found for accused '${personName}'.`)
            setGraphData({ nodes: [], edges: [] })
          } else {
            setGraphData({ nodes, edges })
            const node = nodes.find((n: NetworkNode) => n.id === personName) as NetworkNode | undefined
            setSelectedNode(node || { id: personName, label: personName, type: "accused", case_count: 0 })
            setCaseHistory(data.case_history || [])
          }
        } else {
          const data = await fetchNetworkGraph(token)
          setGraphData({ nodes: data.nodes || [], edges: data.edges || [] })
        }
      } catch (err: any) {
        setError(err?.message || "Unable to load network graph")
      } finally {
        setLoading(false)
      }
    }

    loadGraph()
  }, [token, personName])

  const handleNodeClick = async (node: any) => {
    setSelectedNode(node)
    setPanelLoading(true)
    setCaseHistory([])

    if (node.type === "accused") {
      try {
        const data = await fetchPersonNetwork(node.id, token)
        setCaseHistory(data.case_history || [])
      } catch (err: any) {
        setError(err?.message || "Unable to load person case history")
      } finally {
        setPanelLoading(false)
      }
    } else {
      setPanelLoading(false)
    }
  }

  const handleZoom = (scale: number) => {
    if (!graphRef.current) return
    try {
      const currentZoom = graphRef.current.zoom() ?? 1
      graphRef.current.zoom(currentZoom * scale, 300)
    } catch {
      graphRef.current.zoomToFit(400, 20)
    }
  }

  const handleFit = () => {
    if (!graphRef.current) return
    graphRef.current.zoomToFit(400, 20)
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.6fr_0.9fr] min-h-[calc(100vh-4rem)]">
      <section className="rounded-3xl border border-slate-700 bg-[#111827] p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-xl font-semibold text-white">Network Analysis</h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Explore repeated accused persons and district links derived from reported FIRs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleZoom(1.25)}
              className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
            >
              Zoom In
            </button>
            <button
              type="button"
              onClick={() => handleZoom(0.8)}
              className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
            >
              Zoom Out
            </button>
            <button
              type="button"
              onClick={handleFit}
              className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
            >
              Fit Graph
            </button>
          </div>
        </div>

        <div className="relative min-h-[520px] rounded-3xl overflow-hidden border border-slate-700 bg-[#0f172a]">
          {loading ? (
            <div className="flex h-[520px] items-center justify-center text-slate-400">Loading network graph...</div>
          ) : error ? (
            <div className="flex h-[520px] items-center justify-center text-rose-400">{error}</div>
          ) : (
            <ForceGraph2D
              ref={graphRef}
              graphData={{ nodes: graphData.nodes, links: graphData.edges }}
              nodeLabel={(node: any) => `${node.label} (${node.type === "accused" ? "Accused" : "District"})`}
              nodeCanvasObject={(node: any, ctx, globalScale) => {
                const x = typeof node.x === "number" ? node.x : 0
                const y = typeof node.y === "number" ? node.y : 0
                const size = Math.max(8, Math.min(20, (node.case_count || 1) * 2))
                ctx.fillStyle = node.type === "accused" ? "#ef4444" : "#3b82f6"
                ctx.strokeStyle = "#ffffff"
                ctx.lineWidth = 1
                if (node.type === "accused") {
                  ctx.beginPath()
                  ctx.arc(x, y, size, 0, 2 * Math.PI, false)
                  ctx.fill()
                  ctx.stroke()
                } else {
                  const squareSize = size * 1.2
                  ctx.beginPath()
                  ctx.rect(x - squareSize / 2, y - squareSize / 2, squareSize, squareSize)
                  ctx.fill()
                  ctx.stroke()
                }

                const labelText = node.label
                const fontSize = Math.max(10, 12 / globalScale)
                ctx.font = `${fontSize}px Sans-Serif`
                ctx.fillStyle = "#ffffff"
                ctx.textAlign = "center"
                ctx.textBaseline = "top"
                ctx.fillText(labelText, x, y + size + 4)
              }}
              nodePointerAreaPaint={(node: any, color, ctx) => {
                const x = typeof node.x === "number" ? node.x : 0
                const y = typeof node.y === "number" ? node.y : 0
                const size = Math.max(8, Math.min(20, (node.case_count || 1) * 2))
                ctx.fillStyle = color
                if (node.type === "accused") {
                  ctx.beginPath()
                  ctx.arc(x, y, size + 3, 0, 2 * Math.PI, false)
                  ctx.fill()
                } else {
                  const squareSize = size * 1.2 + 6
                  ctx.fillRect(x - squareSize / 2, y - squareSize / 2, squareSize, squareSize)
                }
              }}
              linkWidth={(link: any) => Math.max(1, link.weight || 1)}
              linkColor={() => "#9ca3af"}
              linkDirectionalParticles={0}
              onNodeClick={handleNodeClick}
              cooldownTicks={50}
              dagLevelDistance={80}
              nodeRelSize={8}
            />
          )}
        </div>
      </section>

      <aside className="rounded-3xl border border-slate-700 bg-[#111827] p-4 shadow-lg min-h-[520px]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">Node Details</h3>
            <p className="text-sm text-slate-400">Select a node to view its case history and connections.</p>
          </div>
          {selectedNode && (
            <span className="rounded-full bg-slate-700 px-3 py-1 text-xs uppercase tracking-[0.08em] text-slate-200">
              {selectedNode.type}
            </span>
          )}
        </div>

        {!selectedNode ? (
          <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-4 text-slate-400">Click an accused or district node in the graph to inspect it.</div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-xl font-semibold text-white">{selectedNode.label}</h4>
                  <p className="text-sm text-slate-400">{selectedNode.type === "accused" ? "Repeat accused" : "District node"}</p>
                </div>
                <div className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200">{selectedNode.case_count} cases</div>
              </div>
            </div>

            {selectedNode.type === "accused" ? (
              <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-semibold text-white">Case History</h4>
                  {panelLoading && <span className="text-xs text-slate-400">Loading...</span>}
                </div>

                {caseHistory.length === 0 && !panelLoading ? (
                  <p className="text-sm text-slate-400">No case history available for this accused.</p>
                ) : (
                  <div className="space-y-3">
                    {caseHistory.map((item) => (
                      <div key={`${item.fir_number}-${item.date}`} className="rounded-2xl border border-slate-700 bg-slate-900/60 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium text-slate-100">{item.fir_number}</span>
                          <span className="text-xs uppercase text-slate-400">{item.date}</span>
                        </div>
                        <p className="text-sm text-slate-300">{item.district} · {item.crime_type}</p>
                        <p className="text-sm text-slate-400">{item.ipc_section} · {item.status}</p>
                        <p className="text-sm text-slate-400">Station: {item.station}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-700 bg-[#0f172a] p-4 text-sm text-slate-400">
                District nodes are shown to indicate location-based connections. Select an accused node for case history.
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  )
}
