import numpy as np
import pandas as pd
from faker import Faker
import datetime
import os

np.random.seed(42)
fake = Faker('en_IN')
Faker.seed(42)

districts = [
    "Bengaluru Urban", "Mysuru", "Hubballi-Dharwad", "Belagavi", "Mangaluru", 
    "Kalaburagi", "Davangere", "Shivamogga", "Vijayapura", "Ballari", "Tumakuru", 
    "Raichur", "Bidar", "Hassan", "Udupi", "Dharwad", "Chikkamagaluru", "Kodagu", 
    "Mandya", "Chitradurga", "Gadag", "Yadgir", "Ramanagara", "Chamarajanagar", 
    "Chikkaballapura", "Bagalkot", "Haveri", "Koppal", "Vijayanagara", "Bengaluru Rural"
]
urban_districts = ["Bengaluru Urban", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi"]

weights = [5 if d in urban_districts else 1 for d in districts]
total_weight = sum(weights)
probs = [w / total_weight for w in weights]

crime_ipc_map = {
    "Cybercrime": "66C IT Act",
    "Theft": "379 IPC",
    "Robbery": "392 IPC",
    "Assault": "351 IPC",
    "Murder": "302 IPC",
    "Fraud": "420 IPC",
    "Kidnapping": "359 IPC",
    "Drug offences": "21 NDPS Act",
    "Sexual offences": "375 IPC",
    "Property damage": "425 IPC",
    "Domestic violence": "498A IPC",
    "Other": "Others"
}
crimes = list(crime_ipc_map.keys())

num_records = 800

start_date = datetime.datetime(2024, 1, 1)
end_date = datetime.datetime(2025, 5, 31)
total_days = (end_date - start_date).days

data = []
for i in range(num_records):
    district = np.random.choice(districts, p=probs)
    crime_type = np.random.choice(crimes)
    ipc_section = crime_ipc_map[crime_type]
    
    # Dates range from Jan 2024 to May 2025 with seasonal variation (theft peaks in Dec-Jan)
    if crime_type == "Theft":
        # Day 365 is end of Dec 2024 / start of Jan 2025.
        days_offset = int(np.random.normal(loc=365, scale=45))
        days_offset = np.clip(days_offset, 0, total_days)
    else:
        days_offset = int(np.random.uniform(0, total_days))
        
    date = start_date + datetime.timedelta(days=float(days_offset))
    
    status = np.random.choice(["Open", "Under Investigation", "Closed"], p=[0.6, 0.3, 0.1])
    
    officer_name = fake.name()
    accused_name = fake.name()
    
    # normal for ages, clipping to realistic bounds
    accused_age = int(np.clip(np.random.normal(loc=35, scale=12), 18, 90))
    
    station = f"{district} Town Police Station"
    
    dist_code = district[:3].upper()
    nnn = f"{i+1:05d}"
    fir_number = f"FIR/{date.year}/{dist_code}/{nnn}"
    
    data.append({
        "fir_number": fir_number,
        "district": district,
        "crime_type": crime_type,
        "ipc_section": ipc_section,
        "date": date.strftime("%Y-%m-%d"),
        "status": status,
        "officer_name": officer_name,
        "accused_name": accused_name,
        "accused_age": accused_age,
        "station": station
    })

df = pd.DataFrame(data)

output_dir = os.path.dirname(os.path.abspath(__file__))
os.makedirs(output_dir, exist_ok=True)
csv_path = os.path.join(output_dir, "synthetic_fir.csv")

df.to_csv(csv_path, index=False)
print(f"SUCCESS: Generated {len(df)} rows in synthetic_fir.csv")

# Create district socioeconomic feature dataset
semi_urban_districts = [
    "Bengaluru Rural", "Kalaburagi", "Davangere", "Shivamogga", "Vijayapura", "Ballari",
    "Hassan", "Bagalkot", "Raichur", "Mandya", "Chitradurga", "Gadag", "Haveri", "Bidar", "Koppal"
]

rural_districts = [d for d in districts if d not in urban_districts + semi_urban_districts]

feature_rows = []
for district in districts:
    if district in urban_districts:
        density = np.random.normal(loc=3300, scale=420)
        literacy = np.random.normal(loc=93.0, scale=2.5)
        unemployment = np.random.normal(loc=5.2, scale=1.0)
        urbanization = np.random.normal(loc=0.92, scale=0.03)
    elif district in semi_urban_districts:
        density = np.random.normal(loc=1200, scale=240)
        literacy = np.random.normal(loc=86.5, scale=2.8)
        unemployment = np.random.normal(loc=7.3, scale=1.1)
        urbanization = np.random.normal(loc=0.62, scale=0.06)
    else:
        density = np.random.normal(loc=310, scale=120)
        literacy = np.random.normal(loc=75.5, scale=3.5)
        unemployment = np.random.normal(loc=10.2, scale=1.2)
        urbanization = np.random.normal(loc=0.30, scale=0.07)

    feature_rows.append({
        "district": district,
        "population_density": int(max(60, np.round(density))),
        "literacy_rate": round(min(99.9, max(55.0, literacy)), 1),
        "unemployment_rate": round(min(14.0, max(2.5, unemployment)), 1),
        "urbanization_index": round(min(0.99, max(0.12, urbanization)), 2)
    })

features_df = pd.DataFrame(feature_rows)
feature_csv_path = os.path.join(output_dir, "district_features.csv")
features_df.to_csv(feature_csv_path, index=False)
print(f"SUCCESS: Generated {len(features_df)} rows in district_features.csv")

# Verify constraints
print("\n--- Validation ---")
print(f"Total rows: {len(df)}")
print("\nTop 5 Districts (Expect urban districts to be higher):")
print(df['district'].value_counts().head(5))
print("\nTheft incidents by month (Expect peak in Dec/Jan):")
df['month'] = pd.to_datetime(df['date']).dt.month
print(df[df['crime_type'] == 'Theft']['month'].value_counts().head(5))
print("\nDistrict feature sample:\n", features_df.head(6).to_string(index=False))
