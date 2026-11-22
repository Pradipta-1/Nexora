import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    file_type = Column(String(20), nullable=False)  # csv or xlsx
    total_rows = Column(Integer, default=0)
    total_columns = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    profile = relationship("DataProfile", back_populates="dataset", uselist=False, cascade="all, delete-orphan")
    analyses = relationship("AnalysisRun", back_populates="dataset", cascade="all, delete-orphan")

class DataProfile(Base):
    __tablename__ = "data_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dataset_id = Column(String(36), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    # JSON summaries
    column_metadata = Column(JSON, nullable=False)  # [{name, dtype, missing_count, missing_pct, unique_count, sample_values}]
    summary_statistics = Column(JSON, nullable=False)  # {col: {mean, std, min, 25%, 50%, 75%, max, skewness}}
    correlation_matrix = Column(JSON, nullable=True)  # {columns: [...], matrix: [[...]]}
    categorical_distributions = Column(JSON, nullable=True)  # {col: {category: count}}
    missing_value_summary = Column(JSON, nullable=True)
    generated_at = Column(DateTime, default=datetime.utcnow)

    dataset = relationship("Dataset", back_populates="profile")
