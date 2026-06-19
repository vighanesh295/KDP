import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "synthetic_fir.csv")

# Load data once when the module is imported
try:
    df = pd.read_csv(CSV_PATH)
    # Ensure date is parsed
    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
except Exception as e:
    print(f"Error loading CSV: {e}")
    df = pd.DataFrame()

# Hardcoded District Coordinates for Karnataka
DISTRICT_COORDS = {
    "Bengaluru Urban": {"lat": 12.9716, "lng": 77.5946},
    "Bengaluru Rural": {"lat": 13.2500, "lng": 77.5833},
    "Belagavi": {"lat": 15.8497, "lng": 74.4977},
    "Mangaluru": {"lat": 12.9141, "lng": 74.8560},
    "Tumakuru": {"lat": 13.3392, "lng": 77.1016},
    "Hubballi-Dharwad": {"lat": 15.4293, "lng": 75.0506},
    "Dharwad": {"lat": 15.4589, "lng": 75.0078},
    "Udupi": {"lat": 13.3409, "lng": 74.7421},
    "Vijayanagara": {"lat": 15.2828, "lng": 76.3888},
    "Vijayapura": {"lat": 16.8302, "lng": 75.7100},
    "Mandya": {"lat": 12.5218, "lng": 76.8951},
    "Davangere": {"lat": 14.4644, "lng": 75.9218},
    "Shivamogga": {"lat": 13.9299, "lng": 75.5681},
    "Bagalkot": {"lat": 16.1691, "lng": 75.6615},
    "Raichur": {"lat": 16.2076, "lng": 77.3463},
    "Chikkaballapura": {"lat": 13.4325, "lng": 77.7275},
    "Yadgir": {"lat": 16.7681, "lng": 77.1396},
    "Hassan": {"lat": 13.0068, "lng": 76.1004},
    "Chamarajanagar": {"lat": 11.9261, "lng": 76.9400},
    "Koppal": {"lat": 15.3464, "lng": 76.1554},
    "Chitradurga": {"lat": 14.2251, "lng": 76.3980},
    "Gadag": {"lat": 15.4312, "lng": 75.6366},
    "Chikkamagaluru": {"lat": 13.3161, "lng": 75.7720},
    "Kodagu": {"lat": 12.3375, "lng": 75.8069},
    "Ballari": {"lat": 15.1394, "lng": 76.9214},
    "Haveri": {"lat": 14.7946, "lng": 75.3995},
    "Kalaburagi": {"lat": 17.3297, "lng": 76.8343},
    "Bidar": {"lat": 17.9104, "lng": 77.5199},
    "Mysuru": {"lat": 12.2958, "lng": 76.6394},
    "Ramanagara": {"lat": 12.7150, "lng": 77.2812}
}

def get_total_counts() -> dict:
    if df.empty:
        return {"total_firs": 0, "open_cases": 0, "solved_cases": 0}
        
    total_firs = int(len(df))
    open_cases = int(df['status'].isin(['Open', 'Under Investigation']).sum())
    solved_cases = int((df['status'] == 'Closed').sum())
    
    return {
        "total_firs": total_firs,
        "open_cases": open_cases,
        "solved_cases": solved_cases
    }

def get_monthly_trend() -> list:
    if df.empty or 'date' not in df.columns:
        return []
        
    valid_dates = df.dropna(subset=['date']).copy()
    if valid_dates.empty:
        return []
        
    valid_dates['month'] = valid_dates['date'].dt.strftime('%Y-%m')
    trend = valid_dates.groupby('month').size().reset_index(name='count')
    trend = trend.sort_values('month')
    
    return trend.to_dict('records')

def get_crime_breakdown() -> list:
    if df.empty or 'crime_type' not in df.columns:
        return []
        
    breakdown = df.groupby('crime_type').size().reset_index(name='count')
    breakdown = breakdown.rename(columns={'crime_type': 'type'})
    breakdown = breakdown.sort_values('count', ascending=False)
    
    return breakdown.to_dict('records')


def get_crime_details(crime_type: str) -> dict:
    if df.empty or 'crime_type' not in df.columns:
        return {
            'crime_type': crime_type,
            'total_cases': 0,
            'open_cases': 0,
            'under_investigation': 0,
            'closed_cases': 0,
            'monthly_trend': [],
            'districts': [],
            'ipc_breakdown': [],
            'patterns': [],
            'sample_firs': []
        }

    crime_type_normalized = crime_type.strip().lower()
    filtered = df[df['crime_type'].str.lower() == crime_type_normalized].copy()
    if filtered.empty:
        return {
            'crime_type': crime_type,
            'total_cases': 0,
            'open_cases': 0,
            'under_investigation': 0,
            'closed_cases': 0,
            'monthly_trend': [],
            'districts': [],
            'ipc_breakdown': [],
            'patterns': [],
            'sample_firs': []
        }

    filtered['date'] = pd.to_datetime(filtered['date'], errors='coerce')
    filtered['month'] = filtered['date'].dt.strftime('%Y-%m')

    total_cases = int(len(filtered))
    open_cases = int(filtered['status'].isin(['Open', 'Under Investigation']).sum())
    closed_cases = int((filtered['status'] == 'Closed').sum())
    under_investigation = total_cases - open_cases - closed_cases

    monthly_trend_df = filtered.dropna(subset=['month']).groupby('month').size().reset_index(name='count')
    monthly_trend_df = monthly_trend_df.sort_values('month')
    monthly_trend = monthly_trend_df.to_dict('records')

    district_counts_df = filtered.groupby('district').size().reset_index(name='count')
    district_counts_df = district_counts_df.sort_values('count', ascending=False)
    districts = district_counts_df.to_dict('records')

    ipc_counts_df = filtered.groupby('ipc_section').size().reset_index(name='count')
    ipc_counts_df = ipc_counts_df.sort_values('count', ascending=False)
    ipc_breakdown = ipc_counts_df.to_dict('records')

    sample_firs = filtered.sort_values('date', ascending=False).head(8)
    sample_list = []
    for _, row in sample_firs.iterrows():
        sample_list.append({
            'fir_number': row.get('fir_number', ''),
            'district': row.get('district', ''),
            'date': str(row.get('date', ''))[:10],
            'status': row.get('status', ''),
            'ipc_section': row.get('ipc_section', ''),
            'station': row.get('station', '')
        })

    top_districts = districts[:3]
    top_ipc_sections = ipc_breakdown[:3]
    patterns = [
        f"Most FIRs are registered in {top_districts[0]['district']}.",
        f"Leading charge is {top_ipc_sections[0]['ipc_section']} with {top_ipc_sections[0]['count']} cases.",
        f"There are currently {open_cases} open or active cases for this type."
    ]

    return {
        'crime_type': crime_type,
        'total_cases': total_cases,
        'open_cases': open_cases,
        'under_investigation': under_investigation,
        'closed_cases': closed_cases,
        'monthly_trend': monthly_trend,
        'districts': districts,
        'ipc_breakdown': ipc_breakdown,
        'patterns': patterns,
        'sample_firs': sample_list
    }


def get_district_counts() -> list:
    if df.empty or 'district' not in df.columns:
        return []
        
    counts = df.groupby('district').size().reset_index(name='count')
    
    result = []
    for _, row in counts.iterrows():
        dist = row['district']
        count = int(row['count'])
        
        coords = DISTRICT_COORDS.get(dist, {"lat": 0.0, "lng": 0.0})
        
        result.append({
            "district": dist,
            "count": count,
            "lat": coords["lat"],
            "lng": coords["lng"]
        })
        
    result.sort(key=lambda x: x['count'], reverse=True)
    return result

if __name__ == "__main__":
    print("Total Counts:", get_total_counts())
    print("Monthly Trend:", get_monthly_trend()[:3])
    print("Crime Breakdown:", get_crime_breakdown()[:3])
    print("District Counts:", get_district_counts()[:3])
