// @ts-nocheck
import fallback from '../data/fallback.json';
import { demoDashboardData } from '../data/demoData';

const API_BASE = import.meta.env.VITE_API_URL ?? "";

// Basic mock data for other endpoints to act as the fallback
const fallbackData = {
  analytics: {
    total_firs: 800, open_cases: 717, solved_cases: 83,
    districts: [{name: "Bengaluru Urban", count: 80, lat: 12.9716, lng: 77.5946}],
    monthly_trend: [{month: "2024-01", count: 50}],
    crime_breakdown: [{type: "Theft", count: 60}]
  },
  firClassification: {
    crime_type: "Unknown",
    ipc_section: "Unknown",
    entities: {persons: [], locations: []}
  },
  hotspots: {
    predictions: [{district: "Bengaluru Urban", risk: "High Risk", confidence: 0.95}]
  },
  anomalies: {
    alerts: [{district: "Bengaluru Urban", crime_type: "Cybercrime", deviation_percent: 50, severity: "medium"}]
  }
};

export async function fetchAnalytics() {
  try {
    const response = await fetch(`${API_BASE}/analytics/`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("fetchAnalytics failed, falling back to demo data:", error);
    return demoDashboardData.analytics;
  }
}

export async function sendChatMessage(query) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const res = await fetch(`${API_BASE}/chat/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("sendChatMessage failed or timed out, using fallback:", err);
    const match = fallback.find((f: any) => query.toLowerCase().includes(f.keyword));
    if (match) {
      return { response: match.response, source: "offline", isFallback: true };
    }
    return {
      response: "Chat is currently unavailable. Please try again in a moment or ask a simpler question.",
      source: "offline",
      isFallback: true
    };
  }
}

export async function classifyFIR(text) {
  try {
    const response = await fetch(`${API_BASE}/fir/classify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text })
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("classifyFIR failed, falling back to mock data:", error);
    return fallbackData.firClassification;
  }
}

export async function fetchHotspots() {
  try {
    const response = await fetch(`${API_BASE}/hotspot/`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("fetchHotspots failed, falling back to demo data:", error);
    return demoDashboardData.hotspots;
  }
}

export async function fetchAnomalies() {
  try {
    const response = await fetch(`${API_BASE}/anomaly/`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("fetchAnomalies failed, falling back to demo data:", error);
    return demoDashboardData.anomalies;
  }
}

export async function fetchCrimeCategoryDetails(crimeType) {
  try {
    const response = await fetch(`${API_BASE}/analytics/crime/${encodeURIComponent(crimeType)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("fetchCrimeCategoryDetails failed, falling back to demo data:", error);
    const fallback = demoDashboardData.crimeDetails?.[crimeType]
    if (fallback) {
      return fallback
    }

    const baseCount = demoDashboardData.analytics.crime_breakdown.find((item: any) => item.type.toLowerCase() === crimeType.toLowerCase())?.count || 24
    return {
      crime_type: crimeType,
      total_cases: baseCount,
      open_cases: Math.max(0, Math.round(baseCount * 0.7)),
      under_investigation: Math.max(0, Math.round(baseCount * 0.2)),
      closed_cases: Math.max(0, baseCount - Math.round(baseCount * 0.7) - Math.round(baseCount * 0.2)),
      monthly_trend: demoDashboardData.analytics.monthly_trend.map((item: any, index: number) => ({ month: item.month, count: Math.max(1, Math.round(baseCount * (0.08 + index * 0.02))) })),
      districts: demoDashboardData.analytics.districts.map((district: any) => ({ district: district.name, count: Math.max(1, Math.round(district.count * 0.3)) })),
      ipc_breakdown: [
        { ipc_section: "Unknown IPC", count: Math.max(1, Math.round(baseCount * 0.6)) },
        { ipc_section: "Other IPC", count: Math.max(1, Math.round(baseCount * 0.4)) }
      ],
      patterns: [
        `This category shows approximately ${baseCount} cases in the current dataset.`,
        "Case volume is concentrated in major Karnataka districts.",
        "Investigate first in the districts with the highest reported counts."
      ],
      sample_firs: [
        {
          fir_number: "FIR/2025/SAMP/00001",
          district: demoDashboardData.analytics.districts[0].name,
          date: "2025-06-01",
          status: "Open",
          ipc_section: "Unknown IPC",
          station: `${demoDashboardData.analytics.districts[0].name} Police Station`
        }
      ]
    }
  }
}

