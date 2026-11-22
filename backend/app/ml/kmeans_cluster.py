import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, davies_bouldin_score

class KMeansDiscovery:
    """
    K-Means clustering with automated cluster profile calculation,
    silhouette score, and Davies-Bouldin index validation.
    """
    def __init__(self, n_clusters: int = 3, random_state: int = 42):
        self.n_clusters = n_clusters
        self.random_state = random_state
        self.model = KMeans(n_clusters=n_clusters, random_state=random_state, n_init='auto')

    def fit_predict(
        self, 
        scaled_matrix: np.ndarray, 
        cleaned_df: pd.DataFrame, 
        feature_names: List[str]
    ) -> Dict[str, Any]:
        n_samples = scaled_matrix.shape[0]
        actual_k = min(self.n_clusters, max(2, n_samples - 1))
        
        if actual_k != self.n_clusters:
            self.model = KMeans(n_clusters=actual_k, random_state=self.random_state, n_init='auto')
        
        labels = self.model.fit_predict(scaled_matrix)

        # Quantitative evaluation metrics
        sil_score = None
        db_score = None
        if n_samples > actual_k and actual_k >= 2:
            try:
                # Sample for silhouette if dataset is massive for performance
                eval_matrix = scaled_matrix
                eval_labels = labels
                if n_samples > 3000:
                    indices = np.random.choice(n_samples, 3000, replace=False)
                    eval_matrix = scaled_matrix[indices]
                    eval_labels = labels[indices]
                sil_score = float(silhouette_score(eval_matrix, eval_labels))
                db_score = float(davies_bouldin_score(scaled_matrix, labels))
            except Exception:
                pass

        # Calculate cluster summaries
        cluster_summaries = []
        overall_means = cleaned_df[feature_names].mean()

        for c_id in range(actual_k):
            mask = (labels == c_id)
            c_size = int(np.sum(mask))
            c_pct = round((c_size / n_samples) * 100, 2)
            
            c_data = cleaned_df.loc[mask, feature_names]
            c_means = c_data.mean().to_dict()
            
            # Find distinguishing traits compared to dataset average
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
            
            # Sort traits by magnitude of difference
            key_traits.sort(key=lambda x: abs(x["difference_percent"]), reverse=True)

            cluster_summaries.append({
                "cluster_id": c_id,
                "name": f"Segment {c_id + 1}",
                "size": c_size,
                "percentage": c_pct,
                "means": {k: round(float(v), 2) for k, v in c_means.items()},
                "key_traits": key_traits[:3]  # top 3 distinctive characteristics
            })

        return {
            "algorithm": "kmeans",
            "n_clusters": actual_k,
            "labels": labels.tolist(),
            "silhouette_score": sil_score,
            "davies_bouldin_index": db_score,
            "cluster_summaries": cluster_summaries
        }
