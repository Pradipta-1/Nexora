import pytest
import pandas as pd
import numpy as np
from app.ml.preprocessor import DataPreprocessor

def test_constant_column_handling():
    df = pd.DataFrame({
        "Constant": [5.0] * 20,
        "Varying": list(range(20)),
        "AlsoVarying": np.random.randn(20)
    })
    preproc = DataPreprocessor()
    scaled, cols, clean_df = preproc.fit_transform(df)
    assert "Constant" in preproc.dropped_columns
    assert "Constant" not in cols
    assert "Varying" in cols

def test_missing_values_imputation():
    df = pd.DataFrame({
        "A": [1.0, 2.0, np.nan, 4.0, 5.0, np.nan, 7.0, 8.0, 9.0, 10.0],
        "B": [10.0, np.nan, 30.0, 40.0, 50.0, 60.0, 70.0, 80.0, 90.0, 100.0]
    })
    preproc = DataPreprocessor()
    scaled, cols, clean_df = preproc.fit_transform(df)
    assert clean_df["A"].isnull().sum() == 0
    assert clean_df["B"].isnull().sum() == 0
    assert scaled.shape == (10, 2)

def test_infinite_values_handling():
    df = pd.DataFrame({
        "A": [1.0, np.inf, 3.0, -np.inf, 5.0, 6.0, 7.0, 8.0],
        "B": [10.0, 20.0, 30.0, 40.0, 50.0, 60.0, 70.0, 80.0]
    })
    preproc = DataPreprocessor()
    scaled, cols, clean_df = preproc.fit_transform(df)
    assert not np.isnan(scaled).any()
    assert not np.isinf(scaled).any()

def test_non_numeric_dataset_rejection():
    df = pd.DataFrame({
        "Names": ["Alice", "Bob", "Charlie", "David"],
        "City": ["NYC", "London", "Tokyo", "Paris"]
    })
    preproc = DataPreprocessor()
    with pytest.raises(ValueError, match="No suitable numerical columns"):
        preproc.fit_transform(df)
