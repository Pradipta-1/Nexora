import pytest
import numpy as np
import pandas as pd
from app.ml.preprocessor import DataPreprocessor
from app.ml.kmeans_cluster import KMeansDiscovery
from app.ml.dbscan_cluster import DBSCANDiscovery
from app.ml.anomaly_detector import AnomalyDetector
from app.ml.dimension_reduction import DimensionReduction
from app.ml.relationships import StatisticalRelationships
from app.ml.explainer import PatternExplainer

@pytest.fixture
def sample_numeric_df():
    np.random.seed(42)
    # 2 distinct clusters of 50 points each
    c1 = np.random.normal(loc=10, scale=1, size=(50, 3))
    c2 = np.random.normal(loc=30, scale=1, size=(50, 3))
    data = np.vstack([c1, c2])
    return pd.DataFrame(data, columns=["Feature1", "Feature2", "Feature3"])

def test_preprocessor(sample_numeric_df):
    preproc = DataPreprocessor(scaling_method="standard")
    scaled, cols, clean_df = preproc.fit_transform(sample_numeric_df)
    assert scaled.shape == (100, 3)
    assert cols == ["Feature1", "Feature2", "Feature3"]
    # Check that scaled data has mean approx 0 and std approx 1
    assert np.allclose(scaled.mean(axis=0), 0, atol=1e-5)
    assert np.allclose(scaled.std(axis=0), 1, atol=1e-5)

def test_kmeans_clustering(sample_numeric_df):
    preproc = DataPreprocessor()
    scaled, cols, clean_df = preproc.fit_transform(sample_numeric_df)
    kmeans = KMeansDiscovery(n_clusters=2)
    res = kmeans.fit_predict(scaled, clean_df, cols)
    
    assert res["n_clusters"] == 2
    assert len(res["labels"]) == 100
    assert res["silhouette_score"] is not None
    assert res["silhouette_score"] > 0.80  # Well-separated clusters should have high silhouette
    assert len(res["cluster_summaries"]) == 2

def test_dbscan_clustering(sample_numeric_df):
    preproc = DataPreprocessor()
    scaled, cols, clean_df = preproc.fit_transform(sample_numeric_df)
    dbscan = DBSCANDiscovery(eps=0.8, min_samples=5)
    res = dbscan.fit_predict(scaled, clean_df, cols)
    
    assert res["n_clusters"] >= 1
    assert "noise_count" in res
    assert len(res["labels"]) == 100

def test_anomaly_detection(sample_numeric_df):
    preproc = DataPreprocessor()
    scaled, cols, clean_df = preproc.fit_transform(sample_numeric_df)
    detector = AnomalyDetector(contamination=0.05)
    res = detector.fit_predict(scaled, clean_df, sample_numeric_df, cols, preproc.original_stats)
    
    assert res["total_anomalies"] > 0
    assert len(res["anomalies"]) == res["total_anomalies"]
    first_anom = res["anomalies"][0]
    assert "anomaly_score" in first_anom
    assert "top_contributing_features" in first_anom

def test_dimension_reduction(sample_numeric_df):
    preproc = DataPreprocessor()
    scaled, cols, clean_df = preproc.fit_transform(sample_numeric_df)
    pca = DimensionReduction(n_components=2)
    res = pca.transform(scaled)
    
    assert res["components"] == 2
    assert len(res["explained_variance_ratio"]) == 2
    assert len(res["projections"]) == 100
    assert "pc1" in res["projections"][0]
    assert "pc2" in res["projections"][0]

def test_statistical_relationships():
    np.random.seed(42)
    x = np.linspace(1, 100, 100)
    y = 2.5 * x + np.random.normal(0, 5, 100)
    z = np.random.normal(50, 10, 100)
    df = pd.DataFrame({"X": x, "Y": y, "Z": z})
    
    stat = StatisticalRelationships(threshold=0.5)
    res = stat.analyze(df, ["X", "Y", "Z"])
    
    assert len(res["columns"]) == 3
    assert len(res["strong_relationships"]) >= 1
    top_rel = res["strong_relationships"][0]
    assert (top_rel["feature_a"], top_rel["feature_b"]) in [("X", "Y"), ("Y", "X")]
    assert top_rel["pearson_r"] > 0.95
