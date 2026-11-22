import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Layers, 
  AlertTriangle, 
  GitFork, 
  Sliders, 
  RefreshCw, 
  Sparkles,
  Download
} from 'lucide-react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { datasetApi } from '../services/datasetApi';
import { analysisApi } from '../services/analysisApi';

export default function DiscoveryStudioPage({ 
  selectedDatasetId, 
  selectedFeatures, 
  selectedAnalysisId, 
  setSelectedAnalysisId, 
  setActiveTab 
}) {
  const [datasets, setDatasets] = useState([]);
  const [activeDatasetId, setActiveDatasetId] = useState(selectedDatasetId);
  const [datasetDetail, setDatasetDetail] = useState(null);

  // Configuration State
  const [algorithmType, setAlgorithmType] = useState('full_discovery');
  const [kClusters, setKClusters] = useState(3);
  const [dbscanEps, setDbscanEps] = useState(0.6);
  const [dbscanMinSamples, setDbscanMinSamples] = useState(5);
  const [contamination, setContamination] = useState(0.05);
  const [scalingMethod, setScalingMethod] = useState('standard');
  const [activeFeatures, setActiveFeatures] = useState(selectedFeatures || []);

  // Execution State
  const [running, setRunning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  // Visual filter for PCA plot (all, or specific cluster)
  const [clusterFilter, setClusterFilter] = useState('all');

  // Palette colors for clusters (Soft Mint, Jade, Aquamarine, Deep Pine, Pale Mint, Medium Jade)
  const clusterColors = [
    '#B0E4CC', // Soft Mint
    '#408A71', // Sea Green / Jade
    '#7BE0B8', // Aquamarine Mint
    '#285A48', // Deep Pine
    '#9FE3C6', // Medium Seafoam
    '#55A388', // Light Jade
    '#C9EFE0'  // Ice Mint
  ];

  // Fetch datasets list & details
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const list = await datasetApi.list();
        setDatasets(list);
        if (list.length > 0 && !activeDatasetId) {
          setActiveDatasetId(list[0].id);
        }
      } catch (err) {
        setError('Failed to fetch datasets.');
      }
    };
    fetchDatasets();
  }, []);

  // Fetch dataset info & active features
  useEffect(() => {
    if (!activeDatasetId) return;
    const fetchInfo = async () => {
      try {
        const detail = await datasetApi.getById(activeDatasetId);
        setDatasetDetail(detail);

        if (detail?.profile?.column_metadata) {
          const numCols = detail.profile.column_metadata
            .filter(c => c.is_numeric && !c.name.toLowerCase().includes('id'))
            .map(c => c.name);

          if (!activeFeatures || activeFeatures.length === 0) {
            setActiveFeatures(numCols);
          }
        }
      } catch (err) {
        setError('Failed to load dataset details.');
      }
    };
    fetchInfo();
  }, [activeDatasetId]);

  // Load existing analysis if selectedAnalysisId is provided
  useEffect(() => {
    if (selectedAnalysisId) {
      const loadAnalysis = async () => {
        setRunning(true);
        try {
          const res = await analysisApi.getResults(selectedAnalysisId);
          setAnalysisResult(res);
          setActiveDatasetId(res.dataset_id);
        } catch (err) {
          setError('Failed to load analysis result.');
        } finally {
          setRunning(false);
        }
      };
      loadAnalysis();
    }
  }, [selectedAnalysisId]);

  const handleRunAnalysis = async () => {
    if (!activeDatasetId) {
      setError('Please select a dataset to analyze.');
      return;
    }

    if (activeFeatures.length === 0) {
      setError('Please select at least one numeric feature to analyze.');
      return;
    }

    setRunning(true);
    setError(null);

    const payload = {
      algorithm_type: algorithmType,
      selected_features: activeFeatures,
      k_clusters: Number(kClusters),
      dbscan_eps: Number(dbscanEps),
      dbscan_min_samples: Number(dbscanMinSamples),
      contamination: Number(contamination),
      scaling_method: scalingMethod,
    };

    try {
      const result = await analysisApi.runAnalysis(activeDatasetId, payload);
      setAnalysisResult(result);
      if (setSelectedAnalysisId) {
        setSelectedAnalysisId(result.id);
      }
    } catch (err) {
      setError(err.message || 'Analysis failed. Check your data and algorithm parameters.');
    } finally {
      setRunning(false);
    }
  };

  const toggleFeature = (col) => {
    if (activeFeatures.includes(col)) {
      setActiveFeatures(activeFeatures.filter(f => f !== col));
    } else {
      setActiveFeatures([...activeFeatures, col]);
    }
  };

  // Filter PCA points if user clicks a cluster filter
  const filteredPCA = (analysisResult?.pca_projections || []).filter(pt => {
    if (clusterFilter === 'all') return true;
    if (clusterFilter === 'anomalies') return pt.is_anomaly;
    return pt.cluster === Number(clusterFilter);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-[#285A48]/50">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>ML Discovery Studio</span>
            <span className="text-xs px-3 py-1 rounded-full bg-[#16382F] text-[#B0E4CC] border border-[#408A71] font-bold">
              Unsupervised Learning
            </span>
          </h1>
          <p className="text-xs text-[#9EC4B5] font-medium mt-1">
            Run Scikit-learn K-Means, DBSCAN, Isolation Forest, and PCA dimension reduction with instant visual feedback.
          </p>
        </div>

        {/* Dataset Switcher */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-[#82AFA0] font-bold">Target Dataset:</label>
          <select
            value={activeDatasetId || ''}
            onChange={(e) => {
              setActiveDatasetId(e.target.value);
              setAnalysisResult(null);
            }}
            className="bg-[#0B1916] border-2 border-[#285A48] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#B0E4CC] font-bold shadow-sm"
          >
            {datasets.map((ds) => (
              <option key={ds.id} value={ds.id} className="bg-[#0B1916] text-white">
                {ds.original_filename}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#3B1922] border-2 border-[#9E354F] text-[#FF859F] text-xs font-bold shadow-sm">
          {error}
        </div>
      )}

      {/* Main Studio Grid: Configuration Sidebar + Live Discovery Output */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Algorithm Controls & Parameters (1 Col) */}
        <div className="space-y-6">
          <div className="nexora-card p-5 space-y-5 shadow-sm">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#B0E4CC]" />
              <span>Algorithm Setup</span>
            </h3>

            {/* Algorithm Choice */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#E0F4EC]">Mode</label>
              <select
                value={algorithmType}
                onChange={(e) => setAlgorithmType(e.target.value)}
                className="w-full bg-[#0B1916] border-2 border-[#285A48] text-white text-xs rounded-xl p-2.5 focus:outline-none focus:border-[#B0E4CC] font-semibold"
              >
                <option value="full_discovery">Full Pattern Discovery (All Engines)</option>
                <option value="kmeans">K-Means Clustering</option>
                <option value="dbscan">DBSCAN Density Clustering</option>
                <option value="isolation_forest">Isolation Forest Anomalies</option>
              </select>
            </div>

            {/* K-Means Clusters Slider */}
            {(algorithmType === 'full_discovery' || algorithmType === 'kmeans') && (
              <div className="space-y-1.5 pt-2 border-t border-[#1D3B32]">
                <div className="flex justify-between text-xs">
                  <span className="text-[#E0F4EC] font-bold">Clusters (k):</span>
                  <span className="text-[#B0E4CC] font-black">{kClusters}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="8"
                  value={kClusters}
                  onChange={(e) => setKClusters(Number(e.target.value))}
                  className="w-full accent-[#B0E4CC] bg-[#142D26]"
                />
              </div>
            )}

            {/* DBSCAN Parameters */}
            {(algorithmType === 'full_discovery' || algorithmType === 'dbscan') && (
              <div className="space-y-3 pt-2 border-t border-[#1D3B32]">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#E0F4EC] font-semibold">DBSCAN Epsilon (ε):</span>
                    <span className="text-[#B0E4CC] font-mono font-bold">{dbscanEps}</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.8"
                    step="0.1"
                    value={dbscanEps}
                    onChange={(e) => setDbscanEps(Number(e.target.value))}
                    className="w-full accent-[#B0E4CC] bg-[#142D26]"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#E0F4EC] font-semibold">Min Samples:</span>
                    <span className="text-[#B0E4CC] font-mono font-bold">{dbscanMinSamples}</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="15"
                    value={dbscanMinSamples}
                    onChange={(e) => setDbscanMinSamples(Number(e.target.value))}
                    className="w-full accent-[#B0E4CC] bg-[#142D26]"
                  />
                </div>
              </div>
            )}

            {/* Isolation Forest Contamination */}
            {(algorithmType === 'full_discovery' || algorithmType === 'isolation_forest') && (
              <div className="space-y-1.5 pt-2 border-t border-[#1D3B32]">
                <div className="flex justify-between text-xs">
                  <span className="text-[#E0F4EC] font-bold">Anomaly Contamination:</span>
                  <span className="text-[#FF859F] font-black">{(contamination * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.15"
                  step="0.01"
                  value={contamination}
                  onChange={(e) => setContamination(Number(e.target.value))}
                  className="w-full accent-[#FF859F] bg-[#2E161E]"
                />
              </div>
            )}

            {/* Scaling Method */}
            <div className="space-y-1.5 pt-2 border-t border-[#1D3B32]">
              <label className="text-xs font-bold text-[#E0F4EC]">Scaling Technique</label>
              <select
                value={scalingMethod}
                onChange={(e) => setScalingMethod(e.target.value)}
                className="w-full bg-[#0B1916] border-2 border-[#285A48] text-white text-xs rounded-xl p-2.5 focus:outline-none focus:border-[#B0E4CC] font-semibold"
              >
                <option value="standard">StandardScaler (Zero Mean, Unit Variance)</option>
                <option value="robust">RobustScaler (Median / IQR Outlier-Resistant)</option>
              </select>
            </div>

            {/* Feature Selection Checklist */}
            <div className="space-y-2 pt-2 border-t border-[#1D3B32]">
              <label className="text-xs font-bold text-[#E0F4EC]">Active Numerical Features</label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {datasetDetail?.profile?.column_metadata
                  ?.filter(c => c.is_numeric)
                  .map((c) => (
                    <label key={c.name} className="flex items-center gap-2 text-xs text-[#9EC4B5] cursor-pointer hover:text-white font-medium">
                      <input
                        type="checkbox"
                        checked={activeFeatures.includes(c.name)}
                        onChange={() => toggleFeature(c.name)}
                        className="rounded border-[#285A48] text-[#B0E4CC] focus:ring-0"
                      />
                      <span className="truncate">{c.name}</span>
                    </label>
                  ))}
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={handleRunAnalysis}
              disabled={running || activeFeatures.length === 0}
              className="btn-primary w-full py-3 shadow-md text-xs cursor-pointer"
            >
              {running ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Models...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Pattern Discovery</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right 3 Columns: Live Discovery Visuals & Insights */}
        <div className="lg:col-span-3 space-y-6">
          
          {!analysisResult && !running && (
            <div className="nexora-card p-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#16362D] border-2 border-[#408A71] flex items-center justify-center mx-auto text-[#B0E4CC]">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-white">Discovery Studio Ready</h3>
              <p className="text-xs text-[#9EC4B5] max-w-md mx-auto leading-relaxed font-medium">
                Click <strong>"Run Pattern Discovery"</strong> on the left to execute Scikit-learn clustering, multivariate anomaly scoring, and PCA dimensionality reduction.
              </p>
            </div>
          )}

          {running && (
            <div className="nexora-card p-20 text-center space-y-4 shadow-sm">
              <RefreshCw className="w-10 h-10 animate-spin text-[#B0E4CC] mx-auto" />
              <h3 className="text-base font-black text-white">Uncovering Hidden Patterns...</h3>
              <p className="text-xs text-[#9EC4B5] max-w-sm mx-auto font-medium">
                Scaling features, computing cluster centroids, fitting Isolation Forest trees, and calculating PCA projections.
              </p>
            </div>
          )}

          {analysisResult && !running && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Top Analytical Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                {/* Silhouette Score */}
                <div className="nexora-card p-4">
                  <span className="text-[11px] font-bold text-[#82AFA0] uppercase tracking-wider">
                    Silhouette Score
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-white">
                      {analysisResult.silhouette_score !== null ? analysisResult.silhouette_score.toFixed(3) : 'N/A'}
                    </span>
                    <span className="text-[10px] text-[#B0E4CC] font-black">
                      {analysisResult.silhouette_score >= 0.5 ? 'Strong Separation' : 'Moderate'}
                    </span>
                  </div>
                </div>

                {/* Davies-Bouldin Index */}
                <div className="nexora-card p-4">
                  <span className="text-[11px] font-bold text-[#82AFA0] uppercase tracking-wider">
                    Davies-Bouldin
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-white">
                      {analysisResult.davies_bouldin_index !== null ? analysisResult.davies_bouldin_index.toFixed(3) : 'N/A'}
                    </span>
                    <span className="text-[10px] text-[#82AFA0] font-medium">
                      (Lower is better)
                    </span>
                  </div>
                </div>

                {/* PCA Explained Variance */}
                <div className="nexora-card p-4">
                  <span className="text-[11px] font-bold text-[#82AFA0] uppercase tracking-wider">
                    PCA Variance (PC1+2)
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-[#B0E4CC]">
                      {analysisResult.explained_variance_ratio ? (
                        `${((analysisResult.explained_variance_ratio[0] + (analysisResult.explained_variance_ratio[1] || 0)) * 100).toFixed(1)}%`
                      ) : 'N/A'}
                    </span>
                    <span className="text-[10px] text-[#82AFA0] font-medium">information kept</span>
                  </div>
                </div>

                {/* Anomalies Count */}
                <div className="nexora-card p-4">
                  <span className="text-[11px] font-bold text-[#82AFA0] uppercase tracking-wider">
                    Anomalies Flagged
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-[#FF859F]">
                      {analysisResult.total_anomalies_found}
                    </span>
                    <span className="text-[10px] text-[#82AFA0] font-medium">outliers</span>
                  </div>
                </div>

              </div>

              {/* Executive Summary Callout */}
              <div className="p-5 rounded-2xl bg-[#132A23] border-2 border-[#408A71] flex items-start gap-3 shadow-md">
                <Sparkles className="w-5 h-5 text-[#B0E4CC] flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-[#B0E4CC] uppercase tracking-wider">
                    Automated Executive Discovery Summary
                  </h4>
                  <p className="text-xs text-[#E0F4EC] leading-relaxed font-semibold">
                    {analysisResult.executive_summary}
                  </p>
                </div>
              </div>

              {/* 2D PCA Interactive Projection Scatter Plot */}
              <div className="nexora-card p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <GitFork className="w-4 h-4 text-[#B0E4CC]" />
                      <span>Dimensionality Reduction (PCA 2D Projection)</span>
                    </h3>
                    <p className="text-xs text-[#9EC4B5] font-medium mt-0.5">
                      High-dimensional records projected into 2 principal axes. Each point represents an observation.
                    </p>
                  </div>

                  {/* Filter by Cluster or Anomalies */}
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="text-[#82AFA0]">Filter View:</span>
                    <select
                      value={clusterFilter}
                      onChange={(e) => setClusterFilter(e.target.value)}
                      className="bg-[#0B1916] border-2 border-[#285A48] text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#B0E4CC]"
                    >
                      <option value="all">Show All Points</option>
                      <option value="anomalies">Anomalies Only</option>
                      {analysisResult.cluster_summaries?.map((c) => (
                        <option key={c.cluster_id} value={c.cluster_id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Recharts Scatter Plot */}
                <div className="w-full h-80 bg-[#0B1916] rounded-xl border-2 border-[#285A48] p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <XAxis 
                        type="number" 
                        dataKey="pc1" 
                        name="PC1" 
                        stroke="#35725E" 
                        tick={{ fill: '#82AFA0', fontSize: 11, fontWeight: 'bold' }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="pc2" 
                        name="PC2" 
                        stroke="#35725E" 
                        tick={{ fill: '#82AFA0', fontSize: 11, fontWeight: 'bold' }}
                      />
                      <ZAxis range={[70, 70]} />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-[#0E1F1B] p-3 rounded-xl border-2 border-[#408A71] text-xs shadow-2xl space-y-1 text-white">
                                <div className="font-black text-white">Record #{data.index}</div>
                                <div className="text-[#B0E4CC] font-semibold">Cluster: Segment {data.cluster + 1}</div>
                                <div className="text-[#82AFA0] font-mono">
                                  PC1: {data.pc1} | PC2: {data.pc2}
                                </div>
                                {data.is_anomaly && (
                                  <div className="text-[#FF859F] font-bold flex items-center gap-1 pt-1 border-t border-[#6E2437]">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>Anomaly Score: {(data.anomaly_score * 100).toFixed(1)}%</span>
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter data={filteredPCA}>
                        {filteredPCA.map((entry, index) => {
                          const fillColor = entry.is_anomaly 
                            ? '#FF6B8B' 
                            : clusterColors[entry.cluster % clusterColors.length];
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={fillColor} 
                              opacity={entry.is_anomaly ? 1.0 : 0.85} 
                            />
                          );
                        })}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#E0F4EC] font-bold pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#FF6B8B]"></span>
                    <span>Anomalous Observation</span>
                  </div>
                  {analysisResult.cluster_summaries?.map((c) => (
                    <div key={c.cluster_id} className="flex items-center gap-1.5">
                      <span 
                        className="w-3.5 h-3.5 rounded-full" 
                        style={{ backgroundColor: clusterColors[c.cluster_id % clusterColors.length] }}
                      ></span>
                      <span>{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discovered Cluster Profiles */}
              {analysisResult.cluster_summaries && analysisResult.cluster_summaries.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#B0E4CC]" />
                    <span>Discovered Cohort Profiles (K-Means)</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analysisResult.cluster_summaries.map((c) => (
                      <div 
                        key={c.cluster_id}
                        className="nexora-card p-5 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span 
                            className="text-xs font-bold px-3 py-1 rounded-md text-[#B0E4CC] border border-[#408A71] bg-[#16382F]"
                          >
                            {c.name}
                          </span>
                          <span className="text-xs text-[#82AFA0] font-bold">
                            {c.size} records ({c.percentage}%)
                          </span>
                        </div>

                        {/* Distinct Traits */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black text-[#82AFA0] uppercase tracking-wider">
                            Distinctive Characteristics
                          </span>
                          {c.key_traits?.length > 0 ? (
                            <ul className="space-y-1 text-xs">
                              {c.key_traits.map((t, tIdx) => (
                                <li key={tIdx} className="text-white flex items-center gap-1.5 font-semibold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#B0E4CC]"></span>
                                  <span>
                                    <strong className="text-[#B0E4CC]">{t.feature}:</strong> {t.description}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-[#82AFA0] italic">
                              Balanced group aligned with overall dataset averages.
                            </p>
                          )}
                        </div>

                        {/* Cluster Centroid Means */}
                        <div className="pt-2 border-t border-[#1D3B32] text-[11px] text-[#82AFA0] space-y-0.5 font-mono">
                          {Object.entries(c.means || {}).slice(0, 3).map(([k, v]) => (
                            <div key={k} className="flex justify-between">
                              <span className="truncate max-w-[120px] font-sans text-[#82AFA0] font-medium">{k}:</span>
                              <span className="text-white font-bold">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Discovered Patterns List */}
              {analysisResult.patterns && analysisResult.patterns.length > 0 && (
                <div className="nexora-card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#B0E4CC]" />
                      <span>Discovered Hidden Patterns & Relationships</span>
                    </h3>
                    <span className="text-xs text-[#82AFA0] font-bold">
                      {analysisResult.patterns.length} grounded patterns identified
                    </span>
                  </div>

                  <div className="space-y-3">
                    {analysisResult.patterns.map((p) => (
                      <div 
                        key={p.id}
                        className="p-4 rounded-xl bg-[#0B1916] border-2 border-[#285A48] space-y-2 hover:border-[#408A71] transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                          <span className="font-black text-white text-sm">
                            {p.title}
                          </span>
                          <div className="flex items-center gap-3 text-[#82AFA0] font-bold">
                            <span>Affected: <strong className="text-[#B0E4CC]">{p.affected_records} records</strong></span>
                            {p.confidence_score && (
                              <span>Confidence: <strong className="text-[#B0E4CC]">{(p.confidence_score * 100).toFixed(0)}%</strong></span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-[#9EC4B5] leading-relaxed font-medium">
                          {p.description}
                        </p>

                        <div className="flex items-center gap-2 pt-1 text-[11px] text-[#82AFA0]">
                          <span className="font-bold">Relevant Columns:</span>
                          <span className="text-[#B0E4CC] font-mono font-bold">
                            {p.affected_columns?.join(', ') || 'N/A'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Anomalies Explorer Table */}
              {analysisResult.anomalies && analysisResult.anomalies.length > 0 && (
                <div className="nexora-card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-[#FF859F]" />
                        <span>Isolation Forest: Top Unusual Records</span>
                      </h3>
                      <p className="text-xs text-[#9EC4B5] font-medium mt-0.5">
                        Observations displaying extreme statistical divergence from normal population parameters.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-[#285A48]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#241319] text-[#FF859F] uppercase font-bold border-b border-[#6E2437]">
                        <tr>
                          <th className="px-4 py-3">Row #</th>
                          <th className="px-4 py-3">Anomaly Severity</th>
                          <th className="px-4 py-3">Top Statistical Root Cause</th>
                          <th className="px-4 py-3">Original Values</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1D3B32] font-mono">
                        {analysisResult.anomalies.slice(0, 10).map((anom) => (
                          <tr key={anom.id} className="hover:bg-[#1D1217] transition-colors">
                            <td className="px-4 py-3 font-bold text-white">
                              #{anom.record_index + 1}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded text-[#FF859F] bg-[#3B1922] border border-[#9E354F] font-black">
                                {(anom.anomaly_score * 100).toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-4 py-3 font-sans text-white font-semibold">
                              {anom.top_contributing_features?.length > 0 ? (
                                <span className="text-[#FF859F]">
                                  {anom.top_contributing_features[0].feature}: {anom.top_contributing_features[0].reason}
                                </span>
                              ) : (
                                <span className="text-[#82AFA0]">Multivariate divergence</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-[#82AFA0] truncate max-w-xs text-[11px]">
                              {JSON.stringify(anom.feature_values)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action bar for Reports */}
              <div className="p-4 rounded-xl bg-[#112621] border-2 border-[#285A48] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                <div className="text-xs text-[#9EC4B5] font-bold">
                  Ready to export or compare findings with other algorithms?
                </div>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="btn-primary text-xs shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Analysis Reports (PDF / CSV)</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
