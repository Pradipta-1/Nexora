import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sklearn.ensemble import IsolationForest

class AnomalyDetector:
    """
    Isolation Forest for unsupervised outlier and anomaly discovery.
    Calculates anomaly scores and explains individual record deviations
    via feature z-score divergence relative to normal population.
    """
    def __init__(self, contamination: float = 0.05, random_state: int = 42):
        self.contamination = contamination
        self.random_state = random_state
        self.model = IsolationForest(
            contamination=contamination, 
            random_state=random_state,
            n_estimators=100
        )

    def fit_predict(
        self, 
        scaled_matrix: np.ndarray, 
        cleaned_df: pd.DataFrame, 
        original_df: pd.DataFrame, 
        feature_names: List[str],
        original_stats: Dict[str, Dict[str, float]]
    ) -> Dict[str, Any]:
        # Fit Isolation Forest
        self.model.fit(scaled_matrix)
        preds = self.model.predict(scaled_matrix)  # 1 for inliers, -1 for anomalies
        raw_scores = self.model.decision_function(scaled_matrix)  # Lower is more abnormal

        # Normalize score to [0, 1] range where 1.0 is extremely anomalous
        min_s = float(raw_scores.min())
        max_s = float(raw_scores.max())
        score_range = max_s - min_s if max_s > min_s else 1.0
        normalized_anomaly_scores = [
            round(1.0 - ((s - min_s) / score_range), 4) for s in raw_scores
        ]

        anomaly_indices = np.where(preds == -1)[0]
        total_anomalies = len(anomaly_indices)

        # Build detailed explanations for top anomalies
        anomaly_records = []
        for idx in anomaly_indices:
            row_clean = cleaned_df.iloc[idx]
            original_row = original_df.iloc[idx].to_dict()
            norm_score = normalized_anomaly_scores[idx]

            # Calculate feature deviations (Z-scores) to explain anomaly cause
            contributions = []
            for f in feature_names:
                stats = original_stats.get(f)
                val = float(row_clean[f])
                if stats and stats["std"] > 0:
                    z = (val - stats["mean"]) / stats["std"]
                    if abs(z) >= 1.5:  # significant deviation
                        direction = "significantly higher" if z > 0 else "significantly lower"
                        contributions.append({
                            "feature": f,
                            "value": round(val, 2),
                            "mean": round(stats["mean"], 2),
                            "z_score": round(float(z), 2),
                            "reason": f"{round(abs(z), 1)} std dev {direction} than dataset average"
                        })

            # Sort by largest deviation
            contributions.sort(key=lambda x: abs(x["z_score"]), reverse=True)

            # Convert non-serializable objects in original row
            cleaned_row_dict = {}
            for k, v in original_row.items():
                if pd.isna(v):
                    cleaned_row_dict[k] = None
                elif isinstance(v, (np.integer, int)):
                    cleaned_row_dict[k] = int(v)
                elif isinstance(v, (np.floating, float)):
                    cleaned_row_dict[k] = round(float(v), 2)
                else:
                    cleaned_row_dict[k] = str(v)

            anomaly_records.append({
                "record_index": int(idx),
                "anomaly_score": norm_score,
                "feature_values": cleaned_row_dict,
                "top_contributing_features": contributions[:3]
            })

        # Sort anomaly records by most severe anomaly score descending
        anomaly_records.sort(key=lambda x: x["anomaly_score"], reverse=True)

        return {
            "algorithm": "isolation_forest",
            "total_anomalies": total_anomalies,
            "anomaly_percentage": round((total_anomalies / len(preds)) * 100, 2),
            "is_anomaly": [bool(p == -1) for p in preds],
            "anomaly_scores": normalized_anomaly_scores,
            "anomalies": anomaly_records
        }
