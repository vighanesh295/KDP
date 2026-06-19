// @ts-nocheck
import fallback from '../data/fallback.json';

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"; const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
    console.warn("fetchAnalytics failed, falling back to mock data:", error);
    return fallbackData.analytics;
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
    return { response: match?.response || fallback[0].response, source: "offline" };
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
    console.warn("fetchHotspots failed, falling back to mock data:", error);
    return fallbackData.hotspots;
  }
}

export async function fetchAnomalies() {
  try {
    const response = await fetch(`${API_BASE}/anomaly/`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("fetchAnomalies failed, falling back to mock data:", error);
    return fallbackData.anomalies;
  }
}

