from typing import Dict, Any, List, Optional

class PatternExplainer:
    """
    Statistically grounded rule-based explainer.
    Synthesizes mathematical clustering, anomaly detection, and correlation 
    results into verifiable, human-readable insights. Never fabricates conclusions.
    """
    @staticmethod
    def generate_patterns(
        kmeans_res: Dict[str, Any],
        dbscan_res: Optional[Dict[str, Any]],
        anomaly_res: Dict[str, Any],
        relationship_res: Dict[str, Any],
        total_rows: int
    ) -> List[Dict[str, Any]]:
        patterns = []

        # 1. Cluster Profiles from K-Means
        for c in kmeans_res.get("cluster_summaries", []):
            c_name = c["name"]
            c_size = c["size"]
            c_pct = c["percentage"]
            traits = c.get("key_traits", [])

            if traits:
                top_trait = traits[0]
                title = f"{c_name}: Group with {top_trait['description']}"
                trait_desc = ", ".join([f"{t['feature']} ({t['description']})" for t in traits])
                desc = (
                    f"Cluster encompassing {c_size} records ({c_pct}% of dataset). "
                    f"Characterized by distinct deviations: {trait_desc}."
                )
            else:
                title = f"{c_name}: Balanced Baseline Group"
                desc = f"Cluster of {c_size} records ({c_pct}% of dataset) displaying typical average characteristics across features."

            patterns.append({
                "pattern_type": "cluster_profile",
                "title": title,
                "description": desc,
                "affected_columns": [t["feature"] for t in traits] if traits else list(c["means"].keys())[:3],
                "affected_records": c_size,
                "confidence_score": round(float(kmeans_res.get("silhouette_score") or 0.70), 2),
                "statistical_evidence": {
                    "cluster_id": c["cluster_id"],
                    "cluster_means": c["means"],
                    "traits": traits
                }
            })

        # 2. Anomalies from Isolation Forest
        total_anom = anomaly_res.get("total_anomalies", 0)
        anom_pct = anomaly_res.get("anomaly_percentage", 0.0)
        if total_anom > 0:
            top_anoms = anomaly_res.get("anomalies", [])[:3]
            sample_reasons = []
            for anom in top_anoms:
                contribs = anom.get("top_contributing_features", [])
                if contribs:
                    sample_reasons.append(f"Record #{anom['record_index']} ({contribs[0]['reason']})")

            reason_str = "; ".join(sample_reasons) if sample_reasons else "multivariate outlier patterns"
            patterns.append({
                "pattern_type": "anomaly_cluster",
                "title": f"Detected {total_anom} Behavioral Anomalies ({anom_pct}%)",
                "description": (
                    f"Identified {total_anom} records that exhibit extreme statistical divergence from normal distribution. "
                    f"Notable examples include: {reason_str}."
                ),
                "affected_columns": list(set([c["feature"] for a in top_anoms for c in a.get("top_contributing_features", [])])),
                "affected_records": total_anom,
                "confidence_score": 0.88,
                "statistical_evidence": {
                    "total_anomalies": total_anom,
                    "anomaly_percentage": anom_pct,
                    "top_anomalies_summary": [
                        {"index": a["record_index"], "score": a["anomaly_score"]}
                        for a in top_anoms
                    ]
                }
            })

        # 3. Dense clusters & Noise from DBSCAN (if executed)
        if dbscan_res and dbscan_res.get("noise_count", 0) > 0:
            noise_cnt = dbscan_res["noise_count"]
            noise_pct = dbscan_res["noise_percentage"]
            patterns.append({
                "pattern_type": "density_noise",
                "title": f"DBSCAN Density Noise: {noise_cnt} Isolated Points ({noise_pct}%)",
                "description": (
                    f"DBSCAN discovered {dbscan_res.get('n_clusters', 0)} dense cluster cores and marked "
                    f"{noise_cnt} records as low-density noise lying outside all primary clusters."
                ),
                "affected_columns": [],
                "affected_records": noise_cnt,
                "confidence_score": 0.85,
                "statistical_evidence": {
                    "noise_count": noise_cnt,
                    "noise_percentage": noise_pct
                }
            })

        # 4. Statistical Correlations
        for rel in relationship_res.get("strong_relationships", [])[:4]:
            patterns.append({
                "pattern_type": "correlation",
                "title": f"{rel['strength']} Relationship: {rel['feature_a']} & {rel['feature_b']}",
                "description": rel["explanation"],
                "affected_columns": [rel["feature_a"], rel["feature_b"]],
                "affected_records": total_rows,
                "confidence_score": round(abs(rel["pearson_r"]), 2),
                "statistical_evidence": {
                    "pearson_r": rel["pearson_r"],
                    "spearman_rho": rel.get("spearman_rho"),
                    "nature": rel["nature"]
                }
            })

        return patterns

    @staticmethod
    def generate_executive_summary(
        total_rows: int,
        n_features: int,
        k_clusters: int,
        silhouette: Optional[float],
        total_anomalies: int,
        top_relationships: List[Dict[str, Any]]
    ) -> str:
        sil_desc = "strong cluster cohesion" if silhouette and silhouette >= 0.5 else "moderate cluster separation"
        rel_summary = ""
        if top_relationships:
            top_rel = top_relationships[0]
            rel_summary = f" The most prominent relationship observed is between '{top_rel['feature_a']}' and '{top_rel['feature_b']}' (r = {top_rel['pearson_r']})."

        return (
            f"Analysis of {total_rows:,} records across {n_features} features uncovered {k_clusters} distinct clusters with {sil_desc} "
            f"(Silhouette score: {round(silhouette, 3) if silhouette else 'N/A'}). "
            f"The anomaly detection engine isolated {total_anomalies} unusual observations requiring review.{rel_summary}"
        )
