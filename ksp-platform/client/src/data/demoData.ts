export const demoDashboardData = {
  analytics: {
    total_firs: 824,
    open_cases: 721,
    solved_cases: 103,
    districts: [
      { name: "Bengaluru Urban", count: 142, lat: 12.9716, lng: 77.5946 },
      { name: "Mysuru", count: 88, lat: 12.2958, lng: 76.6394 },
      { name: "Belagavi", count: 76, lat: 15.8497, lng: 74.4977 },
      { name: "Kalaburagi", count: 65, lat: 17.3297, lng: 76.8343 },
      { name: "Hubballi-Dharwad", count: 54, lat: 15.4293, lng: 75.0506 },
      { name: "Mangaluru", count: 48, lat: 12.9141, lng: 74.8560 }
    ],
    monthly_trend: [
      { month: "2025-01", count: 65 },
      { month: "2025-02", count: 72 },
      { month: "2025-03", count: 80 },
      { month: "2025-04", count: 92 },
      { month: "2025-05", count: 110 },
      { month: "2025-06", count: 125 }
    ],
    crime_breakdown: [
      { type: "Cybercrime", count: 320 },
      { type: "Theft", count: 180 },
      { type: "Assault", count: 120 },
      { type: "Narcotics", count: 90 },
      { type: "Fraud", count: 70 },
      { type: "Other", count: 44 }
    ]
  },
  hotspots: {
    predictions: [
      { district: "Bengaluru Urban", risk: "High Risk", confidence: 0.94 },
      { district: "Kalaburagi", risk: "Moderate Risk", confidence: 0.81 },
      { district: "Mysuru", risk: "Elevated Risk", confidence: 0.78 }
    ]
  },
  crimeDetails: {
    "Theft": {
      crime_type: "Theft",
      total_cases: 180,
      open_cases: 124,
      under_investigation: 38,
      closed_cases: 18,
      monthly_trend: [
        { month: "2025-01", count: 12 },
        { month: "2025-02", count: 18 },
        { month: "2025-03", count: 15 },
        { month: "2025-04", count: 21 },
        { month: "2025-05", count: 28 },
        { month: "2025-06", count: 26 }
      ],
      districts: [
        { district: "Bengaluru Urban", count: 60 },
        { district: "Mysuru", count: 24 },
        { district: "Belagavi", count: 18 }
      ],
      ipc_breakdown: [
        { ipc_section: "379 IPC", count: 70 },
        { ipc_section: "380 IPC", count: 42 },
        { ipc_section: "454 IPC", count: 18 }
      ],
      patterns: [
        "Most theft FIRs are clustered around urban districts.",
        "Vehicle theft and shoplifting are the primary sub-patterns.",
        "Nighttime property theft reports rise on weekends."
      ],
      sample_firs: [
        { fir_number: "FIR/2025/BEN/00007", district: "Bengaluru Urban", date: "2025-06-04", status: "Open", ipc_section: "379 IPC", station: "Bengaluru Urban Town Police Station" },
        { fir_number: "FIR/2025/MYS/00023", district: "Mysuru", date: "2025-05-18", status: "Under Investigation", ipc_section: "380 IPC", station: "Mysuru Town Police Station" },
        { fir_number: "FIR/2025/BEL/00041", district: "Belagavi", date: "2025-05-12", status: "Open", ipc_section: "454 IPC", station: "Belagavi Town Police Station" }
      ]
    },
    "Cybercrime": {
      crime_type: "Cybercrime",
      total_cases: 120,
      open_cases: 99,
      under_investigation: 16,
      closed_cases: 5,
      monthly_trend: [
        { month: "2025-01", count: 8 },
        { month: "2025-02", count: 10 },
        { month: "2025-03", count: 14 },
        { month: "2025-04", count: 18 },
        { month: "2025-05", count: 28 },
        { month: "2025-06", count: 34 }
      ],
      districts: [
        { district: "Bengaluru Urban", count: 48 },
        { district: "Kalaburagi", count: 18 },
        { district: "Mysuru", count: 14 }
      ],
      ipc_breakdown: [
        { ipc_section: "420 IPC", count: 40 },
        { ipc_section: "66C IT Act", count: 32 },
        { ipc_section: "66D IT Act", count: 18 }
      ],
      patterns: [
        "Online fraud and phishing remain the leading cybercrime patterns.",
        "Most cases involve financial scams tied to fake investment schemes.",
        "Bengaluru continues to report the highest volume of digital fraud." 
      ],
      sample_firs: [
        { fir_number: "FIR/2025/BEN/00058", district: "Bengaluru Urban", date: "2025-06-07", status: "Open", ipc_section: "420 IPC", station: "Bengaluru Urban Cyber Crime Cell" },
        { fir_number: "FIR/2025/KAL/00031", district: "Kalaburagi", date: "2025-05-22", status: "Under Investigation", ipc_section: "66C IT Act", station: "Kalaburagi Cyber Unit" }
      ]
    }
  },
  anomalies: {
    alerts: [
      {
        district: "Bengaluru Urban",
        crime_type: "Cybercrime",
        message: "Online fraud and phishing incidents spiked 23% in the last 2 weeks.",
        severity: "high"
      },
      {
        district: "Kalaburagi",
        crime_type: "Theft",
        message: "A cluster of vehicle thefts has emerged around the central bus station.",
        severity: "medium"
      },
      {
        district: "Mangaluru",
        crime_type: "Assault",
        message: "Assault reports are trending higher near the seaport industrial area.",
        severity: "medium"
      }
    ]
  }
}
