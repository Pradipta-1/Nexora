import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Layers, 
  GitCompare, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Clock, 
  FileSpreadsheet, 
  ExternalLink, 
  ShieldCheck, 
  ChevronDown 
} from 'lucide-react';
import { analysisApi } from '../services/analysisApi';
import { datasetApi } from '../services/datasetApi';
import { formatDate, formatNumber } from '../utils/formatters';

export default function ReportsPage({ selectedAnalysisId, setSelectedAnalysisId, setActiveTab }) {
  const [analyses, setAnalyses] = useState([]);
  const [activeAnalysisId, setActiveAnalysisId] = useState(selectedAnalysisId);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [compareAnalysisId, setCompareAnalysisId] = useState('');
  const [compareAnalysis, setCompareAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch recent analyses list
  useEffect(() => {
    const fetchAnalyses = async () => {
      setLoading(true);
      try {
        const stats = await analysisApi.getDashboardStats();
        setAnalyses(stats.recent_analyses || []);
        
        const initialId = selectedAnalysisId || (stats.recent_analyses?.[0]?.id);
        if (initialId) {
          setActiveAnalysisId(initialId);
        }
      } catch (err) {
        setError('Failed to fetch analysis history.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyses();
  }, [selectedAnalysisId]);

  // Load selected analysis details
  useEffect(() => {
    if (!activeAnalysisId) return;
    const fetchDetail = async () => {
      try {
        const data = await analysisApi.getResults(activeAnalysisId);
        setCurrentAnalysis(data);
      } catch (err) {
        setError('Failed to load analysis record.');
      }
    };
    fetchDetail();
  }, [activeAnalysisId]);

  // Load comparison analysis details if selected
  useEffect(() => {
    if (!compareAnalysisId) {
      setCompareAnalysis(null);
      return;
    }
    const fetchComp = async () => {
      try {
        const data = await analysisApi.getResults(compareAnalysisId);
        setCompareAnalysis(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchComp();
  }, [compareAnalysisId]);

  const handleDownloadPdf = () => {
    if (!activeAnalysisId) return;
    window.open(analysisApi.getPdfReportUrl(activeAnalysisId), '_blank');
  };

  const handleDownloadCsv = () => {
    if (!activeAnalysisId) return;
    window.open(analysisApi.getCsvExportUrl(activeAnalysisId), '_blank');
  };

  if (analyses.length === 0 && !loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#16362D] text-[#B0E4CC] flex items-center justify-center mx-auto border border-[#408A71]">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">No Analysis Reports Generated Yet</h2>
        <p className="text-xs text-[#9EC4B5] max-w-sm mx-auto">
          Execute pattern discovery in the ML Discovery Studio to generate and download comprehensive reports.
        </p>
        <button
          onClick={() => setActiveTab('studio')}
          className="btn-primary text-xs px-5 py-2.5 shadow-md cursor-pointer"
        >
          Open ML Discovery Studio
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-[#285A48]/50">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <span>Analysis Reports & Comparison</span>
            <span className="text-xs px-3 py-1 rounded-full bg-[#16382F] text-[#B0E4CC] border border-[#408A71] font-bold">
              Export Center
            </span>
          </h1>
          <p className="text-xs text-[#9EC4B5] mt-1">
            Download verified PDF and CSV analytical dossiers or compare findings across different algorithmic runs.
          </p>
        </div>

        {/* Analysis Switcher */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-[#82AFA0] font-bold">Select Run:</label>
          <div className="relative">
            <select
              value={activeAnalysisId || ''}
              onChange={(e) => setActiveAnalysisId(e.target.value)}
              className="bg-[#0B1916] border-2 border-[#285A48] text-white text-xs rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-[#B0E4CC] appearance-none font-bold shadow-sm"
            >
              {analyses.map((a) => (
                <option key={a.id} value={a.id} className="bg-[#0B1916] text-white">
                  {a.dataset_name} ({a.algorithm_type.replace('_', ' ')}) - {formatDate(a.created_at)}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#82AFA0] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-[#82AFA0] nexora-card rounded-2xl">
          <RefreshCw className="w-8 h-8 animate-spin text-[#B0E4CC] mx-auto mb-2" />
          <span>Loading analysis reports...</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-[#3B1922] border-2 border-[#9E354F] text-[#FF859F] text-xs font-bold">
          {error}
        </div>
      ) : currentAnalysis && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Export Action Card */}
          <div className="nexora-panel p-6 rounded-2xl border-2 border-[#285A48] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
            <div className="space-y-2 max-w-xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#B0E4CC]">
                Official Analytical Dossier
              </span>
              <h2 className="text-xl font-bold text-white">
                Comprehensive Discovery Report ({currentAnalysis.algorithm_type.toUpperCase()})
              </h2>
              <p className="text-xs text-[#9EC4B5] leading-relaxed">
                Includes executive summary, data quality profile, quantitative cluster metrics (Silhouette, Davies-Bouldin), full anomaly breakdown with feature root causes, and methodological notes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleDownloadPdf}
                className="btn-primary text-xs shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Report (PDF)</span>
              </button>

              <button
                onClick={handleDownloadCsv}
                className="btn-secondary text-xs shadow-sm cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#B0E4CC]" />
                <span>Export Anomalies (CSV)</span>
              </button>
            </div>
          </div>

          {/* Section: Pattern Comparison Matrix (Compare with another run) */}
          <div className="nexora-card p-6 rounded-2xl border-2 border-[#285A48] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-[#B0E4CC]" />
                  <span>Pattern & Algorithm Comparison</span>
                </h3>
                <p className="text-xs text-[#9EC4B5] mt-0.5">
                  Compare metrics and cluster separation across different algorithmic runs or parameter settings side by side.
                </p>
              </div>

              {/* Secondary comparison dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#82AFA0] whitespace-nowrap font-bold">Compare against:</span>
                <select
                  value={compareAnalysisId}
                  onChange={(e) => setCompareAnalysisId(e.target.value)}
                  className="bg-[#0B1916] border-2 border-[#285A48] text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#B0E4CC] font-bold"
                >
                  <option value="" className="bg-[#0B1916] text-white">None (Single Run View)</option>
                  {analyses
                    .filter(a => a.id !== activeAnalysisId)
                    .map((a) => (
                      <option key={a.id} value={a.id} className="bg-[#0B1916] text-white">
                        {a.dataset_name} ({a.algorithm_type.replace('_', ' ')}) - {formatDate(a.created_at)}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto rounded-xl border border-[#285A48]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#122A23] text-[#B0E4CC] uppercase font-bold border-b border-[#285A48] font-sans">
                  <tr>
                    <th className="px-5 py-3.5">Metric / Dimension</th>
                    <th className="px-5 py-3.5 text-[#B0E4CC]">Run A (Current)</th>
                    {compareAnalysis && (
                      <th className="px-5 py-3.5 text-[#7BE0B8]">Run B (Comparison)</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1D3B32]">
                  <tr className="hover:bg-[#132A23]">
                    <td className="px-5 py-3 font-sans font-medium text-[#9EC4B5]">Algorithm Type</td>
                    <td className="px-5 py-3 text-white uppercase font-bold">{currentAnalysis.algorithm_type.replace('_', ' ')}</td>
                    {compareAnalysis && (
                      <td className="px-5 py-3 text-white uppercase font-bold">{compareAnalysis.algorithm_type.replace('_', ' ')}</td>
                    )}
                  </tr>
                  <tr className="hover:bg-[#132A23]">
                    <td className="px-5 py-3 font-sans font-medium text-[#9EC4B5]">Silhouette Score</td>
                    <td className="px-5 py-3 font-bold text-[#B0E4CC]">
                      {currentAnalysis.silhouette_score ? currentAnalysis.silhouette_score.toFixed(3) : 'N/A'}
                    </td>
                    {compareAnalysis && (
                      <td className="px-5 py-3 font-bold text-[#B0E4CC]">
                        {compareAnalysis.silhouette_score ? compareAnalysis.silhouette_score.toFixed(3) : 'N/A'}
                      </td>
                    )}
                  </tr>
                  <tr className="hover:bg-[#132A23]">
                    <td className="px-5 py-3 font-sans font-medium text-[#9EC4B5]">Davies-Bouldin Index</td>
                    <td className="px-5 py-3 text-[#E0F4EC]">
                      {currentAnalysis.davies_bouldin_index ? currentAnalysis.davies_bouldin_index.toFixed(3) : 'N/A'}
                    </td>
                    {compareAnalysis && (
                      <td className="px-5 py-3 text-[#E0F4EC]">
                        {compareAnalysis.davies_bouldin_index ? compareAnalysis.davies_bouldin_index.toFixed(3) : 'N/A'}
                      </td>
                    )}
                  </tr>
                  <tr className="hover:bg-[#132A23]">
                    <td className="px-5 py-3 font-sans font-medium text-[#9EC4B5]">Anomalies Detected</td>
                    <td className="px-5 py-3 text-[#FF859F] font-bold">
                      {currentAnalysis.total_anomalies_found}
                    </td>
                    {compareAnalysis && (
                      <td className="px-5 py-3 text-[#FF859F] font-bold">
                        {compareAnalysis.total_anomalies_found}
                      </td>
                    )}
                  </tr>
                  <tr className="hover:bg-[#132A23]">
                    <td className="px-5 py-3 font-sans font-medium text-[#9EC4B5]">PCA Cumulative Variance</td>
                    <td className="px-5 py-3 text-[#E0F4EC]">
                      {currentAnalysis.explained_variance_ratio ? (
                        `${((currentAnalysis.explained_variance_ratio[0] + (currentAnalysis.explained_variance_ratio[1] || 0)) * 100).toFixed(1)}%`
                      ) : 'N/A'}
                    </td>
                    {compareAnalysis && (
                      <td className="px-5 py-3 text-[#E0F4EC]">
                        {compareAnalysis.explained_variance_ratio ? (
                          `${((compareAnalysis.explained_variance_ratio[0] + (compareAnalysis.explained_variance_ratio[1] || 0)) * 100).toFixed(1)}%`
                        ) : 'N/A'}
                      </td>
                    )}
                  </tr>
                  <tr className="hover:bg-[#132A23]">
                    <td className="px-5 py-3 font-sans font-medium text-[#9EC4B5]">Features Evaluated</td>
                    <td className="px-5 py-3 text-[#82AFA0] truncate max-w-xs font-sans text-xs">
                      {currentAnalysis.selected_features?.join(', ')}
                    </td>
                    {compareAnalysis && (
                      <td className="px-5 py-3 text-[#82AFA0] truncate max-w-xs font-sans text-xs">
                        {compareAnalysis.selected_features?.join(', ')}
                      </td>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pattern Evolution & Cohort Drift Breakdown */}
            {compareAnalysis && (
              <div className="pt-4 border-t border-[#1D3B32] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#B0E4CC] flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[#B0E4CC]" />
                  <span>Pattern Evolution & Cohort Drift</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#0B1916] border border-[#285A48] text-xs space-y-2">
                    <div className="text-[#E0F4EC] font-semibold flex justify-between">
                      <span>Anomaly Delta:</span>
                      <span className={currentAnalysis.total_anomalies_found >= compareAnalysis.total_anomalies_found ? 'text-[#FF859F]' : 'text-[#B0E4CC]'}>
                        {currentAnalysis.total_anomalies_found - compareAnalysis.total_anomalies_found > 0 ? '+' : ''}
                        {currentAnalysis.total_anomalies_found - compareAnalysis.total_anomalies_found} outliers
                      </span>
                    </div>
                    <p className="text-[11px] text-[#82AFA0] leading-relaxed font-medium">
                      Reflects the divergence in flagged boundary observations between models or temporal dataset iterations.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0B1916] border border-[#285A48] text-xs space-y-2">
                    <div className="text-[#E0F4EC] font-semibold flex justify-between">
                      <span>Cohesion Variance (Δ Silhouette):</span>
                      <span className="text-[#B0E4CC] font-bold">
                        {((currentAnalysis.silhouette_score || 0) - (compareAnalysis.silhouette_score || 0)).toFixed(3)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#82AFA0] leading-relaxed font-medium">
                      Measures whether cluster definition became more distinct (+) or dispersed (-) across the comparative iterations.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Scientific Disclaimer & Transparency */}
          <div className="nexora-card p-5 rounded-2xl border-2 border-[#285A48] text-xs text-[#9EC4B5] space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-white font-bold">
              <ShieldCheck className="w-4 h-4 text-[#B0E4CC]" />
              <span>Scientific Rigor & Methodological Transparency</span>
            </div>
            <p className="leading-relaxed text-[#82AFA0] font-medium">
              Unsupervised clustering algorithms (K-Means, DBSCAN) partition observations according to geometric and density distances in feature space. While high Silhouette Scores (&gt; 0.70) indicate robust cluster cohesion, discovered segments represent statistical groupings that should always be contextualized with domain expertise.
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
