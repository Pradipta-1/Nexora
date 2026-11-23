import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Layers, 
  AlertTriangle, 
  UploadCloud, 
  Trash2, 
  ExternalLink, 
  RefreshCw, 
  Clock, 
  HardDrive, 
  FileText 
} from 'lucide-react';
import { analysisApi } from '../services/analysisApi';
import { datasetApi } from '../services/datasetApi';
import { formatBytes, formatDate, formatNumber } from '../utils/formatters';

export default function DashboardPage({ setActiveTab, setSelectedDatasetId, setSelectedAnalysisId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analysisApi.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDeleteDataset = async (datasetId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this dataset and all associated analysis runs?')) {
      return;
    }
    setDeletingId(datasetId);
    try {
      await datasetApi.delete(datasetId);
      setActionMessage('Dataset removed successfully.');
      setTimeout(() => setActionMessage(null), 3500);
      fetchStats();
    } catch (err) {
      setError(err.message || 'Failed to delete dataset.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleInspectDataset = (datasetId) => {
    setSelectedDatasetId(datasetId);
    setActiveTab('profiler');
  };

  const handleViewAnalysis = (analysisId) => {
    if (setSelectedAnalysisId) {
      setSelectedAnalysisId(analysisId);
    }
    setActiveTab('studio');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-[#285A48]/50">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Discovery Intelligence Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#9EC4B5] font-medium mt-1">
            Real-time telemetry and overview of processed datasets, discovered patterns, and anomaly clusters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="p-2.5 rounded-xl bg-[#0E1F1B] border-2 border-[#285A48] text-[#9EC4B5] hover:text-white hover:bg-[#1A382F] hover:border-[#408A71] transition-all cursor-pointer shadow-sm"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#B0E4CC]' : ''}`} />
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className="btn-primary text-xs sm:text-sm shadow-md"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Dataset</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-[#132B25] border-2 border-[#408A71] text-[#B0E4CC] text-xs font-bold flex items-center justify-between shadow-sm">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-[#B0E4CC] hover:text-white font-bold cursor-pointer">✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-[#3B1922] border-2 border-[#9E354F] text-[#FF859F] text-sm font-semibold shadow-sm">
          {error}
        </div>
      )}

      {/* Telemetry Command Bar */}
      <div className="nexora-panel p-0 overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-[#1E4438] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Total Datasets */}
        <div className="p-5 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#82AFA0]">
            <span>DATASETS REGISTERED</span>
            <Database className="w-3.5 h-3.5 text-[#B0E4CC]" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {loading ? '...' : formatNumber(stats?.total_datasets ?? 0)}
            </span>
            <span className="text-[10px] text-[#558776] font-mono">tables</span>
          </div>
        </div>

        {/* Total Records Analyzed */}
        <div className="p-5 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#82AFA0]">
            <span>OBSERVATIONS PROCESSED</span>
            <HardDrive className="w-3.5 h-3.5 text-[#B0E4CC]" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {loading ? '...' : formatNumber(stats?.total_records_analyzed ?? 0)}
            </span>
            <span className="text-[10px] text-[#558776] font-mono">rows</span>
          </div>
        </div>

        {/* Patterns Discovered */}
        <div className="p-5 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#82AFA0]">
            <span>COHORTS IDENTIFIED</span>
            <Layers className="w-3.5 h-3.5 text-[#B0E4CC]" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {loading ? '...' : formatNumber(stats?.total_patterns_discovered ?? 0)}
            </span>
            <span className="text-[10px] text-[#558776] font-mono">clusters</span>
          </div>
        </div>

        {/* Anomalies Detected */}
        <div className="p-5 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#FFA3B4]">
            <span>ANOMALIES FLAGGED</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#FFA3B4]" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl sm:text-3xl font-black text-[#FFA3B4] font-mono">
              {loading ? '...' : formatNumber(stats?.total_anomalies_detected ?? 0)}
            </span>
            <span className="text-[10px] text-[#FFA3B4]/60 font-mono">outliers</span>
          </div>
        </div>

      </div>

      {/* Main Content Sections: Datasets History & Recent Analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Dataset Registry */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-[#B0E4CC]" />
              <span>Dataset History & Storage</span>
            </h2>
            <span className="text-xs text-[#82AFA0] font-semibold">
              {stats?.recent_datasets?.length || 0} active datasets
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-[#9EC4B5] nexora-card">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#B0E4CC] mb-2" />
              <span>Loading dataset history...</span>
            </div>
          ) : stats?.recent_datasets?.length === 0 ? (
            <div className="nexora-card p-12 text-center border border-[#285A48] space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#16362D] text-[#B0E4CC] flex items-center justify-center mx-auto border border-[#408A71]">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No Datasets Uploaded Yet</h3>
                <p className="text-xs text-[#9EC4B5] mt-1 max-w-sm mx-auto font-medium">
                  Upload your first CSV or Excel file, or start with one of our curated sample datasets.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('upload')}
                className="btn-primary text-xs px-5 py-2"
              >
                Upload File Now
              </button>
            </div>
          ) : (
            <div className="nexora-card overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#122A23] text-[#B0E4CC] uppercase font-bold border-b border-[#285A48]">
                    <tr>
                      <th className="px-5 py-3.5">Filename</th>
                      <th className="px-5 py-3.5">Rows & Cols</th>
                      <th className="px-5 py-3.5">File Size</th>
                      <th className="px-5 py-3.5">Uploaded</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1D3B32] font-medium">
                    {stats?.recent_datasets?.map((ds) => (
                      <tr 
                        key={ds.id}
                        onClick={() => handleInspectDataset(ds.id)}
                        className="hover:bg-[#132A23] cursor-pointer transition-colors group"
                      >
                        <td className="px-5 py-3.5 font-bold text-white flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#B0E4CC] group-hover:scale-110 transition-transform" />
                          <span className="truncate max-w-[200px]" title={ds.original_filename}>
                            {ds.original_filename}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[#9EC4B5]">
                          {formatNumber(ds.total_rows)} rows × {ds.total_columns} cols
                        </td>
                        <td className="px-5 py-3.5 text-[#82AFA0]">
                          {formatBytes(ds.file_size_bytes)}
                        </td>
                        <td className="px-5 py-3.5 text-[#82AFA0]">
                          {formatDate(ds.created_at)}
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleInspectDataset(ds.id)}
                            className="px-2.5 py-1 rounded-md bg-[#16362D] hover:bg-[#285A48] text-[#B0E4CC] hover:text-white text-[11px] font-bold border border-[#408A71] transition-colors cursor-pointer"
                          >
                            Profile
                          </button>
                          <button
                            onClick={(e) => handleDeleteDataset(ds.id, e)}
                            disabled={deletingId === ds.id}
                            className="p-1 rounded-md text-[#82AFA0] hover:text-[#FF859F] hover:bg-[#3B1922] transition-colors cursor-pointer"
                            title="Delete dataset"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Recent Analyses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#B0E4CC]" />
              <span>Recent Analyses</span>
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-[#82AFA0] nexora-card text-xs">
              Fetching recent analyses...
            </div>
          ) : stats?.recent_analyses?.length === 0 ? (
            <div className="nexora-card p-8 text-center text-xs text-[#82AFA0] space-y-2 font-medium">
              <p>No machine learning runs executed yet.</p>
              <p className="text-[11px] text-[#5D8B7A]">
                Run K-Means, DBSCAN, or Isolation Forest on any dataset to populate this feed.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats?.recent_analyses?.map((run) => (
                <div
                  key={run.id}
                  onClick={() => handleViewAnalysis(run.id)}
                  className="nexora-card p-4 hover:border-[#408A71] cursor-pointer space-y-2.5 transition-all group shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#B0E4CC] uppercase tracking-wider text-[11px] px-2.5 py-0.5 rounded bg-[#16362D] border border-[#408A71]">
                      {run.algorithm_type.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-[#82AFA0] font-medium">
                      {formatDate(run.created_at)}
                    </span>
                  </div>

                  <div className="text-xs text-white font-bold truncate" title={run.dataset_name}>
                    {run.dataset_name}
                  </div>

                  <div className="pt-2 border-t border-[#1E3B33] flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-3">
                      <span className="text-[#82AFA0]">
                        Patterns: <strong className="text-[#B0E4CC] font-black">{run.patterns_count}</strong>
                      </span>
                      <span className="text-[#82AFA0]">
                        Anomalies: <strong className="text-[#FF859F] font-black">{run.anomalies_count}</strong>
                      </span>
                    </div>
                    <span className="text-[#B0E4CC] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-bold">
                      View <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
