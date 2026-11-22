from pathlib import Path
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.dataset import Dataset
from app.models.analysis import AnalysisRun, DiscoveredPattern, AnomalyRecord
from app.schemas.analysis import (
    RunAnalysisRequest, AnalysisRunResponse, DiscoveredPatternDTO,
    AnomalyRecordDTO, DashboardStatsResponse
)
from app.services.dataset_service import DatasetService
from app.ml.preprocessor import DataPreprocessor
from app.ml.kmeans_cluster import KMeansDiscovery
from app.ml.dbscan_cluster import DBSCANDiscovery
from app.ml.anomaly_detector import AnomalyDetector
from app.ml.dimension_reduction import DimensionReduction
from app.ml.relationships import StatisticalRelationships
from app.ml.explainer import PatternExplainer

router = APIRouter(prefix="/analysis", tags=["analysis"])

@router.get("/dashboard/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Computes real live dashboard metrics from actual database records."""
    total_datasets = db.query(Dataset).count()
    total_records = db.query(func.sum(Dataset.total_rows)).scalar() or 0
    total_patterns = db.query(DiscoveredPattern).count()
    total_anomalies = db.query(AnomalyRecord).count()

    recent_runs = (
        db.query(AnalysisRun)
        .order_by(AnalysisRun.created_at.desc())
        .limit(5)
        .all()
    )

    recent_analyses = []
    for r in recent_runs:
        ds = db.query(Dataset).filter(Dataset.id == r.dataset_id).first()
        recent_analyses.append({
            "id": r.id,
            "dataset_id": r.dataset_id,
            "dataset_name": ds.original_filename if ds else "Unknown",
            "algorithm_type": r.algorithm_type,
            "patterns_count": len(r.patterns),
            "anomalies_count": r.total_anomalies_found,
            "created_at": r.created_at
        })

    recent_datasets = (
        db.query(Dataset)
        .order_by(Dataset.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "total_datasets": total_datasets,
        "total_records_analyzed": int(total_records),
        "total_patterns_discovered": total_patterns,
        "total_anomalies_detected": total_anomalies,
        "recent_analyses": recent_analyses,
        "recent_datasets": recent_datasets
    }

@router.post("/{dataset_id}/run", response_model=AnalysisRunResponse)
def run_dataset_analysis(
    dataset_id: str,
    req: RunAnalysisRequest,
    db: Session = Depends(get_db)
):
    """Executes the end-to-end ML Discovery Engine on selected features."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    df_original = DatasetService.load_dataframe(Path(dataset.file_path))

    # Preprocessing
    preprocessor = DataPreprocessor(scaling_method=req.scaling_method)
    try:
        scaled_matrix, feature_names, cleaned_df = preprocessor.fit_transform(
            df_original, 
            selected_columns=req.selected_features
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Data Preprocessing Error: {str(e)}")

    # 1. K-Means
    kmeans_engine = KMeansDiscovery(n_clusters=req.k_clusters)
    kmeans_res = kmeans_engine.fit_predict(scaled_matrix, cleaned_df, feature_names)

    # 2. DBSCAN (if requested or in full discovery)
    dbscan_res = None
    if req.algorithm_type in ["dbscan", "full_discovery"]:
        dbscan_engine = DBSCANDiscovery(eps=req.dbscan_eps, min_samples=req.dbscan_min_samples)
        dbscan_res = dbscan_engine.fit_predict(scaled_matrix, cleaned_df, feature_names)

    # 3. Isolation Forest
    anomaly_engine = AnomalyDetector(contamination=req.contamination)
    anomaly_res = anomaly_engine.fit_predict(
        scaled_matrix, 
        cleaned_df, 
        df_original, 
        feature_names, 
        preprocessor.original_stats
    )

    # 4. Dimension Reduction (PCA)
    pca_engine = DimensionReduction(n_components=3)
    pca_res = pca_engine.transform(
        scaled_matrix,
        cluster_labels=kmeans_res["labels"],
        is_anomaly=anomaly_res["is_anomaly"],
        anomaly_scores=anomaly_res["anomaly_scores"]
    )

    # 5. Statistical Relationships
    stat_engine = StatisticalRelationships()
    rel_res = stat_engine.analyze(cleaned_df, feature_names)

    # 6. Explanations & Patterns
    patterns_data = PatternExplainer.generate_patterns(
        kmeans_res=kmeans_res,
        dbscan_res=dbscan_res,
        anomaly_res=anomaly_res,
        relationship_res=rel_res,
        total_rows=len(df_original)
    )

    exec_summary = PatternExplainer.generate_executive_summary(
        total_rows=len(df_original),
        n_features=len(feature_names),
        k_clusters=kmeans_res["n_clusters"],
        silhouette=kmeans_res.get("silhouette_score"),
        total_anomalies=anomaly_res["total_anomalies"],
        top_relationships=rel_res.get("strong_relationships", [])
    )

    # Persist AnalysisRun to DB
    analysis_run = AnalysisRun(
        dataset_id=dataset.id,
        algorithm_type=req.algorithm_type,
        selected_features=feature_names,
        hyperparameters=req.model_dump(),
        silhouette_score=kmeans_res.get("silhouette_score"),
        davies_bouldin_index=kmeans_res.get("davies_bouldin_index"),
        explained_variance_ratio=pca_res.get("explained_variance_ratio"),
        total_anomalies_found=anomaly_res["total_anomalies"],
        pca_projections=pca_res.get("projections"),
        cluster_summaries=kmeans_res.get("cluster_summaries"),
        executive_summary=exec_summary
    )
    db.add(analysis_run)
    db.commit()
    db.refresh(analysis_run)

    # Persist Discovered Patterns
    for p in patterns_data:
        pattern_rec = DiscoveredPattern(
            analysis_id=analysis_run.id,
            pattern_type=p["pattern_type"],
            title=p["title"],
            description=p["description"],
            affected_columns=p["affected_columns"],
            affected_records=p["affected_records"],
            confidence_score=p.get("confidence_score"),
            statistical_evidence=p.get("statistical_evidence")
        )
        db.add(pattern_rec)

    # Persist Top Anomalies
    for a in anomaly_res["anomalies"][:50]:  # Save top 50 anomalies
        anom_rec = AnomalyRecord(
            analysis_id=analysis_run.id,
            record_index=a["record_index"],
            anomaly_score=a["anomaly_score"],
            feature_values=a["feature_values"],
            top_contributing_features=a["top_contributing_features"]
        )
        db.add(anom_rec)

    db.commit()
    db.refresh(analysis_run)

    return analysis_run

@router.get("/{analysis_id}/results", response_model=AnalysisRunResponse)
def get_analysis_results(analysis_id: str, db: Session = Depends(get_db)):
    """Retrieves full analysis results, PCA points, cluster metrics, and explanations."""
    analysis = db.query(AnalysisRun).filter(AnalysisRun.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis run not found")
    return analysis

@router.get("/{analysis_id}/patterns", response_model=List[DiscoveredPatternDTO])
def get_analysis_patterns(analysis_id: str, db: Session = Depends(get_db)):
    """Returns discovered patterns for this analysis."""
    patterns = db.query(DiscoveredPattern).filter(DiscoveredPattern.analysis_id == analysis_id).all()
    return patterns

@router.get("/{analysis_id}/anomalies", response_model=List[AnomalyRecordDTO])
def get_analysis_anomalies(analysis_id: str, db: Session = Depends(get_db)):
    """Returns detected anomalies ordered by severity."""
    anomalies = (
        db.query(AnomalyRecord)
        .filter(AnomalyRecord.analysis_id == analysis_id)
        .order_by(AnomalyRecord.anomaly_score.desc())
        .all()
    )
    return anomalies
