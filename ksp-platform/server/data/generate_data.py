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

# Verify constraints
print("\n--- Validation ---")
print(f"Total rows: {len(df)}")
print("\nTop 5 Districts (Expect urban districts to be higher):")
print(df['district'].value_counts().head(5))
print("\nTheft incidents by month (Expect peak in Dec/Jan):")
df['month'] = pd.to_datetime(df['date']).dt.month
print(df[df['crime_type'] == 'Theft']['month'].value_counts().head(5))
