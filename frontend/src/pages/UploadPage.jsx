import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  FileSpreadsheet, 
  Eye, 
  RefreshCw 
} from 'lucide-react';
import { datasetApi } from '../services/datasetApi';
import { formatBytes, formatNumber } from '../utils/formatters';

export default function UploadPage({ setActiveTab, setSelectedDatasetId }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  
  // Preview data after upload or selection
  const [uploadedDataset, setUploadedDataset] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setUploadError(null);
    if (!selectedFile) return;

    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    const allowed = ['.csv', '.xlsx', '.xls'];

    if (!allowed.includes(ext)) {
      setUploadError(`Unsupported file format '${ext}'. Please upload a valid .csv, .xlsx, or .xls file.`);
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setUploadError('File exceeds 50MB limit. Please upload a smaller dataset.');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const dataset = await datasetApi.upload(file, (percent) => {
        setUploadProgress(percent);
      });

      setUploadedDataset(dataset);
      setSelectedDatasetId(dataset.id);

      // Fetch preview rows
      setLoadingPreview(true);
      const preview = await datasetApi.getPreview(dataset.id);
      setPreviewData(preview);
      setLoadingPreview(false);

    } catch (err) {
      setUploadError(err.message || 'Upload failed. Ensure the dataset contains valid rows and columns.');
    } finally {
      setUploading(false);
    }
  };

  const handleLoadSample = async (sampleName) => {
    setUploading(true);
    setUploadError(null);
    setFile(null);

    try {
      const dataset = await datasetApi.loadSample(sampleName);
      setUploadedDataset(dataset);
      setSelectedDatasetId(dataset.id);

      setLoadingPreview(true);
      const preview = await datasetApi.getPreview(dataset.id);
      setPreviewData(preview);
      setLoadingPreview(false);
    } catch (err) {
      setUploadError(err.message || 'Failed to load demo dataset.');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setUploadedDataset(null);
    setPreviewData(null);
    setUploadProgress(0);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleProceedToProfile = () => {
    if (uploadedDataset) {
      setSelectedDatasetId(uploadedDataset.id);
      setActiveTab('profiler');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-white tracking-tight">
          Dataset Ingestion & Validation
        </h1>
        <p className="mt-2 text-sm text-[#9EC4B5] font-medium">
          Upload any CSV or Excel tabular file for automated cleaning, type detection, and profile verification.
        </p>
      </div>

      {/* Upload Zone & Controls */}
      {!uploadedDataset && (
        <div className="space-y-6">
          
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-3 border-dashed rounded-3xl p-10 text-center transition-all bg-[#0E1F1B] shadow-md ${
              dragActive 
                ? 'border-[#B0E4CC] bg-[#142D26]' 
                : 'border-[#285A48] hover:border-[#408A71]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />

            <div className="w-16 h-16 rounded-2xl bg-[#16362D] border border-[#408A71] flex items-center justify-center mx-auto text-[#B0E4CC] mb-4 shadow-sm">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-white">
              Drag and drop your dataset here
            </h3>
            <p className="text-xs text-[#82AFA0] mt-1 font-medium">
              Supports CSV, Excel (.xlsx, .xls) up to 50MB
            </p>

            <div className="mt-6 flex justify-center">
              <label
                htmlFor="file-upload"
                className="btn-primary text-xs cursor-pointer shadow-md"
              >
                Browse Files
              </label>
            </div>
          </div>

          {/* Selected File Card */}
          {file && (
            <div className="nexora-card p-5 border-2 border-[#285A48] flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-md">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="p-3 rounded-xl bg-[#16362D] text-[#B0E4CC] border border-[#408A71]">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white truncate max-w-sm" title={file.name}>
                    {file.name}
                  </div>
                  <div className="text-xs text-[#82AFA0] font-medium">
                    {formatBytes(file.size)} • Ready for processing
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleClear}
                  disabled={uploading}
                  className="px-3 py-2 rounded-xl text-[#82AFA0] hover:text-[#FF859F] text-xs font-bold cursor-pointer transition-colors"
                >
                  Remove
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn-primary text-xs shadow-md"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Validating & Uploading ({uploadProgress}%)</span>
                    </>
                  ) : (
                    <>
                      <span>Upload & Inspect</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {uploading && (
            <div className="w-full bg-[#132B25] rounded-full h-2.5 overflow-hidden border border-[#285A48]">
              <div
                className="bg-[#B0E4CC] h-2.5 transition-all duration-300 shadow-sm"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="p-4 rounded-2xl bg-[#3B1922] border-2 border-[#9E354F] text-[#FF859F] text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Quick-Start Demo Datasets */}
          <div className="pt-4 border-t-2 border-[#285A48]/50">
            <div className="text-xs font-bold uppercase tracking-wider text-[#82AFA0] mb-3 text-center sm:text-left">
              Or Try One of Our Pre-Loaded Real Datasets
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div 
                onClick={() => handleLoadSample('customer_segments')}
                className="nexora-card p-4 hover:border-[#408A71] cursor-pointer space-y-1.5 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-[#B0E4CC] transition-colors">
                    Customer Segmentation Dataset
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#16362D] text-[#B0E4CC] font-bold border border-[#408A71]">
                    250 rows
                  </span>
                </div>
                <p className="text-[11px] text-[#82AFA0] font-medium">
                  Real behavioral records: Age, Annual Income, Spending Score, Annual Purchases, and Loyalty.
                </p>
              </div>

              <div 
                onClick={() => handleLoadSample('sensor_anomalies')}
                className="nexora-card p-4 hover:border-[#408A71] cursor-pointer space-y-1.5 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-[#B0E4CC] transition-colors">
                    Industrial Sensor Readings
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#16362D] text-[#B0E4CC] font-bold border border-[#408A71]">
                    300 rows
                  </span>
                </div>
                <p className="text-[11px] text-[#82AFA0] font-medium">
                  Telemetry logs: Temperature, Vibration, Pressure, Power Draw with synthetic machine distress spikes.
                </p>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* Successfully Uploaded State & Live Data Preview */}
      {uploadedDataset && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Header Summary Banner */}
          <div className="nexora-panel p-6 border-2 border-[#285A48] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#16362D] text-[#B0E4CC] border border-[#408A71] flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{uploadedDataset.original_filename}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#16382F] text-[#B0E4CC] font-bold border border-[#408A71]">
                    {uploadedDataset.file_type.toUpperCase()}
                  </span>
                </h3>
                <p className="text-xs text-[#9EC4B5] font-medium mt-0.5">
                  Verified: {formatNumber(uploadedDataset.total_rows)} records • {uploadedDataset.total_columns} columns • {formatBytes(uploadedDataset.file_size_bytes)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleClear}
                className="btn-secondary text-xs px-4 py-2"
              >
                Replace Dataset
              </button>
              <button
                onClick={handleProceedToProfile}
                className="btn-primary text-xs px-6 py-2.5 shadow-md"
              >
                <span>Proceed to Profiler & ML</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* First 10 Rows Preview Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#B0E4CC]" />
                <span>Dataset Preview (First 10 Observations)</span>
              </h3>
              <span className="text-xs text-[#82AFA0] font-semibold">
                Displaying 10 of {formatNumber(uploadedDataset.total_rows)} rows
              </span>
            </div>

            {loadingPreview ? (
              <div className="p-12 text-center text-[#82AFA0] nexora-card text-xs">
                Loading table preview...
              </div>
            ) : previewData?.preview_rows ? (
              <div className="nexora-card overflow-hidden shadow-sm">
                <div className="overflow-x-auto max-h-[420px]">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-[#122A23] text-[#B0E4CC] uppercase font-bold border-b border-[#285A48] sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-[#82AFA0] w-12 font-mono">#</th>
                        {previewData.columns.map((col, idx) => (
                          <th key={idx} className="px-4 py-3 text-[#B0E4CC]">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1D3B32] font-mono">
                      {previewData.preview_rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-[#132A23] transition-colors">
                          <td className="px-4 py-2.5 text-[#82AFA0] font-bold">{rIdx + 1}</td>
                          {previewData.columns.map((col, cIdx) => (
                            <td key={cIdx} className="px-4 py-2.5 text-white">
                              {row[col] === null || row[col] === undefined ? (
                                <span className="text-[#5D8B7A] italic">null</span>
                              ) : (
                                String(row[col])
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>

        </div>
      )}

    </div>
  );
}
