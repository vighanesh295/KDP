import { useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { Button } from "@/components/ui/button"
import { demoDashboardData } from "@/data/demoData"
import { useChat } from "@/lib/ChatContext"
import { ArrowLeft, Info, MapPin, ShieldCheck, FileText, FolderOpen, ClipboardList } from "lucide-react"

const statContent = {
  "total-firs": {
    title: "Total FIRs Overview",
    description: "This page summarizes the overall FIR volume for Karnataka and the current trend across the most recent months.",
    details: [
      { label: "Current FIRs", value: demoDashboardData.analytics.total_firs },
      { label: "Monthly change", value: "+12%" },
      { label: "Top categories", value: demoDashboardData.analytics.crime_breakdown.map((item) => item.type).join(", ") }
    ],
    actionPrompt: "Show me the overall FIR volume, trend drivers, and emerging crime categories for Karnataka.",
    icon: <FileText className="h-5 w-5" />
  },
  "open-cases": {
    title: "Open Cases Detail",
    description: "Open investigations are the highest priority for operational teams. This detail page highlights current case volume and priority areas.",
    details: [
      { label: "Open cases", value: demoDashboardData.analytics.open_cases },
      { label: "Trend", value: "-5% from last month" },
      { label: "Priority sectors", value: "Cybercrime, Theft, Narcotics" }
    ],
    actionPrompt: "Which open cases should the Karnataka police prioritize right now, and what are the likely hotspots?",
    icon: <FolderOpen className="h-5 w-5" />
  },
  "solved-cases": {
    title: "Solved Cases Summary",
    description: "Solved cases reflect the effectiveness of investigations. Review success highlights and recovery trends.",
    details: [
      { label: "Solved cases", value: demoDashboardData.analytics.solved_cases },
      { label: "Trend", value: "+18% from last month" },
      { label: "Key strengths", value: "Faster case closures, better evidence management" }
    ],
    actionPrompt: "Summarize the recent solved cases and operational lessons for the police team.",
    icon: <ShieldCheck className="h-5 w-5" />
  },
  "active-districts": {
    title: "Active Districts Report",
    description: "High-activity districts are shown here with FIR counts and geographic focus for intelligence operations.",
    details: demoDashboardData.analytics.districts.map((district) => ({
      label: district.name,
      value: `${district.count} FIRs`
    })),
    actionPrompt: "Which districts are currently most active and why are they a focus for KSP intelligence?",
    icon: <MapPin className="h-5 w-5" />
  }
}

export default function StatDetails() {
  const navigate = useNavigate()
  const { type } = useParams<{ type: string }>()
  const { openChat } = useChat()

  const content = useMemo(() => {
    if (!type) return null
    return statContent[type as keyof typeof statContent] || null
  }, [type])

  if (!content) {
    return (
      <DashboardLayout title="Stat Detail">
        <div className="rounded-2xl border border-slate-700 bg-[#111827] p-8">
          <div className="text-slate-200 text-lg font-semibold mb-3">Unknown stat section</div>
          <p className="text-slate-400">Please return to the dashboard and choose a valid statistic.</p>
          <Button variant="secondary" className="mt-6" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={content.title}>
      <div className="space-y-6">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-3xl border border-slate-700 bg-[#111827] p-8 space-y-6">
            <div className="flex items-center gap-3 text-slate-100">
              <span className="inline-flex items-center justify-center rounded-full bg-slate-800 p-3 text-slate-200 shadow-sm">
                {content.icon}
              </span>
              <div>
                <h2 className="text-2xl font-semibold">{content.title}</h2>
                <p className="mt-1 text-slate-400">{content.description}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {Array.isArray(content.details)
                ? content.details.map((item, index) => (
                  <div key={index} className="rounded-2xl border border-slate-700 bg-[#0f172a] p-4">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                    <p className="mt-2 text-xl font-semibold text-white">{item.value}</p>
                  </div>
                ))
                : null}
            </div>

            <div className="rounded-3xl border border-slate-700 bg-[#111827] p-6">
              <div className="flex items-center gap-3 text-slate-100 mb-4">
                <ClipboardList className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Suggested action</h3>
              </div>
              <p className="text-slate-400 leading-relaxed">Use this page to review the current operational status and ask the AI for context, priorities, or next steps.</p>
              <Button className="mt-6" onClick={() => openChat(content.actionPrompt)}>
                Ask AI about this stat
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-700 bg-[#111827] p-8">
            <div className="flex items-center gap-3 mb-4 text-slate-200">
              <Info className="h-5 w-5 text-slate-400" />
              <h3 className="text-lg font-semibold">What you’ll see here</h3>
            </div>
            <p className="text-slate-400 leading-relaxed">
              This section gives a focused analysis for the selected statistic. It is built from the current dashboard data and demo values when the backend is unavailable.
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-800">
                <p className="text-sm text-slate-500">Detail cards</p>
                <p className="mt-2 text-slate-300">Each metric shows the current value, the latest change, and relevant context for operations.</p>
              </div>
              <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-800">
                <p className="text-sm text-slate-500">AI assistant</p>
                <p className="mt-2 text-slate-300">Tap the Ask AI button to open the chat panel with a tailored prompt for this metric.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
