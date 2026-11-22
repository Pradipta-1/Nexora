import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dataset_id = Column(String(36), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    algorithm_type = Column(String(50), nullable=False)  # kmeans, dbscan, isolation_forest, full_discovery
    
    # Configuration
    selected_features = Column(JSON, nullable=False)
    hyperparameters = Column(JSON, nullable=False)
    
    # Quantitative metrics
    silhouette_score = Column(Float, nullable=True)
    davies_bouldin_index = Column(Float, nullable=True)
    explained_variance_ratio = Column(JSON, nullable=True)  # [pc1, pc2, (pc3)]
    total_anomalies_found = Column(Integer, default=0)
    
    # Visualization coordinates & cluster labels
    pca_projections = Column(JSON, nullable=True)  # [{index, pc1, pc2, pc3, cluster, is_anomaly, anomaly_score}]
    cluster_summaries = Column(JSON, nullable=True)  # [{cluster_id, size, percentage, centroids, description}]
    
    # Executive overview
    executive_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    dataset = relationship("Dataset", back_populates="analyses")
    patterns = relationship("DiscoveredPattern", back_populates="analysis", cascade="all, delete-orphan")
    anomalies = relationship("AnomalyRecord", back_populates="analysis", cascade="all, delete-orphan")

class DiscoveredPattern(Base):
    __tablename__ = "discovered_patterns"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id = Column(String(36), ForeignKey("analysis_runs.id", ondelete="CASCADE"), nullable=False)
    
    pattern_type = Column(String(50), nullable=False)  # cluster_profile, strong_correlation, outlier_cluster, distribution_shift
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    affected_columns = Column(JSON, nullable=False)
    affected_records = Column(Integer, default=0)
    confidence_score = Column(Float, nullable=True)
    statistical_evidence = Column(JSON, nullable=True)

    analysis = relationship("AnalysisRun", back_populates="patterns")

class AnomalyRecord(Base):
    __tablename__ = "anomaly_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id = Column(String(36), ForeignKey("analysis_runs.id", ondelete="CASCADE"), nullable=False)
    
    record_index = Column(Integer, nullable=False)
    anomaly_score = Column(Float, nullable=False)
    feature_values = Column(JSON, nullable=False)  # original row data
    top_contributing_features = Column(JSON, nullable=False)  # [{feature, value, mean, deviation_std, direction}]

    analysis = relationship("AnalysisRun", back_populates="anomalies")
