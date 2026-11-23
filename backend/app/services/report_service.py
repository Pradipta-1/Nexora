import csv
import io
from pathlib import Path
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from app.core.config import settings
from app.models.analysis import AnalysisRun

class ReportService:
    @staticmethod
    def generate_pdf_report(analysis: AnalysisRun) -> Path:
        """Generates a professional PDF summary report of the analysis run."""
        report_filename = f"report_{analysis.id}.pdf"
        report_path = settings.REPORTS_DIR / report_filename

        doc = SimpleDocTemplate(
            str(report_path),
            pagesize=letter,
            rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40
        )
        styles = getSampleStyleSheet()

        # Custom Nexora styles
        title_style = ParagraphStyle(
            'NexoraTitle',
            parent=styles['Heading1'],
            fontSize=24,
            leading=28,
            textColor=colors.HexColor("#0F172A"),
            spaceAfter=6
        )
        subtitle_style = ParagraphStyle(
            'NexoraSubtitle',
            parent=styles['Normal'],
            fontSize=11,
            leading=14,
            textColor=colors.HexColor("#64748B"),
            spaceAfter=15
        )
        h2_style = ParagraphStyle(
            'NexoraH2',
            parent=styles['Heading2'],
            fontSize=14,
            leading=18,
            textColor=colors.HexColor("#285A48"),
            spaceBefore=12,
            spaceAfter=8
        )
        body_style = ParagraphStyle(
            'NexoraBody',
            parent=styles['Normal'],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#1E293B")
        )

        story = []

        # Header
        story.append(Paragraph("NEXORA Analysis Report", title_style))
        story.append(Paragraph(f"Discover Beyond the Obvious — Generated on {analysis.created_at.strftime('%Y-%m-%d %H:%M UTC')}", subtitle_style))
        story.append(Spacer(1, 10))

        # Executive Overview
        story.append(Paragraph("1. Executive Summary", h2_style))
        summary_text = analysis.executive_summary or "Analysis completed successfully."
        story.append(Paragraph(summary_text, body_style))
        story.append(Spacer(1, 12))

        # Dataset & Algorithm Configuration
        story.append(Paragraph("2. Analysis Configuration & Metrics", h2_style))
        config_data = [
            ["Metric / Parameter", "Value"],
            ["Algorithm Type", str(analysis.algorithm_type).upper()],
            ["Features Evaluated", ", ".join(analysis.selected_features or [])],
            ["Silhouette Score", f"{analysis.silhouette_score:.3f}" if analysis.silhouette_score else "N/A"],
            ["Davies-Bouldin Index", f"{analysis.davies_bouldin_index:.3f}" if analysis.davies_bouldin_index else "N/A"],
            ["Total Anomalies Flagged", str(analysis.total_anomalies_found)]
        ]
        config_table = Table(config_data, colWidths=[200, 320])
        config_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor("#0F172A")),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ]))
        story.append(config_table)
        story.append(Spacer(1, 15))

        # Discovered Patterns
        story.append(Paragraph("3. Discovered Patterns & Clusters", h2_style))
        if analysis.patterns:
            pattern_data = [["Type", "Title & Insights", "Records"]]
            for p in analysis.patterns[:8]:
                desc = f"<b>{p.title}</b><br/>{p.description}"
                pattern_data.append([
                    p.pattern_type.replace("_", " ").title(),
                    Paragraph(desc, body_style),
                    str(p.affected_records)
                ])
            pattern_table = Table(pattern_data, colWidths=[100, 360, 60])
            pattern_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ]))
            story.append(pattern_table)
        else:
            story.append(Paragraph("No distinct statistical patterns discovered.", body_style))

        story.append(Spacer(1, 15))

        # Top Anomalies
        story.append(Paragraph("4. Key Anomalies Detected", h2_style))
        if analysis.anomalies:
            anom_data = [["Row #", "Score", "Primary Statistical Root Cause"]]
            for a in analysis.anomalies[:5]:
                causes = [c.get("reason", "") for c in a.top_contributing_features or []]
                cause_str = ", ".join(causes) if causes else "Multivariate deviation"
                anom_data.append([
                    str(a.record_index),
                    f"{a.anomaly_score:.3f}",
                    Paragraph(cause_str, body_style)
                ])
            anom_table = Table(anom_data, colWidths=[60, 60, 400])
            anom_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ]))
            story.append(anom_table)
        else:
            story.append(Paragraph("No significant anomalies detected under current sensitivity threshold.", body_style))

        # Footer notes / limitations
        story.append(Spacer(1, 20))
        story.append(Paragraph(
            "<b>Methodological Note:</b> Statistical relationships and unsupervised clusters indicate mathematical associations "
            "within the dataset. They do not constitute proof of causation. Findings should be cross-verified against domain context.",
            subtitle_style
        ))

        doc.build(story)
        return report_path

    @staticmethod
    def generate_csv_anomalies(analysis: AnalysisRun) -> str:
        """Generates CSV format export of all detected anomalies with contributing causes."""
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow(["record_index", "anomaly_score", "contributing_causes", "feature_values"])
        for a in analysis.anomalies:
            causes = [c.get("reason", "") for c in a.top_contributing_features or []]
            writer.writerow([
                a.record_index,
                a.anomaly_score,
                "; ".join(causes),
                str(a.feature_values)
            ])
        
        return output.getvalue()
