import os
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "data", "synthetic_fir.csv")

def detect_anomalies():
    try:
        df = pd.read_csv(CSV_PATH)
        if df.empty:
            return []
            
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df = df.dropna(subset=['date'])
        
        # Aggregate by district, crime_type, and month
        df['month'] = df['date'].dt.to_period('M')
        monthly_counts = df.groupby(['district', 'crime_type', 'month']).size().reset_index(name='count')
        
        if monthly_counts.empty:
            return []
            
        # Identify the latest month in the dataset as "current"
        latest_month = monthly_counts['month'].max()
        
        # Calculate historical average and standard deviation per district and crime type
        historical_stats = monthly_counts.groupby(['district', 'crime_type'])['count'].agg(['mean', 'std']).reset_index()
        # Fill NaN std with 0 (happens if there's only 1 month of data)
        historical_stats['std'] = historical_stats['std'].fillna(0)
        
        # Get counts for the latest month
        current_data = monthly_counts[monthly_counts['month'] == latest_month]
        
        # Merge current data with historical stats
        merged = pd.merge(current_data, historical_stats, on=['district', 'crime_type'], how='inner')
        if merged.empty:
            return []
            
        # Use Isolation Forest on all monthly counts to detect overall magnitude anomalies
        X = monthly_counts[['count']].values
        clf = IsolationForest(contamination=0.05, random_state=42)
        clf.fit(X)
        
        # Predict on current month data
        merged['if_pred'] = clf.predict(merged[['count']].values)
        
        # Flag anomalies where Isolation Forest predicts -1 AND current count > mean + 1.5 * std
        anomalies = merged[
            (merged['if_pred'] == -1) & 
            (merged['count'] > merged['mean'] + 1.5 * merged['std'])
        ]
        
        # Fallback: if Isolation Forest is too strict (e.g. not enough data points), just use the std dev rule
        if anomalies.empty:
            anomalies = merged[merged['count'] > merged['mean'] + 1.5 * merged['std']]
            
        alerts = []
        for _, row in anomalies.iterrows():
            dist = row['district']
            c_type = row['crime_type']
            current_count = row['count']
            avg = row['mean']
            std = row['std']
            
            if avg > 0:
                deviation_percent = round(((current_count - avg) / avg) * 100, 1)
            else:
                deviation_percent = 100.0
                
            # Determine severity
            severity = "high" if (current_count > avg + 3 * std) or (deviation_percent > 100) else "medium"
            
            alerts.append({
                "district": dist,
                "crime_type": c_type,
                "deviation_percent": deviation_percent,
                "severity": severity,
                "message": f"{c_type} is {deviation_percent}% above baseline"
            })
            
        # Sort by highest deviation first
        alerts.sort(key=lambda x: x['deviation_percent'], reverse=True)
        return alerts
        
    except Exception as e:
        print(f"Error in anomaly detection: {e}")
        return []

if __name__ == "__main__":
    import json
    alerts = detect_anomalies()
    print(json.dumps(alerts, indent=2))
