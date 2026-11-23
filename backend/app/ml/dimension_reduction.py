import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from sklearn.decomposition import PCA

class DimensionReduction:
    """
    PCA projection into 2D and 3D visual coordinates with explained variance ratios.
    """
    def __init__(self, n_components: int = 3):
        self.n_components = n_components
        self.pca = None

    def transform(
        self, 
        scaled_matrix: np.ndarray,
        cluster_labels: Optional[List[int]] = None,
        is_anomaly: Optional[List[bool]] = None,
        anomaly_scores: Optional[List[float]] = None
    ) -> Dict[str, Any]:
        n_samples, n_features = scaled_matrix.shape
        actual_comp = min(self.n_components, n_features, n_samples)
        
        if actual_comp < 2:
            # Fallback if only 1 feature
            pc1 = scaled_matrix[:, 0].tolist()
            projections = [
                {
                    "index": i,
                    "pc1": round(float(pc1[i]), 3),
                    "pc2": 0.0,
                    "pc3": 0.0,
                    "cluster": int(cluster_labels[i]) if cluster_labels else 0,
                    "is_anomaly": bool(is_anomaly[i]) if is_anomaly else False,
                    "anomaly_score": float(anomaly_scores[i]) if anomaly_scores else 0.0
                }
                for i in range(n_samples)
            ]
            return {
                "components": 1,
                "explained_variance_ratio": [1.0],
                "cumulative_variance": 1.0,
                "projections": projections
            }

        self.pca = PCA(n_components=actual_comp, random_state=42)
        coords = self.pca.fit_transform(scaled_matrix)
        evr = [round(float(v), 4) for v in self.pca.explained_variance_ratio_]
        cum_var = round(float(np.sum(evr)), 4)

        # Limit projection points to 1000 for smooth browser rendering if dataset is very large
        max_points = min(1000, n_samples)
        indices = list(range(n_samples))
        if n_samples > 1000:
            # Ensure all anomalies are included, then sample inliers
            if is_anomaly:
                anom_idx = [i for i, a in enumerate(is_anomaly) if a]
                inlier_idx = [i for i, a in enumerate(is_anomaly) if not a]
                n_to_sample = min(len(inlier_idx), max(0, 1000 - len(anom_idx)))
                sample_inliers = (
                    list(np.random.choice(inlier_idx, n_to_sample, replace=False))
                    if n_to_sample > 0
                    else []
                )
                indices = sorted(anom_idx + sample_inliers)
            else:
                indices = sorted(list(np.random.choice(n_samples, 1000, replace=False)))

        projections = []
        for i in indices:
            row_coord = coords[i]
            projections.append({
                "index": int(i),
                "pc1": round(float(row_coord[0]), 3),
                "pc2": round(float(row_coord[1]), 3),
                "pc3": round(float(row_coord[2]), 3) if actual_comp >= 3 else 0.0,
                "cluster": int(cluster_labels[i]) if cluster_labels is not None else 0,
                "is_anomaly": bool(is_anomaly[i]) if is_anomaly is not None else False,
                "anomaly_score": float(anomaly_scores[i]) if anomaly_scores is not None else 0.0
            })

        return {
            "components": actual_comp,
            "explained_variance_ratio": evr,
            "cumulative_variance": cum_var,
            "projections": projections
        }
