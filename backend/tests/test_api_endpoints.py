import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app"] == "Nexora"

def test_load_sample_and_workflow():
    # 1. Load sample dataset
    res = client.post("/api/datasets/load-sample?sample_name=customer_segments")
    assert res.status_code == 200
    dataset = res.json()
    dataset_id = dataset["id"]
    assert dataset["total_rows"] == 250
    assert dataset["total_columns"] >= 5

    # 2. Preview dataset
    preview_res = client.get(f"/api/datasets/{dataset_id}/preview")
    assert preview_res.status_code == 200
    preview_data = preview_res.json()
    assert len(preview_data["preview_rows"]) == 10
    assert "AnnualIncome_k" in preview_data["columns"]

    # 3. Profile dataset
    profile_res = client.get(f"/api/datasets/{dataset_id}/profile")
    assert profile_res.status_code == 200
    profile_data = profile_res.json()
    assert len(profile_data["column_metadata"]) > 0
    assert "AnnualIncome_k" in profile_data["summary_statistics"]

    # 4. Run Analysis
    run_payload = {
        "algorithm_type": "full_discovery",
        "selected_features": ["Age", "AnnualIncome_k", "SpendingScore", "AnnualPurchases"],
        "k_clusters": 3,
        "contamination": 0.05
    }
    analysis_res = client.post(f"/api/analysis/{dataset_id}/run", json=run_payload)
    assert analysis_res.status_code == 200
    analysis = analysis_res.json()
    analysis_id = analysis["id"]
    assert analysis["silhouette_score"] is not None
    assert analysis["total_anomalies_found"] > 0
    assert len(analysis["pca_projections"]) > 0

    # 5. Get patterns and anomalies
    pat_res = client.get(f"/api/analysis/{analysis_id}/patterns")
    assert pat_res.status_code == 200
    assert len(pat_res.json()) > 0

    anom_res = client.get(f"/api/analysis/{analysis_id}/anomalies")
    assert anom_res.status_code == 200
    assert len(anom_res.json()) > 0

    # 6. Dashboard statistics
    dash_res = client.get("/api/analysis/dashboard/stats")
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["total_datasets"] >= 1
    assert dash_data["total_records_analyzed"] >= 250
    assert dash_data["total_patterns_discovered"] >= 1

    # 7. Download PDF and CSV reports
    pdf_res = client.get(f"/api/reports/{analysis_id}/pdf")
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 1000  # valid PDF bytes

    csv_res = client.get(f"/api/reports/{analysis_id}/csv")
    assert csv_res.status_code == 200
    assert "record_index" in csv_res.text
