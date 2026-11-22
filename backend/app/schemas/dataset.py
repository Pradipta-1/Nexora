from typing import Any, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class ColumnMeta(BaseModel):
    name: str
    dtype: str
    missing_count: int
    missing_pct: float
    unique_count: int
    is_numeric: bool
    sample_values: list[Any] = []

class SummaryStat(BaseModel):
    mean: Optional[float] = None
    std: Optional[float] = None
    min: Optional[float] = None
    p25: Optional[float] = None
    median: Optional[float] = None
    p75: Optional[float] = None
    max: Optional[float] = None
    skewness: Optional[float] = None

class DataProfileResponse(BaseModel):
    dataset_id: str
    column_metadata: list[ColumnMeta]
    summary_statistics: dict[str, SummaryStat]
    correlation_matrix: Optional[dict[str, Any]] = None
    categorical_distributions: Optional[dict[str, dict[str, int]]] = None
    missing_value_summary: Optional[dict[str, int]] = None
    generated_at: datetime

class DatasetSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    original_filename: str
    file_size_bytes: int
    file_type: str
    total_rows: int
    total_columns: int
    created_at: datetime

class DatasetDetailResponse(DatasetSummary):
    profile: Optional[DataProfileResponse] = None

class DatasetPreviewResponse(BaseModel):
    id: str
    original_filename: str
    total_rows: int
    total_columns: int
    columns: list[str]
    preview_rows: list[dict[str, Any]]
