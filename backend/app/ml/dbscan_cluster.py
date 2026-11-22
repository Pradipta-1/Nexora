import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sklearn.cluster import DBSCAN
from sklearn.metrics import silhouette_score

class DBSCANDiscovery:
    """
    Density-Based Spatial Clustering of Applications with Noise (DBSCAN).
    Detects arbitrary shaped clusters and separates outlier noise points (-1).
    """
    def __init__(self, eps: float = 0.5, min_samples: int = 5):
        self.eps = eps
        self.min_samples = min_samples
        self.model = DBSCAN(eps=eps, min_samples=min_samples)

    def fit_predict(
        self, 
        scaled_matrix: np.ndarray, 
        cleaned_df: pd.DataFrame, 
        feature_names: List[str]
    ) -> Dict[str, Any]:
        labels = self.model.fit_predict(scaled_matrix)
        n_samples = len(labels)
        
        unique_labels = set(labels)
        has_noise = -1 in unique_labels
        cluster_labels = [label for label in unique_labels if label != -1]
        n_clusters = len(cluster_labels)
        noise_count = int(np.sum(labels == -1))
        noise_pct = round((noise_count / n_samples) * 100, 2) if n_samples > 0 else 0

        # Silhouette score for valid clusters (excluding noise)
        sil_score = None
        if n_clusters >= 2:
            non_noise_mask = (labels != -1)
            if np.sum(non_noise_mask) > n_clusters:
                try:
                    sil_score = float(silhouette_score(
                        scaled_matrix[non_noise_mask], 
                        labels[non_noise_mask]
                    ))
                except Exception:
                    pass

        # Cluster summaries
        cluster_summaries = []
        overall_means = cleaned_df[feature_names].mean()

        for c_id in sorted(cluster_labels):
            mask = (labels == c_id)
            c_size = int(np.sum(mask))
            c_pct = round((c_size / n_samples) * 100, 2)
            c_data = cleaned_df.loc[mask, feature_names]
            c_means = c_data.mean().to_dict()

            key_traits = []
            for f in feature_names:
                mean_val = float(c_means[f])
                base_mean = float(overall_means[f])
                pct_diff = 0.0
                if abs(base_mean) > 1e-6:
                    pct_diff = round(((mean_val - base_mean) / abs(base_mean)) * 100, 1)
                
                if abs(pct_diff) >= 15.0:
                    direction = "higher" if pct_diff > 0 else "lower"
                    key_traits.append({
                        "feature": f,
                        "cluster_mean": round(mean_val, 2),
                        "dataset_mean": round(base_mean, 2),
                        "difference_percent": pct_diff,
                        "description": f"{abs(pct_diff)}% {direction} than average"
                    })
            key_traits.sort(key=lambda x: abs(x["difference_percent"]), reverse=True)

            cluster_summaries.append({
                "cluster_id": int(c_id),
                "name": f"Dense Core {c_id + 1}",
                "size": c_size,
                "percentage": c_pct,
                "means": {k: round(float(v), 2) for k, v in c_means.items()},
                "key_traits": key_traits[:3]
            })

        return {
            "algorithm": "dbscan",
            "n_clusters": n_clusters,
            "noise_count": noise_count,
            "noise_percentage": noise_pct,
            "labels": labels.tolist(),
            "silhouette_score": sil_score,
            "cluster_summaries": cluster_summaries
        }
