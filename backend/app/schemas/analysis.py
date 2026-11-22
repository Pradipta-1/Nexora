from typing import Any, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.dataset import DatasetSummary

class RunAnalysisRequest(BaseModel):
    algorithm_type: str = "full_discovery"
    selected_features: Optional[list[str]] = None
    k_clusters: int = 3
    dbscan_eps: float = 0.5
    dbscan_min_samples: int = 5
    contamination: float = 0.05
    scaling_method: str = "standard"

class DiscoveredPatternDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    pattern_type: str
    title: str
    description: str
    affected_columns: list[str]
    affected_records: int
    confidence_score: Optional[float] = None
    statistical_evidence: Optional[dict[str, Any]] = None

class AnomalyRecordDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    record_index: int
    anomaly_score: float
    feature_values: dict[str, Any]
    top_contributing_features: list[dict[str, Any]]

class AnalysisRunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    dataset_id: str
    algorithm_type: str
    selected_features: list[str]
    hyperparameters: dict[str, Any]
    silhouette_score: Optional[float] = None
    davies_bouldin_index: Optional[float] = None
    explained_variance_ratio: Optional[list[float]] = None
    total_anomalies_found: int
    cluster_summaries: Optional[list[dict[str, Any]]] = None
    pca_projections: Optional[list[dict[str, Any]]] = None
    executive_summary: Optional[str] = None
    created_at: datetime
    patterns: list[DiscoveredPatternDTO] = []
    anomalies: list[AnomalyRecordDTO] = []

class DashboardStatsResponse(BaseModel):
    total_datasets: int
    total_records_analyzed: int
    total_patterns_discovered: int
    total_anomalies_detected: int
    recent_analyses: list[dict[str, Any]]
    recent_datasets: list[DatasetSummary]
