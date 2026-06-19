import os
import pandas as pd
from sklearn.cluster import KMeans
import joblib
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "data", "synthetic_fir.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODELS_DIR, "hotspot_model.pkl")
FEATURES_PATH = os.path.join(MODELS_DIR, "district_features.csv")

os.makedirs(MODELS_DIR, exist_ok=True)

def prepare_features():
    df = pd.read_csv(CSV_PATH)
    if df.empty:
        return pd.DataFrame()
        
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df = df.dropna(subset=['date'])
    df['month'] = df['date'].dt.to_period('M')
    
    # Aggregate crimes per district per month
    monthly_counts = df.groupby(['district', 'month']).size().reset_index(name='count')
    
    # Calculate district-level features
    features = monthly_counts.groupby('district').agg(
        total_crimes=('count', 'sum'),
        avg_crimes_per_month=('count', 'mean'),
        max_crimes=('count', 'max')
    ).reset_index()
    
    return features

def train_model():
    features = prepare_features()
    if features.empty:
        print("No data available to train model.")
        return
        
    # We will use avg_crimes_per_month and max_crimes as features
    X = features[['avg_crimes_per_month', 'max_crimes']].values
    
    # Train K-Means (k=3)
    kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
    kmeans.fit(X)
    
    # Label clusters as High, Medium, Low Risk based on cluster centroids
    centroids = kmeans.cluster_centers_
    magnitudes = centroids.sum(axis=1)
    
    sorted_idx = np.argsort(magnitudes)
    
    # Mapping from model label to risk level
    label_map = {
        sorted_idx[0]: "Low",
        sorted_idx[1]: "Medium",
        sorted_idx[2]: "High"
    }
    
    model_data = {
        "kmeans": kmeans,
        "label_map": label_map
    }
    
    joblib.dump(model_data, MODEL_PATH)
    features.to_csv(FEATURES_PATH, index=False)
    print("Model trained and saved to", MODEL_PATH)

def predict_hotspots() -> list:
    if not os.path.exists(MODEL_PATH) or not os.path.exists(FEATURES_PATH):
        train_model()
        
    if not os.path.exists(MODEL_PATH):
        return []
        
    model_data = joblib.load(MODEL_PATH)
    kmeans = model_data["kmeans"]
    label_map = model_data["label_map"]
    
    features = pd.read_csv(FEATURES_PATH)
    if features.empty:
        return []
        
    X = features[['avg_crimes_per_month', 'max_crimes']].values
    predictions = kmeans.predict(X)
    distances = kmeans.transform(X)
    
    results = []
    for i, row in features.iterrows():
        cluster_label = predictions[i]
        risk_level = label_map[cluster_label]
        
        # Calculate pseudo-confidence based on distance to centroid
        dist = distances[i, cluster_label]
        confidence = round(1.0 / (1.0 + (dist * 0.1)), 2)
        confidence = min(0.99, max(0.50, confidence))
        
        results.append({
            "district": row['district'],
            "risk_level": risk_level,
            "confidence": confidence
        })
        
    risk_order = {"High": 0, "Medium": 1, "Low": 2}
    results.sort(key=lambda x: (risk_order[x["risk_level"]], -x["confidence"]))
    
    return results

# Run training on startup if pkl file does not exist
if not os.path.exists(MODEL_PATH):
    print("Training model on startup...")
    train_model()

if __name__ == "__main__":
    preds = predict_hotspots()
    import json
    print(json.dumps(preds[:5], indent=2))
