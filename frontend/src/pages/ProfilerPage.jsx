import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  HelpCircle, 
  CheckSquare, 
  Square, 
  ArrowRight, 
  Layers, 
  RefreshCw, 
  Sliders, 
  ChevronDown, 
  Info,
  Database
} from 'lucide-react';
import { datasetApi } from '../services/datasetApi';
import { formatNumber } from '../utils/formatters';

export default function ProfilerPage({ 
  selectedDatasetId, 
  setSelectedDatasetId, 
  setActiveTab, 
  selectedFeatures, 
  setSelectedFeatures 
}) {
  const [datasets, setDatasets] = useState([]);
  const [currentDataset, setCurrentDataset] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Technical Tooltip Dictionary
  const tooltips = {
    mean: 'The mathematical arithmetic average of all non-null values in this column.',
    std: 'Standard Deviation: Measures how spread out numbers are from the average. High values indicate high variability.',
    median: 'The 50th percentile value. Half the observations fall below, and half fall above.',
    skewness: 'Measures distribution asymmetry. Values > 1 indicate right-skew (high outliers); < -1 indicate left-skew.',
    missing_pct: 'Percentage of rows with empty, NaN, or null values for this feature.',
    unique_count: 'The count of distinct values present across all rows.',
    correlation: 'Statistical association between two variables from -1.0 to +1.0. Important: Correlation does not prove causation.'
  };

  // Load datasets list
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const list = await datasetApi.list();
        setDatasets(list);
        if (list.length > 0 && !selectedDatasetId) {
          setSelectedDatasetId(list[0].id);
        }
      } catch (err) {
        setError('Failed to fetch dataset list.');
      }
    };
    fetchDatasets();
  }, []);

  // Load profile when dataset changes
  useEffect(() => {
    if (!selectedDatasetId) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const dsDetail = await datasetApi.getById(selectedDatasetId);
        setCurrentDataset(dsDetail);
        
        const prof = await datasetApi.getProfile(selectedDatasetId);
        setProfile(prof);

        // Pre-select all numeric columns if none selected
        if (!selectedFeatures || selectedFeatures.length === 0) {
          let numCols = prof.column_metadata
            .filter(c => c.is_numeric && !c.name.toLowerCase().includes('id'))
            .map(c => c.name);
          if (numCols.length === 0) {
            numCols = prof.column_metadata.filter(c => c.is_numeric).map(c => c.name);
          }
          if (setSelectedFeatures) setSelectedFeatures(numCols);
        }
      } catch (err) {
        setError(err.message || 'Failed to generate profile for this dataset.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [selectedDatasetId]);

  const toggleFeature = (colName) => {
    if (!setSelectedFeatures) return;
    if (selectedFeatures.includes(colName)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== colName));
    } else {
      setSelectedFeatures([...selectedFeatures, colName]);
    }
  };

  const selectAllNumeric = () => {
    if (!profile?.column_metadata || !setSelectedFeatures) return;
    const numCols = profile.column_metadata
      .filter(c => c.is_numeric)
      .map(c => c.name);
    setSelectedFeatures(numCols);
  };

  const clearSelection = () => {
    if (setSelectedFeatures) setSelectedFeatures([]);
  };

  const handleLaunchML = () => {
    if (!selectedFeatures || selectedFeatures.length === 0) {
      alert('Please select at least one numerical column for analysis.');
      return;
    }
    setActiveTab('studio');
  };

  // Color gradient for correlation matrix using Obsidian, Pine, Jade, Mint palette
  const getCorrelationColor = (val) => {
    if (val === null || val === undefined) return 'bg-[#0E1F1B] text-[#82AFA0]';
    if (val >= 0.7) return 'bg-[#B0E4CC] text-[#091413] font-black border border-[#B0E4CC] shadow-sm';
    if (val >= 0.4) return 'bg-[#408A71] text-white font-bold';
    if (val > 0) return 'bg-[#285A48] text-[#E0F4EC] font-semibold';
    if (val <= -0.7) return 'bg-[#6E2437] text-white font-black border border-[#9E354F]';
    if (val <= -0.4) return 'bg-[#3B1922] text-[#FF859F] font-bold';
    if (val < 0) return 'bg-[#25181E] text-[#FF859F] font-semibold';
    return 'bg-[#0E1F1B] text-[#82AFA0]';
  };

  if (datasets.length === 0 && !loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#16362D] text-[#B0E4CC] flex items-center justify-center mx-auto border border-[#408A71]">
          <Database className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">No Datasets Available to Profile</h2>
        <p className="text-xs text-[#9EC4B5] max-w-sm mx-auto font-medium">
          Please upload a CSV/Excel file or load our demo dataset first.
        </p>
        <button
          onClick={() => setActiveTab('upload')}
          className="btn-primary text-xs px-5 py-2.5"
        >
          Upload Dataset Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Dataset Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-[#285A48]/50">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Automated Data Profiler</span>
            <span className="text-xs px-3 py-1 rounded-full bg-[#16382F] text-[#B0E4CC] border border-[#408A71] font-bold">
              Metadata & Statistics
            </span>
          </h1>
          <p className="text-xs text-[#9EC4B5] font-medium mt-1">
            Examine column distributions, missing values, correlation patterns, and select active features for ML analysis.
          </p>
        </div>

        {/* Dataset Switcher Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-[#82AFA0] font-bold whitespace-nowrap">Active Dataset:</label>
          <div className="relative">
            <select
              value={selectedDatasetId || ''}
              onChange={(e) => setSelectedDatasetId(e.target.value)}
              className="bg-[#0B1916] border-2 border-[#285A48] text-white text-xs rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-[#B0E4CC] appearance-none font-bold shadow-sm"
            >
              {datasets.map((ds) => (
                <option key={ds.id} value={ds.id} className="bg-[#0B1916] text-white">
                  {ds.original_filename} ({ds.total_rows} rows)
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#82AFA0] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-[#82AFA0] nexora-card space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#B0E4CC] mx-auto" />
          <p className="text-sm font-bold text-white">Profiling dataset features & calculating statistics...</p>
          <p className="text-xs text-[#9EC4B5] font-medium">Checking data types, correlations, and distributions</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-[#3B1922] border-2 border-[#9E354F] text-[#FF859F] text-sm font-bold shadow-sm">
          {error}
        </div>
      ) : profile && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Summary Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="nexora-card p-4">
              <span className="text-[11px] font-bold text-[#82AFA0] uppercase tracking-wider">Total Rows</span>
              <div className="text-2xl font-black text-white mt-1">
                {formatNumber(currentDataset?.total_rows)}
              </div>
            </div>
            <div className="nexora-card p-4">
              <span className="text-[11px] font-bold text-[#82AFA0] uppercase tracking-wider">Total Columns</span>
              <div className="text-2xl font-black text-white mt-1">
                {profile.column_metadata.length}
              </div>
            </div>
            <div className="nexora-card p-4">
              <span className="text-[11px] font-bold text-[#82AFA0] uppercase tracking-wider">Numerical Features</span>
              <div className="text-2xl font-black text-[#B0E4CC] mt-1">
                {profile.column_metadata.filter(c => c.is_numeric).length}
              </div>
            </div>
            <div className="nexora-card p-4">
              <span className="text-[11px] font-bold text-[#82AFA0] uppercase tracking-wider">Categorical / Text</span>
              <div className="text-2xl font-black text-[#55A388] mt-1">
                {profile.column_metadata.filter(c => !c.is_numeric).length}
              </div>
            </div>
          </div>

          {/* Feature Selection & Column Inspector */}
          <div className="nexora-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#B0E4CC]" />
                  <span>Column Inventory & Feature Selection</span>
                </h3>
                <p className="text-xs text-[#9EC4B5] font-medium mt-0.5">
                  Select columns to include in unsupervised pattern discovery. Non-numeric or identifier columns (IDs) are excluded by default.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={selectAllNumeric}
                  className="px-3 py-1.5 rounded-lg bg-[#16362D] hover:bg-[#285A48] text-[#B0E4CC] text-xs font-bold border border-[#408A71] transition-colors cursor-pointer"
                >
                  Select All Numeric
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1.5 rounded-lg bg-[#0E1F1B] hover:bg-[#1A382F] text-[#82AFA0] hover:text-white text-xs font-bold border border-[#285A48] transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Column Metadata Table */}
            <div className="overflow-x-auto rounded-xl border border-[#234C40] shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#122A23] text-[#B0E4CC] uppercase font-bold border-b border-[#285A48]">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">Include</th>
                    <th className="px-4 py-3">Column Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Unique Values</th>
                    <th className="px-4 py-3">Missing (%)</th>
                    <th className="px-4 py-3">Sample Values</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1D3B32] font-medium">
                  {profile.column_metadata.map((col) => {
                    const isSelected = selectedFeatures?.includes(col.name);
                    return (
                      <tr 
                        key={col.name}
                        onClick={() => col.is_numeric && toggleFeature(col.name)}
                        className={`transition-colors ${
                          col.is_numeric 
                            ? 'hover:bg-[#132A23] cursor-pointer' 
                            : 'opacity-50 bg-[#0A1614] cursor-not-allowed'
                        }`}
                      >
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            disabled={!col.is_numeric}
                            onClick={() => toggleFeature(col.name)}
                            className="text-[#82AFA0] hover:text-white disabled:opacity-30 cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#B0E4CC]" />
                            ) : (
                              <Square className="w-4 h-4 text-[#408A71]" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                          <span>{col.name}</span>
                          {isSelected && (
                            <span className="text-[10px] px-2 py-0.2 rounded bg-[#16382F] text-[#B0E4CC] font-black border border-[#408A71]">
                              ACTIVE
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                            col.is_numeric 
                              ? 'bg-[#16362D] text-[#B0E4CC] border border-[#408A71]' 
                              : 'bg-[#0E1F1B] text-[#82AFA0] border border-[#285A48]'
                          }`}>
                            {col.dtype}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#E0F4EC] font-mono font-semibold">
                          {formatNumber(col.unique_count)}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold">
                          <span className={col.missing_count > 0 ? 'text-[#FF859F]' : 'text-[#B0E4CC]'}>
                            {col.missing_count} ({col.missing_pct}%)
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#82AFA0] font-mono text-[11px] truncate max-w-xs">
                          {col.sample_values?.slice(0, 3).join(', ')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Launch ML Bar */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#1D3B32]">
              <div className="text-xs text-[#82AFA0] font-semibold">
                Selected for ML: <strong className="text-[#B0E4CC] font-black">{selectedFeatures?.length || 0}</strong> features
              </div>
              <button
                onClick={handleLaunchML}
                disabled={!selectedFeatures || selectedFeatures.length === 0}
                className="btn-primary text-xs px-6 py-2.5 shadow-md"
              >
                <span>Launch Discovery Studio with {selectedFeatures?.length || 0} Features</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Numerical Summary Statistics Table */}
          {profile.summary_statistics && Object.keys(profile.summary_statistics).length > 0 && (
            <div className="nexora-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#B0E4CC]" />
                    <span>Parametric & Non-Parametric Statistics</span>
                  </h3>
                  <p className="text-xs text-[#9EC4B5] font-medium mt-0.5">
                    Hover over metric headers for mathematical explanations of each statistical measure.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#234C40] shadow-sm">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#122A23] text-[#B0E4CC] uppercase font-bold border-b border-[#285A48]">
                    <tr>
                      <th className="px-4 py-3 font-sans">Feature</th>
                      <th className="px-4 py-3 group relative cursor-help">
                        <span className="border-b border-dashed border-[#82AFA0]">Mean</span>
                        <span className="hidden group-hover:block absolute z-20 top-8 left-0 w-48 p-2.5 rounded-xl bg-[#0E1F1B] border border-[#408A71] text-[11px] text-[#E0F4EC] shadow-2xl font-sans normal-case font-medium">
                          {tooltips.mean}
                        </span>
                      </th>
                      <th className="px-4 py-3 group relative cursor-help">
                        <span className="border-b border-dashed border-[#82AFA0]">Std Dev</span>
                        <span className="hidden group-hover:block absolute z-20 top-8 left-0 w-48 p-2.5 rounded-xl bg-[#0E1F1B] border border-[#408A71] text-[11px] text-[#E0F4EC] shadow-2xl font-sans normal-case font-medium">
                          {tooltips.std}
                        </span>
                      </th>
                      <th className="px-4 py-3">Min</th>
                      <th className="px-4 py-3 group relative cursor-help">
                        <span className="border-b border-dashed border-[#82AFA0]">Median</span>
                        <span className="hidden group-hover:block absolute z-20 top-8 left-0 w-48 p-2.5 rounded-xl bg-[#0E1F1B] border border-[#408A71] text-[11px] text-[#E0F4EC] shadow-2xl font-sans normal-case font-medium">
                          {tooltips.median}
                        </span>
                      </th>
                      <th className="px-4 py-3">Max</th>
                      <th className="px-4 py-3 group relative cursor-help">
                        <span className="border-b border-dashed border-[#82AFA0]">Skewness</span>
                        <span className="hidden group-hover:block absolute z-20 top-8 left-0 w-48 p-2.5 rounded-xl bg-[#0E1F1B] border border-[#408A71] text-[11px] text-[#E0F4EC] shadow-2xl font-sans normal-case font-medium">
                          {tooltips.skewness}
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1D3B32] font-medium">
                    {Object.entries(profile.summary_statistics).map(([col, stats]) => (
                      <tr key={col} className="hover:bg-[#132A23]">
                        <td className="px-4 py-2.5 font-sans font-bold text-white">{col}</td>
                        <td className="px-4 py-2.5 text-[#E0F4EC]">{stats.mean?.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-[#82AFA0]">{stats.std?.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-[#82AFA0]">{stats.min?.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-[#B0E4CC] font-black">{stats.median?.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-[#82AFA0]">{stats.max?.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-[#82AFA0]">
                          <span className={Math.abs(stats.skewness || 0) > 1.5 ? 'text-[#FF859F] font-bold' : ''}>
                            {stats.skewness?.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Correlation Matrix Heatmap */}
          {profile.correlation_matrix?.columns && profile.correlation_matrix.columns.length >= 2 && (
            <div className="nexora-card p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#B0E4CC]" />
                    <span>Pairwise Correlation Matrix (Pearson)</span>
                  </h3>
                  <p className="text-xs text-[#9EC4B5] font-medium mt-0.5">
                    Measures linear relationships between numerical features from -1.0 (inverse) to +1.0 (positive).
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-white font-bold">
                  <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-[#6E2437] border border-[#9E354F] inline-block"></span> Negative (-1.0)</span>
                  <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-[#0E1F1B] border border-[#285A48] inline-block"></span> Neutral (0.0)</span>
                  <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-[#B0E4CC] border border-[#B0E4CC] inline-block"></span> Positive (+1.0)</span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#234C40] p-3 bg-[#0B1916] shadow-inner">
                <table className="w-full text-center text-xs font-mono">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left font-sans text-white font-bold"></th>
                      {profile.correlation_matrix.columns.map((c) => (
                        <th key={c} className="px-3 py-2 font-sans text-[#B0E4CC] font-bold truncate max-w-[120px]" title={c}>
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {profile.correlation_matrix.columns.map((rCol, rIdx) => (
                      <tr key={rCol}>
                        <td className="px-3 py-2 text-left font-sans font-bold text-white truncate max-w-[120px]" title={rCol}>
                          {rCol}
                        </td>
                        {profile.correlation_matrix.matrix[rIdx].map((val, cIdx) => (
                          <td key={cIdx} className="p-1">
                            <div 
                              className={`p-2.5 rounded-lg font-mono text-[11px] transition-all hover:scale-105 cursor-pointer shadow-sm ${getCorrelationColor(val)}`}
                              title={`Correlation between ${rCol} and ${profile.correlation_matrix.columns[cIdx]}: ${val}`}
                            >
                              {val.toFixed(2)}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3.5 rounded-xl bg-[#132A23] border border-[#408A71] flex items-center gap-2 text-xs text-[#E0F4EC]">
                <Info className="w-4 h-4 text-[#B0E4CC] flex-shrink-0" />
                <span>
                  <strong className="text-[#B0E4CC]">Statistical Caveat:</strong> Strong correlation indicates that two variables move together, but it does not establish cause and effect. Always consider domain context and confounding factors.
                </span>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
