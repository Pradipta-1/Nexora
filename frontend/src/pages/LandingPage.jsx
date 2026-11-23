import React, { useState } from 'react';
import { 
  ArrowRight, 
  Layers, 
  AlertTriangle, 
  GitFork, 
  Sliders, 
  TrendingUp, 
  Database, 
  BarChart2, 
  ChevronRight,
  Terminal,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Search,
  Filter
} from 'lucide-react';
import { datasetApi } from '../services/datasetApi';

export default function LandingPage({ setActiveTab, setSelectedDatasetId }) {
  const [loadingSample, setLoadingSample] = useState(false);
  const [sampleError, setSampleError] = useState(null);

  // Interactive Hero Preview state
  const [activeDemoCluster, setActiveDemoCluster] = useState('all');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Sample data points for interactive hero preview canvas
  const demoPoints = [
    // Cohort 1: High Income Savers (Mint)
    { id: 1, pc1: 180, pc2: 90, cluster: 0, label: 'High Income Savers', income: '$105k', spend: '28 score', age: 49 },
    { id: 2, pc1: 195, pc2: 105, cluster: 0, label: 'High Income Savers', income: '$112k', spend: '31 score', age: 52 },
    { id: 3, pc1: 210, pc2: 80, cluster: 0, label: 'High Income Savers', income: '$98k', spend: '24 score', age: 47 },
    { id: 4, pc1: 170, pc2: 120, cluster: 0, label: 'High Income Savers', income: '$108k', spend: '29 score', age: 51 },
    { id: 5, pc1: 225, pc2: 110, cluster: 0, label: 'High Income Savers', income: '$120k', spend: '33 score', age: 54 },
    { id: 6, pc1: 190, pc2: 135, cluster: 0, label: 'High Income Savers', income: '$102k', spend: '26 score', age: 48 },

    // Cohort 2: Emerging Shoppers (Jade)
    { id: 7, pc1: 85, pc2: 180, cluster: 1, label: 'Emerging Shoppers', income: '$48k', spend: '76 score', age: 26 },
    { id: 8, pc1: 95, pc2: 200, cluster: 1, label: 'Emerging Shoppers', income: '$52k', spend: '82 score', age: 28 },
    { id: 9, pc1: 70, pc2: 165, cluster: 1, label: 'Emerging Shoppers', income: '$45k', spend: '71 score', age: 24 },
    { id: 10, pc1: 110, pc2: 190, cluster: 1, label: 'Emerging Shoppers', income: '$56k', spend: '85 score', age: 29 },
    { id: 11, pc1: 80, pc2: 215, cluster: 1, label: 'Emerging Shoppers', income: '$49k', spend: '79 score', age: 27 },

    // Cohort 3: Mainstream Base (Pine)
    { id: 12, pc1: 280, pc2: 210, cluster: 2, label: 'Mainstream Base', income: '$62k', spend: '49 score', age: 39 },
    { id: 13, pc1: 295, pc2: 230, cluster: 2, label: 'Mainstream Base', income: '$65k', spend: '52 score', age: 41 },
    { id: 14, pc1: 270, pc2: 195, cluster: 2, label: 'Mainstream Base', income: '$59k', spend: '47 score', age: 37 },
    { id: 15, pc1: 310, pc2: 225, cluster: 2, label: 'Mainstream Base', income: '$68k', spend: '54 score', age: 42 },
    { id: 16, pc1: 260, pc2: 240, cluster: 2, label: 'Mainstream Base', income: '$61k', spend: '50 score', age: 38 },

    // Multivariate Anomalies (Coral)
    { id: 17, pc1: 60, pc2: 50, cluster: -1, isAnomaly: true, label: 'Outlier #17', reason: 'Extreme Low Spend at High Income', score: '94.2%' },
    { id: 18, pc1: 340, pc2: 70, cluster: -1, isAnomaly: true, label: 'Outlier #42', reason: 'Unusual Purchase Velocity Spike (3.9σ)', score: '91.8%' },
  ];

  const handleQuickStart = async (sampleType) => {
    setLoadingSample(true);
    setSampleError(null);
    try {
      const dataset = await datasetApi.loadSample(sampleType);
      if (setSelectedDatasetId) {
        setSelectedDatasetId(dataset.id);
      }
      setActiveTab('profiler');
    } catch (err) {
      setSampleError(err.message || 'Failed to load sample dataset.');
    } finally {
      setLoadingSample(false);
    }
  };

  const filteredDemoPoints = demoPoints.filter(p => {
    if (activeDemoCluster === 'all') return true;
    if (activeDemoCluster === 'anomalies') return p.isAnomaly;
    return p.cluster === Number(activeDemoCluster);
  });

  return (
    <div className="space-y-24 py-6">
      
      {/* Hero Section */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-4">
        
        {/* Subtle top hairline highlight */}
        <div className="h-px w-full max-w-3xl mx-auto bg-gradient-to-r from-transparent via-[#B0E4CC]/30 to-transparent mb-8"></div>

        {/* Engine Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#122A23] border border-[#285A48] text-[#B0E4CC] text-xs font-mono tracking-wider mb-6 select-none shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B0E4CC] animate-pulse"></span>
          <span>NEXORA ML ENGINE v1.0 • UNSUPERVISED DISCOVERY</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.12] max-w-4xl mx-auto">
          Pattern discovery for <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#B0E4CC] via-[#75C4A8] to-[#FFFFFF] bg-clip-text text-transparent">
            complex tabular data.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-[#9EC4B5] max-w-2xl mx-auto leading-relaxed font-normal">
          Detect natural customer cohorts, isolate multivariate anomalies, and map high-dimensional relationships with Scikit-learn models. Deterministic, validated statistics with zero hallucinations.
        </p>

        {/* CTA Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={() => setActiveTab('upload')}
            className="btn-primary text-sm px-6 py-3 shadow-lg font-bold"
          >
            <span>Ingest Dataset</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleQuickStart('customer_segments')}
            disabled={loadingSample}
            className="btn-secondary text-sm px-6 py-3 shadow-sm font-semibold"
          >
            <Database className="w-4 h-4 text-[#B0E4CC]" />
            <span>{loadingSample ? 'Spinning Up Runtime...' : 'Load Sample: Customer Segments'}</span>
          </button>
        </div>

        {sampleError && (
          <div className="mt-4 p-3 max-w-md mx-auto rounded-lg bg-[#3B1922] border border-[#9E354F] text-[#FF859F] text-xs font-bold">
            {sampleError}
          </div>
        )}

        {/* Technical Capabilities Ticker */}
        <div className="mt-12 pt-6 border-t border-[#1C3D32] grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
          <div className="p-2.5 rounded-lg bg-[#0C1A17] border border-[#1E4438]">
            <div className="text-[10px] font-mono text-[#82AFA0] uppercase">Clustering</div>
            <div className="text-xs font-bold text-white mt-0.5">K-Means (Auto k)</div>
            <div className="text-[10px] text-[#639684]">Silhouette Validation</div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0C1A17] border border-[#1E4438]">
            <div className="text-[10px] font-mono text-[#82AFA0] uppercase">Density</div>
            <div className="text-xs font-bold text-white mt-0.5">DBSCAN Spatial</div>
            <div className="text-[10px] text-[#639684]">Arbitrary Shapes & Noise</div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0C1A17] border border-[#1E4438]">
            <div className="text-[10px] font-mono text-[#82AFA0] uppercase">Outliers</div>
            <div className="text-xs font-bold text-white mt-0.5">Isolation Forest</div>
            <div className="text-[10px] text-[#FF859F]">Z-Score Attribution</div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0C1A17] border border-[#1E4438]">
            <div className="text-[10px] font-mono text-[#82AFA0] uppercase">Projection</div>
            <div className="text-xs font-bold text-white mt-0.5">2D / 3D PCA</div>
            <div className="text-[10px] text-[#639684]">Cumulative Variance</div>
          </div>
        </div>

        {/* Interactive Studio Preview Frame */}
        <div className="mt-14 text-left">
          <div className="nexora-panel overflow-hidden border border-[#285A48]/80 shadow-2xl max-w-4xl mx-auto">
            
            {/* Terminal Top Bar */}
            <div className="bg-[#0B1A16] px-4 py-2.5 border-b border-[#1E4438] flex items-center justify-between text-xs select-none">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#20473B]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#20473B]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#20473B]"></span>
                </div>
                <span className="text-[#82B3A1] font-mono text-[11px] ml-2">
                  studio/preview: customer_segments.csv (200 records, 4 dimensions)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#16382F] text-[#B0E4CC] border border-[#285A48]">
                  StandardScaler: Active
                </span>
              </div>
            </div>

            {/* Interactive Split Work Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#1E4438]">
              
              {/* Left Column: Interactive Cohort Switcher */}
              <div className="p-4 bg-[#091513] space-y-3 select-none">
                <div className="text-[11px] font-mono text-[#82AFA0] uppercase font-bold tracking-wider">
                  Interactive Cohort Filter
                </div>
                <div className="space-y-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveDemoCluster('all')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                      activeDemoCluster === 'all'
                        ? 'bg-[#183B30] text-[#B0E4CC] border-[#408A71]'
                        : 'text-[#82B3A1] border-transparent hover:bg-[#122A23]'
                    }`}
                  >
                    <span>All Observations (200 records)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveDemoCluster('0')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center justify-between ${
                      activeDemoCluster === '0'
                        ? 'bg-[#183B30] text-[#B0E4CC] border-[#408A71]'
                        : 'text-[#82B3A1] border-transparent hover:bg-[#122A23]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#B0E4CC]"></span>
                      <span>Cohort 1: High Income Savers</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#558776]">32%</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveDemoCluster('1')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center justify-between ${
                      activeDemoCluster === '1'
                        ? 'bg-[#183B30] text-[#B0E4CC] border-[#408A71]'
                        : 'text-[#82B3A1] border-transparent hover:bg-[#122A23]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#408A71]"></span>
                      <span>Cohort 2: Emerging Shoppers</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#558776]">41%</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveDemoCluster('2')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center justify-between ${
                      activeDemoCluster === '2'
                        ? 'bg-[#183B30] text-[#B0E4CC] border-[#408A71]'
                        : 'text-[#82B3A1] border-transparent hover:bg-[#122A23]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#285A48]"></span>
                      <span>Cohort 3: Mainstream Base</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#558776]">27%</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveDemoCluster('anomalies')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center justify-between ${
                      activeDemoCluster === 'anomalies'
                        ? 'bg-[#2E151C] text-[#FFA3B4] border-[#6E2437]'
                        : 'text-[#FFA3B4]/70 border-transparent hover:bg-[#201317]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#FF6B8B]"></span>
                      <span>Multivariate Outliers</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#FFA3B4]">14 pts</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-[#1E4438] text-[11px] font-mono space-y-1 text-[#82AFA0]">
                  <div className="flex justify-between">
                    <span>Silhouette Score</span>
                    <span className="text-[#B0E4CC] font-bold">0.842</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Explained Variance</span>
                    <span className="text-[#B0E4CC] font-bold">87.4%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contamination</span>
                    <span className="text-[#FFA3B4] font-bold">5.0%</span>
                  </div>
                </div>
              </div>

              {/* Center / Right: Interactive Scatter Canvas */}
              <div className="md:col-span-2 p-4 bg-[#081210] relative flex flex-col justify-between">
                <div className="flex justify-between items-center text-[10px] font-mono text-[#82AFA0] select-none">
                  <span>PCA Dimension Reduction: 2D Projection Space</span>
                  <span className="text-[#B0E4CC]">Hover point for metrics</span>
                </div>

                {/* SVG Coordinate Space */}
                <div className="relative w-full h-56 my-2">
                  <svg viewBox="0 0 400 260" className="w-full h-full">
                    {/* Grid Lines */}
                    <line x1="40" y1="230" x2="380" y2="230" stroke="#16382F" strokeWidth="1" />
                    <line x1="40" y1="30" x2="40" y2="230" stroke="#16382F" strokeWidth="1" />
                    <line x1="40" y1="130" x2="380" y2="130" stroke="#122E26" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="210" y1="30" x2="210" y2="230" stroke="#122E26" strokeWidth="1" strokeDasharray="3 3" />
                    
                    {/* Axis Labels */}
                    <text x="360" y="245" fill="#4E7E6F" fontSize="10" fontFamily="monospace">PC1</text>
                    <text x="20" y="40" fill="#4E7E6F" fontSize="10" fontFamily="monospace">PC2</text>

                    {/* Plotted Observations */}
                    {filteredDemoPoints.map((pt) => {
                      const color = pt.isAnomaly 
                        ? '#FF6B8B' 
                        : pt.cluster === 0 
                          ? '#B0E4CC' 
                          : pt.cluster === 1 
                            ? '#408A71' 
                            : '#285A48';
                      return (
                        <circle
                          key={pt.id}
                          cx={pt.pc1}
                          cy={pt.pc2}
                          r={pt.isAnomaly ? 5 : 4.5}
                          fill={color}
                          stroke="#081210"
                          strokeWidth="1.5"
                          className="cursor-pointer transition-transform hover:scale-150"
                          onMouseEnter={() => setHoveredPoint(pt)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      );
                    })}
                  </svg>

                  {/* Dynamic Tooltip on Hover */}
                  {hoveredPoint && (
                    <div className="absolute top-2 right-2 bg-[#0E201B] p-2.5 rounded-lg border border-[#408A71] text-xs shadow-xl space-y-0.5 pointer-events-none">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hoveredPoint.isAnomaly ? '#FF6B8B' : '#B0E4CC' }}></span>
                        <span>{hoveredPoint.label}</span>
                      </div>
                      {hoveredPoint.isAnomaly ? (
                        <div className="text-[11px] text-[#FFA3B4] font-mono">
                          {hoveredPoint.reason}
                        </div>
                      ) : (
                        <div className="text-[11px] text-[#9EC4B5] font-mono">
                          Income: {hoveredPoint.income} • Spend: {hoveredPoint.spend} (Age {hoveredPoint.age})
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Console Ticker */}
                <div className="text-[11px] font-mono text-[#82B3A1] border-t border-[#16382F] pt-2 flex items-center justify-between">
                  <span className="truncate">
                    $ nexora scan --dataset customer_segments.csv --k 3
                  </span>
                  <span className="text-[#B0E4CC] font-bold flex-shrink-0 ml-2">100% converged</span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </section>

      {/* Algorithmic Architecture Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#122A23] text-[#B0E4CC] border border-[#285A48]">
            Pipeline Architecture
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-black text-white tracking-tight">
            How Nexora Processes Unlabeled Data
          </h2>
          <p className="mt-2 text-sm text-[#9EC4B5] font-medium">
            Four deterministic mathematical stages executed directly in Python.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="nexora-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#408A71]">STAGE 01</span>
              <Database className="w-4 h-4 text-[#B0E4CC]" />
            </div>
            <h3 className="text-sm font-bold text-white">Ingestion & Schema Check</h3>
            <p className="text-xs text-[#82AFA0] leading-relaxed">
              Streams CSV and Excel tables, validates header data types, and imputes sparse numerical missing values.
            </p>
          </div>

          <div className="nexora-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#408A71]">STAGE 02</span>
              <Sliders className="w-4 h-4 text-[#B0E4CC]" />
            </div>
            <h3 className="text-sm font-bold text-white">Normalization</h3>
            <p className="text-xs text-[#82AFA0] leading-relaxed">
              Applies StandardScaler (zero mean, unit variance) or RobustScaler (median, IQR) to equalize multi-scale attributes.
            </p>
          </div>

          <div className="nexora-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#408A71]">STAGE 03</span>
              <Cpu className="w-4 h-4 text-[#B0E4CC]" />
            </div>
            <h3 className="text-sm font-bold text-white">Multi-Engine Execution</h3>
            <p className="text-xs text-[#82AFA0] leading-relaxed">
              Executes K-Means centroid clustering, DBSCAN spatial density segmentation, and Isolation Forest anomaly trees in parallel.
            </p>
          </div>

          <div className="nexora-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#408A71]">STAGE 04</span>
              <BarChart2 className="w-4 h-4 text-[#B0E4CC]" />
            </div>
            <h3 className="text-sm font-bold text-white">Attribution & Projections</h3>
            <p className="text-xs text-[#82AFA0] leading-relaxed">
              Calculates 2D/3D PCA eigenvectors, scores cluster separation via Silhouette/Davies-Bouldin, and writes plain-English root causes.
            </p>
          </div>
        </div>
      </section>

      {/* Concrete Analytical Dossier Showcase */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="nexora-panel p-6 sm:p-10 space-y-8">
          
          <div>
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#122A23] text-[#B0E4CC] border border-[#285A48]">
              Sample Discoveries
            </span>
            <h2 className="mt-3 text-2xl font-black text-white tracking-tight">
              Grounded Discoveries With Exact Mathematical Proofs
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#9EC4B5] font-medium">
              Every identified pattern comes with measurable statistical differences against the population baseline.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Dossier 1: Cluster Analysis */}
            <div className="p-5 rounded-xl bg-[#081311] border border-[#1E4438] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#16382F] text-[#B0E4CC] border border-[#285A48]">
                  Cohort Pattern: Affluent Savers
                </span>
                <span className="text-xs font-mono text-[#82AFA0]">Cohort Size: 32% (64 rows)</span>
              </div>

              {/* Mini Numerical Comparison Table */}
              <div className="border border-[#1E4438] rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left font-mono">
                  <thead className="bg-[#0C1A17] text-[#82AFA0] text-[10px] uppercase border-b border-[#1E4438]">
                    <tr>
                      <th className="p-2">Feature</th>
                      <th className="p-2">Dataset Avg</th>
                      <th className="p-2">Cohort Avg</th>
                      <th className="p-2 text-right">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#16382F] text-[11px]">
                    <tr>
                      <td className="p-2 text-white">Annual Income</td>
                      <td className="p-2 text-[#82AFA0]">$60,500</td>
                      <td className="p-2 text-[#B0E4CC] font-bold">$105,000</td>
                      <td className="p-2 text-right text-[#B0E4CC] font-bold">+54.2%</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-white">Spending Score</td>
                      <td className="p-2 text-[#82AFA0]">50.2 / 100</td>
                      <td className="p-2 text-[#82AFA0]">27.6 / 100</td>
                      <td className="p-2 text-right text-[#82AFA0] font-bold">-45.0%</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-white">Customer Age</td>
                      <td className="p-2 text-[#82AFA0]">38.8 yrs</td>
                      <td className="p-2 text-white">49.6 yrs</td>
                      <td className="p-2 text-right text-white">+27.8%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[#82AFA0] font-mono">Silhouette Score: <strong className="text-[#B0E4CC]">0.842</strong></span>
                <button
                  onClick={() => handleQuickStart('customer_segments')}
                  className="text-[#B0E4CC] hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore Dataset</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Dossier 2: Anomaly Root Cause */}
            <div className="p-5 rounded-xl bg-[#081311] border border-[#1E4438] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#2D161C] text-[#FFA3B4] border border-[#522530]">
                  Isolation Forest Anomaly: Machine MCH-04
                </span>
                <span className="text-xs font-mono text-[#FFA3B4]">Severity: 94.2%</span>
              </div>

              {/* Mini Anomaly Attribution Table */}
              <div className="border border-[#1E4438] rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left font-mono">
                  <thead className="bg-[#0C1A17] text-[#82AFA0] text-[10px] uppercase border-b border-[#1E4438]">
                    <tr>
                      <th className="p-2">Sensor Feature</th>
                      <th className="p-2">Expected (μ)</th>
                      <th className="p-2">Observed</th>
                      <th className="p-2 text-right">Z-Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#16382F] text-[11px]">
                    <tr>
                      <td className="p-2 text-white">Operating Temp</td>
                      <td className="p-2 text-[#82AFA0]">68.2 °C</td>
                      <td className="p-2 text-[#FFA3B4] font-bold">104.5 °C</td>
                      <td className="p-2 text-right text-[#FFA3B4] font-bold">+3.92σ</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-white">Vibration Level</td>
                      <td className="p-2 text-[#82AFA0]">1.80 mm/s</td>
                      <td className="p-2 text-[#FFA3B4] font-bold">6.20 mm/s</td>
                      <td className="p-2 text-right text-[#FFA3B4] font-bold">+3.45σ</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-white">Line Pressure</td>
                      <td className="p-2 text-[#82AFA0]">4.2 bar</td>
                      <td className="p-2 text-white">4.1 bar</td>
                      <td className="p-2 text-right text-[#82AFA0]">-0.12σ</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[#82AFA0] font-mono">Statistical Flag: <strong className="text-[#FFA3B4]">Multivariate Spike</strong></span>
                <button
                  onClick={() => handleQuickStart('sensor_anomalies')}
                  className="text-[#B0E4CC] hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore Dataset</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Technical Specifications Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-[#1C3D32] pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white text-sm font-bold">
              <ShieldCheck className="w-4 h-4 text-[#B0E4CC]" />
              <span>Deterministic Computation</span>
            </div>
            <p className="text-xs text-[#82AFA0] leading-relaxed">
              Every score, centroid, and eigenvector is computed directly by Scikit-learn on local Python runtime. No generative models or prompt wrappers.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white text-sm font-bold">
              <CheckCircle2 className="w-4 h-4 text-[#B0E4CC]" />
              <span>Attribution Transparency</span>
            </div>
            <p className="text-xs text-[#82AFA0] leading-relaxed">
              Anomalies indicate the exact feature Z-score deviations responsible for outlier detection, eliminating opaque black-box flags.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white text-sm font-bold">
              <BarChart2 className="w-4 h-4 text-[#B0E4CC]" />
              <span>PDF & CSV Audit Exports</span>
            </div>
            <p className="text-xs text-[#82AFA0] leading-relaxed">
              Download formatted stakeholder reports and anomaly tables directly for compliance and business presentations.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
