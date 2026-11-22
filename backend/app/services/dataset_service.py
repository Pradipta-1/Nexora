import os
import uuid
import shutil
from pathlib import Path
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.dataset import Dataset, DataProfile

class DatasetService:
    @staticmethod
    def save_upload(file: UploadFile) -> Path:
        """Validates extension and saves uploaded file to private storage."""
        ext = Path(file.filename).suffix.lower()
        if ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file format '{ext}'. Supported formats: {', '.join(settings.ALLOWED_EXTENSIONS)}"
            )

        unique_filename = f"{uuid.uuid4()}{ext}"
        target_path = settings.UPLOAD_DIR / unique_filename

        try:
            with open(target_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

        # Check file size
        file_size = target_path.stat().st_size
        if file_size > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
            target_path.unlink(missing_ok=True)
            raise HTTPException(
                status_code=400, 
                detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
            )

        return target_path

    @staticmethod
    def load_dataframe(file_path: Path) -> pd.DataFrame:
        """Reads CSV or Excel safely with error handling."""
        ext = file_path.suffix.lower()
        try:
            if ext == ".csv":
                try:
                    df = pd.read_csv(file_path, encoding="utf-8")
                except UnicodeDecodeError:
                    df = pd.read_csv(file_path, encoding="latin1")
            elif ext in [".xlsx", ".xls"]:
                df = pd.read_excel(file_path)
            else:
                raise ValueError("Unsupported extension")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not parse data file: {str(e)}")

        if df.empty or len(df) < 3:
            raise HTTPException(status_code=400, detail="The dataset is empty or contains fewer than 3 records.")

        return df

    @classmethod
    def create_dataset_record(
        cls, 
        db: Session, 
        original_filename: str, 
        file_path: Path
    ) -> Dataset:
        df = cls.load_dataframe(file_path)
        ext = file_path.suffix.lower().replace(".", "")
        file_size = file_path.stat().st_size

        dataset = Dataset(
            original_filename=original_filename,
            file_path=str(file_path),
            file_size_bytes=file_size,
            file_type=ext,
            total_rows=len(df),
            total_columns=len(df.columns)
        )
        db.add(dataset)
        db.commit()
        db.refresh(dataset)

        # Automatically generate profile
        cls.generate_profile(db, dataset, df)

        return dataset

    @classmethod
    def generate_profile(cls, db: Session, dataset: Dataset, df: Optional[pd.DataFrame] = None) -> DataProfile:
        if df is None:
            df = cls.load_dataframe(Path(dataset.file_path))

        column_metadata = []
        summary_stats = {}
        categorical_dists = {}
        missing_summary = {}

        num_cols = []
        for col in df.columns:
            series = df[col]
            missing_cnt = int(series.isnull().sum())
            missing_pct = round((missing_cnt / len(df)) * 100, 2)
            unique_cnt = int(series.nunique(dropna=True))
            missing_summary[col] = missing_cnt

            # Determine numeric status
            is_numeric = False
            coerced = pd.to_numeric(series, errors='coerce')
            if coerced.notnull().mean() >= 0.6:
                is_numeric = True
                num_cols.append(col)

            sample_vals = [
                str(v) if not pd.isna(v) else None 
                for v in series.dropna().head(5).tolist()
            ]

            column_metadata.append({
                "name": str(col),
                "dtype": str(series.dtype),
                "missing_count": missing_cnt,
                "missing_pct": missing_pct,
                "unique_count": unique_cnt,
                "is_numeric": is_numeric,
                "sample_values": sample_vals
            })

            # Numerical stats
            if is_numeric:
                clean_num = coerced.dropna()
                if len(clean_num) > 0:
                    summary_stats[col] = {
                        "mean": round(float(clean_num.mean()), 2),
                        "std": round(float(clean_num.std()), 2) if clean_num.std() > 0 else 0.0,
                        "min": round(float(clean_num.min()), 2),
                        "p25": round(float(clean_num.quantile(0.25)), 2),
                        "median": round(float(clean_num.median()), 2),
                        "p75": round(float(clean_num.quantile(0.75)), 2),
                        "max": round(float(clean_num.max()), 2),
                        "skewness": round(float(clean_num.skew()), 2) if len(clean_num) > 2 else 0.0
                    }
            elif unique_cnt <= 15:
                # Low-cardinality categorical
                val_counts = series.value_counts().head(10).to_dict()
                categorical_dists[col] = {str(k): int(v) for k, v in val_counts.items()}

        # Correlation matrix for numerical features
        corr_matrix = None
        if len(num_cols) >= 2:
            num_df = df[num_cols].apply(pd.to_numeric, errors='coerce')
            corr = num_df.corr().round(2).fillna(0)
            corr_matrix = {
                "columns": num_cols,
                "matrix": corr.values.tolist()
            }

        profile = DataProfile(
            dataset_id=dataset.id,
            column_metadata=column_metadata,
            summary_statistics=summary_stats,
            correlation_matrix=corr_matrix,
            categorical_distributions=categorical_dists,
            missing_value_summary=missing_summary
        )

        db.add(profile)
        db.commit()
        db.refresh(profile)
        return profile
