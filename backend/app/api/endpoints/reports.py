from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.analysis import AnalysisRun
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/{analysis_id}/pdf")
def download_pdf_report(analysis_id: str, db: Session = Depends(get_db)):
    """Generates and serves a formatted PDF analysis report."""
    analysis = db.query(AnalysisRun).filter(AnalysisRun.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis run not found")

    pdf_path = ReportService.generate_pdf_report(analysis)
    return FileResponse(
        path=str(pdf_path),
        filename=f"Nexora_Report_{analysis.id[:8]}.pdf",
        media_type="application/pdf"
    )

@router.get("/{analysis_id}/csv")
def download_csv_anomalies(analysis_id: str, db: Session = Depends(get_db)):
    """Downloads CSV report of all detected anomalies and root causes."""
    analysis = db.query(AnalysisRun).filter(AnalysisRun.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis run not found")

    csv_data = ReportService.generate_csv_anomalies(analysis)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=Nexora_Anomalies_{analysis.id[:8]}.csv"}
    )
