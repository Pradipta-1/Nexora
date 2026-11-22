import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Layers, 
  AlertTriangle, 
  GitFork, 
  FileSearch, 
  Sliders, 
  TrendingUp, 
  Database, 
  BarChart2, 
  ChevronRight 
} from 'lucide-react';
import { datasetApi } from '../services/datasetApi';

export default function LandingPage({ setActiveTab, setSelectedDatasetId }) {
  const [loadingSample, setLoadingSample] = useState(false);
  const [sampleError, setSampleError] = useState(null);

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

  return (
    <div className="space-y-20 py-8">
      
      {/* Hero Section */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-10 pb-6 overflow-hidden">
        
        {/* Ambient Dark Forest & Mint Glows */}
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[320px] bg-[#285A48]/35 rounded-full blur-[110px] pointer-events-none -z-10"></div>
        <div className="absolute top-1/3 right-1/4 w-[420px] h-[260px] bg-[#408A71]/30 rounded-full blur-[100px] pointer-events-none -z-10"></div>
        <div className="absolute top-2/3 right-1/3 w-[300px] h-[200px] bg-[#B0E4CC]/10 rounded-full blur-[90px] pointer-events-none -z-10"></div>
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#122A23] border border-[#408A71] text-[#B0E4CC] text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#B0E4CC]" />
          <span>AI-Powered Hidden Pattern Discovery Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Discover <span className="bg-gradient-to-r from-[#B0E4CC] via-[#6CB299] to-[#FFFFFF] bg-clip-text text-transparent">Beyond the Obvious.</span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-[#9EC4B5] max-w-2xl mx-auto leading-relaxed font-medium">
          Uncover the hidden patterns, clustered cohorts, multivariate anomalies, and subtle statistical relationships in your datasets that traditional dashboards overlook.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setActiveTab('upload')}
            className="btn-primary text-base px-8 py-3.5 shadow-lg font-bold"
          >
            <span>Start Discovering</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleQuickStart('customer_segments')}
            disabled={loadingSample}
            className="btn-secondary text-sm px-6 py-3.5 shadow-sm font-semibold"
          >
            <Database className="w-4 h-4 text-[#B0E4CC]" />
            <span>{loadingSample ? 'Loading Curated Data...' : 'Explore Customer Segments Demo'}</span>
          </button>
        </div>

        {sampleError && (
          <div className="mt-4 p-3 max-w-md mx-auto rounded-lg bg-[#3B1922] border border-[#9E354F] text-[#FF859F] text-xs font-bold">
            {sampleError}
          </div>
        )}

        {/* Quick Highlights Bar */}
        <div className="mt-14 pt-8 border-t border-[#285A48]/50 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#132B25] text-[#B0E4CC] border border-[#285A48] shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">K-Means & DBSCAN</div>
              <div className="text-xs text-[#82AFA0] font-medium">Validated Clusters</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#132B25] text-[#B0E4CC] border border-[#285A48] shadow-sm">
              <AlertTriangle className="w-5 h-5 text-[#FF859F]" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Isolation Forest</div>
              <div className="text-xs text-[#82AFA0] font-medium">Anomaly Attribution</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#132B25] text-[#B0E4CC] border border-[#285A48] shadow-sm">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">2D / 3D PCA</div>
              <div className="text-xs text-[#82AFA0] font-medium">Dimension Reduction</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#132B25] text-[#B0E4CC] border border-[#285A48] shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Correlation</div>
              <div className="text-xs text-[#82AFA0] font-medium">Pearson & Spearman</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#122A23] text-[#B0E4CC] border border-[#408A71]">
            Intelligent Pipeline
          </span>
          <h2 className="mt-3 text-3xl font-black text-white tracking-tight">
            How Nexora Uncovers The Unseen
          </h2>
          <p className="mt-2 text-sm text-[#9EC4B5] font-medium">
            A reliable 4-step pipeline that transforms raw tabular records into mathematically grounded intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Upload Dataset',
              desc: 'Drag & drop any standard CSV or Excel file. Automatic validation checks formats, size, and integrity.',
              icon: Database
            },
            {
              step: '02',
              title: 'Automated Profiling',
              desc: 'Inspect types, missing counts, standard deviations, distributions, and correlation matrices instantly.',
              icon: FileSearch
            },
            {
              step: '03',
              title: 'Unsupervised ML',
              desc: 'Execute real K-Means, DBSCAN density segmentation, and Isolation Forest anomaly algorithms with Scikit-learn.',
              icon: Sliders
            },
            {
              step: '04',
              title: 'Grounded Insights',
              desc: 'Receive mathematically supported explanations, 2D/3D PCA plots, and downloadable PDF reports.',
              icon: BarChart2
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="nexora-card p-6 relative group">
                <div className="text-3xl font-black text-[#408A71] group-hover:text-[#B0E4CC] transition-colors mb-4 font-mono">
                  {item.step}
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#16362D] flex items-center justify-center text-[#B0E4CC] mb-4 border border-[#408A71] shadow-sm">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-[#9EC4B5] leading-relaxed font-medium">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Sample Discovery Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="nexora-panel p-8 sm:p-12 relative overflow-hidden">
          
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#16382F] text-[#B0E4CC] border border-[#408A71]">
              Concrete Analytical Results
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-black text-white tracking-tight">
              Real Discoveries, Plain English Explanations
            </h2>
            <p className="mt-2 text-sm text-[#9EC4B5] font-medium leading-relaxed">
              Nexora extracts mathematical clusters and unusual records, then translates numerical divergences into understandable explanations backed by exact numbers.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Sample Discovery Card 1 (Cluster Card) */}
            <div className="p-6 rounded-2xl bg-[#0E1F1B] border-2 border-[#285A48] space-y-4 shadow-sm hover:border-[#408A71] transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-3 py-1 rounded-md bg-[#16382F] text-[#B0E4CC] border border-[#408A71]">
                  K-Means Discovered Cluster
                </span>
                <span className="text-xs text-[#82AFA0] font-semibold">Cohort Size: 80 records (32%)</span>
              </div>
              <h4 className="text-base font-bold text-white">
                Affluent Savers: High Income, Conservative Spending
              </h4>
              <p className="text-xs text-[#9EC4B5] leading-relaxed font-medium">
                Identified a distinct cohort of mature customers (average age 50) earning $105,000/yr (54% higher than average), but spending only $30 score (45% lower than average).
              </p>
              <div className="pt-3 border-t border-[#285A48]/50 flex items-center justify-between text-xs">
                <span className="text-[#82AFA0]">Silhouette Score: <strong className="text-[#B0E4CC] font-black">0.842</strong></span>
                <button 
                  onClick={() => handleQuickStart('customer_segments')}
                  className="text-[#B0E4CC] hover:text-white font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Explore Dataset</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sample Discovery Card 2 (Anomaly Card) */}
            <div className="p-6 rounded-2xl bg-[#142320] border-2 border-[#408A71] space-y-4 shadow-sm hover:border-[#B0E4CC] transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-3 py-1 rounded-md bg-[#3B1922] text-[#FF859F] border border-[#9E354F]">
                  Isolation Forest Anomaly
                </span>
                <span className="text-xs text-[#82AFA0] font-semibold">Anomaly Severity: 94.2%</span>
              </div>
              <h4 className="text-base font-bold text-white">
                Equipment Distress: Thermal & Vibration Spike
              </h4>
              <p className="text-xs text-[#9EC4B5] leading-relaxed font-medium">
                Sensor reading flagged: Machine MCH-04 exhibited 104°C operating temperature (3.9 std deviations above normal) alongside sudden 6.2 mm/s vibration spike.
              </p>
              <div className="pt-3 border-t border-[#285A48]/50 flex items-center justify-between text-xs">
                <span className="text-[#82AFA0]">Flagged Cause: <strong className="text-[#FF859F] font-black">3.9σ Deviation</strong></span>
                <button 
                  onClick={() => handleQuickStart('sensor_anomalies')}
                  className="text-[#B0E4CC] hover:text-white font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Explore Dataset</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* About Project Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
        <h2 className="text-2xl font-bold text-white">Engineered For Truthful Data Discovery</h2>
        <p className="text-sm text-[#9EC4B5] font-medium leading-relaxed max-w-2xl mx-auto">
          Nexora is built on an uncompromising principle: every reported pattern, cluster, and anomaly must be mathematically computed from real data records. We avoid hallucinated findings and remind users that correlation is not causation.
        </p>
        <div className="pt-2 flex justify-center">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="btn-secondary text-xs px-6 py-2.5"
          >
            <span>Open Application Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

    </div>
  );
}
