import numpy as np
import pandas as pd
from typing import Dict, Any, List

class StatisticalRelationships:
    """
    Computes Pearson and Spearman correlation matrices, 
    detects strong correlations, and surfaces interesting relationships.
    Strictly emphasizes that correlation does not establish causality.
    """
    def __init__(self, threshold: float = 0.40):
        self.threshold = threshold

    def analyze(self, cleaned_df: pd.DataFrame, feature_names: List[str]) -> Dict[str, Any]:
        if len(feature_names) < 2:
            return {
                "columns": feature_names,
                "pearson_matrix": [[1.0]],
                "spearman_matrix": [[1.0]],
                "strong_relationships": []
            }

        df_subset = cleaned_df[feature_names]
        pearson_df = df_subset.corr(method="pearson")
        spearman_df = df_subset.corr(method="spearman")

        # Extract pairwise significant relationships (|r| >= threshold)
        strong_relationships = []
        seen_pairs = set()

        for i, col1 in enumerate(feature_names):
            for j, col2 in enumerate(feature_names):
                if i >= j:
                    continue
                pair = tuple(sorted([col1, col2]))
                if pair in seen_pairs:
                    continue
                seen_pairs.add(pair)

                p_val = pearson_df.loc[col1, col2]
                s_val = spearman_df.loc[col1, col2]

                if pd.isna(p_val):
                    continue

                abs_p = abs(p_val)
                if abs_p >= self.threshold:
                    strength = "Very Strong" if abs_p >= 0.75 else "Moderate to Strong"
                    nature = "Positive" if p_val > 0 else "Inverse (Negative)"
                    
                    explanation = (
                        f"When {col1} increases, {col2} tends to "
                        f"{'increase' if p_val > 0 else 'decrease'}. "
                        f"Note: This reflects a statistical association and does not prove that "
                        f"one variable causes the change in the other."
                    )

                    strong_relationships.append({
                        "feature_a": col1,
                        "feature_b": col2,
                        "pearson_r": round(float(p_val), 3),
                        "spearman_rho": round(float(s_val), 3) if not pd.isna(s_val) else None,
                        "strength": strength,
                        "nature": nature,
                        "explanation": explanation
                    })

        # Sort relationships by magnitude of correlation
        strong_relationships.sort(key=lambda x: abs(x["pearson_r"]), reverse=True)

        return {
            "columns": feature_names,
            "pearson_matrix": pearson_df.round(3).values.tolist(),
            "spearman_matrix": spearman_df.round(3).values.tolist(),
            "strong_relationships": strong_relationships
        }
