import shutil
from pathlib import Path
from typing import List
import numpy as np
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.models.dataset import Dataset, DataProfile
from app.schemas.dataset import (
    DatasetSummary, DatasetPreviewResponse, DataProfileResponse, DatasetDetailResponse
)
from app.services.dataset_service import DatasetService

router = APIRouter(prefix="/datasets", tags=["datasets"])

@router.post("/upload", response_model=DatasetSummary)
async def upload_dataset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Handles dataset file upload (CSV / Excel), validates, and profiles data."""
    saved_path = DatasetService.save_upload(file)
    dataset = DatasetService.create_dataset_record(db, file.filename, saved_path)
    return dataset

@router.post("/load-sample", response_model=DatasetSummary)
def load_sample_dataset(
    sample_name: str = "customer_segments",
    db: Session = Depends(get_db)
):
    """Loads a pre-packaged curated dataset for instant testing."""
    sample_file = settings.SAMPLE_DATA_DIR / f"{sample_name}.csv"
    if not sample_file.exists():
        raise HTTPException(status_code=404, detail=f"Sample dataset '{sample_name}' not found.")

    import uuid
    dest_path = settings.UPLOAD_DIR / f"sample_{sample_name}_{uuid.uuid4().hex[:8]}.csv"
    shutil.copyfile(sample_file, dest_path)

    display_name = "Customer Segmentation Dataset.csv" if sample_name == "customer_segments" else "Industrial Sensor Readings.csv"
    dataset = DatasetService.create_dataset_record(db, display_name, dest_path)
    return dataset

@router.get("", response_model=List[DatasetSummary])
def list_datasets(db: Session = Depends(get_db)):
    """Lists all uploaded datasets ordered by creation date descending."""
    return db.query(Dataset).order_by(Dataset.created_at.desc()).all()

@router.get("/{dataset_id}", response_model=DatasetDetailResponse)
def get_dataset(dataset_id: str, db: Session = Depends(get_db)):
    """Retrieves dataset summary and profile."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset

@router.get("/{dataset_id}/preview", response_model=DatasetPreviewResponse)
def preview_dataset(dataset_id: str, db: Session = Depends(get_db)):
    """Returns first 10 rows and column names for immediate visual inspection."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    df = DatasetService.load_dataframe(Path(dataset.file_path))
    preview_df = df.head(10).replace({np.nan: None})
    
    rows = []
    for _, row in preview_df.iterrows():
        row_dict = {}
        for k, v in row.items():
            if pd.isna(v):
                row_dict[str(k)] = None
            elif isinstance(v, (np.floating, float)):
                if np.isnan(v) or np.isinf(v):
                    row_dict[str(k)] = None
                else:
                    row_dict[str(k)] = round(float(v), 2)
            else:
                row_dict[str(k)] = v
        rows.append(row_dict)

    return {
        "id": dataset.id,
        "original_filename": dataset.original_filename,
        "total_rows": dataset.total_rows,
        "total_columns": dataset.total_columns,
        "columns": [str(c) for c in df.columns],
        "preview_rows": rows
    }

@router.get("/{dataset_id}/profile", response_model=DataProfileResponse)
def get_dataset_profile(dataset_id: str, db: Session = Depends(get_db)):
    """Returns detailed column metadata, summary statistics, and correlations."""
    profile = db.query(DataProfile).filter(DataProfile.dataset_id == dataset_id).first()
    if not profile:
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
        profile = DatasetService.generate_profile(db, dataset)

    return {
        "dataset_id": profile.dataset_id,
        "column_metadata": profile.column_metadata,
        "summary_statistics": profile.summary_statistics,
        "correlation_matrix": profile.correlation_matrix,
        "categorical_distributions": profile.categorical_distributions,
        "missing_value_summary": profile.missing_value_summary,
        "generated_at": profile.generated_at
    }

@router.delete("/{dataset_id}")
def delete_dataset(dataset_id: str, db: Session = Depends(get_db)):
    """Deletes dataset record, associated profile, analyses, and raw file."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    try:
        Path(dataset.file_path).unlink(missing_ok=True)
    except Exception:
        pass

    db.delete(dataset)
    db.commit()
    return {"message": "Dataset and all associated analyses deleted successfully."}
