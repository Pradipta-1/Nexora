import numpy as np
import pandas as pd
from typing import Tuple, List, Dict, Any, Optional
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.impute import SimpleImputer

class DataPreprocessor:
    """
    Robust Preprocessor for unstructured/structured tabular datasets.
    Handles missing values, infinite values, constant columns, and scaling.
    """
    def __init__(self, scaling_method: str = "standard"):
        self.scaling_method = scaling_method
        self.scaler = RobustScaler() if scaling_method == "robust" else StandardScaler()
        self.imputer = SimpleImputer(strategy="median")
        self.numeric_columns: List[str] = []
        self.dropped_columns: List[str] = []
        self.original_stats: Dict[str, Dict[str, float]] = {}

    def fit_transform(
        self, 
        df: pd.DataFrame, 
        selected_columns: Optional[List[str]] = None
    ) -> Tuple[np.ndarray, List[str], pd.DataFrame]:
        """
        Processes dataframe into scaled numerical matrix.
        Returns: (scaled_matrix, processed_feature_names, cleaned_df)
        """
        # Work on a copy to never mutate original dataset
        df_clean = df.copy()

        # If user specified columns, filter to those
        if selected_columns:
            valid_cols = [c for c in selected_columns if c in df_clean.columns]
            if valid_cols:
                df_clean = df_clean[valid_cols]

        # Detect and isolate numeric columns
        num_cols = []
        for col in df_clean.columns:
            # Check if column can be coerced to numeric
            coerced = pd.to_numeric(df_clean[col], errors='coerce')
            non_null_ratio = coerced.notnull().mean()
            # If at least 60% of values are numbers, treat as numeric
            if non_null_ratio >= 0.6:
                df_clean[col] = coerced
                num_cols.append(col)
            else:
                self.dropped_columns.append(col)

        if not num_cols:
            raise ValueError("No suitable numerical columns found in the dataset for mathematical analysis.")

        # Filter to numeric columns only
        df_num = df_clean[num_cols].copy()

        # Replace infinite values with NaN
        df_num.replace([np.inf, -np.inf], np.nan, inplace=True)

        # Drop columns with > 90% missing values or zero variance (constant columns)
        valid_num_cols = []
        for col in num_cols:
            if df_num[col].isnull().mean() >= 0.90:
                self.dropped_columns.append(col)
                continue
            if df_num[col].dropna().nunique() <= 1:
                self.dropped_columns.append(col)
                continue
            valid_num_cols.append(col)

        if not valid_num_cols:
            raise ValueError("All numerical columns were constant or had >90% missing values.")

        self.numeric_columns = valid_num_cols
        df_num = df_num[valid_num_cols]

        # Impute missing values with column median
        imputed_data = self.imputer.fit_transform(df_num)
        imputed_df = pd.DataFrame(imputed_data, columns=valid_num_cols, index=df_num.index)

        # Compute original baseline statistics for later explainability
        for col in valid_num_cols:
            vals = imputed_df[col]
            std_val = float(vals.std()) if vals.std() > 0 else 1.0
            self.original_stats[col] = {
                "mean": float(vals.mean()),
                "median": float(vals.median()),
                "std": std_val,
                "min": float(vals.min()),
                "max": float(vals.max())
            }

        # Scale features
        scaled_matrix = self.scaler.fit_transform(imputed_df)

        return scaled_matrix, valid_num_cols, imputed_df
