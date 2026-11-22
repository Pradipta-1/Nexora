import React from 'react';
import { Sparkles, Shield } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  return (
    <footer className="mt-20 border-t-2 border-[#285A48] bg-[#0B1815] text-[#82AFA0] text-sm shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#285A48] to-[#408A71] flex items-center justify-center text-[#B0E4CC] shadow-sm border border-[#B0E4CC]/30">
                <Sparkles className="w-4 h-4 fill-current" />
              </div>
              <span className="text-base font-extrabold text-white tracking-tight">Nexora</span>
              <span className="text-xs text-[#B0E4CC] font-bold italic">— Discover Beyond the Obvious.</span>
            </div>
            <p className="text-xs text-[#9EC4B5] max-w-md leading-relaxed font-medium">
              Unsupervised machine learning platform for automated hidden pattern discovery, 
              density clustering, multivariate anomaly detection, and explainable data intelligence.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#B0E4CC] pt-2 font-bold">
              <Shield className="w-4 h-4 text-[#B0E4CC]" />
              <span>Grounded in mathematical statistics. Zero fabricated insights.</span>
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#B0E4CC] mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-white transition-colors cursor-pointer text-[#9EC4B5]">
                  Overview Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('upload')} className="hover:text-white transition-colors cursor-pointer text-[#9EC4B5]">
                  Dataset Upload & Preview
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('profiler')} className="hover:text-white transition-colors cursor-pointer text-[#9EC4B5]">
                  Automated Data Profiler
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('studio')} className="hover:text-white transition-colors cursor-pointer text-[#9EC4B5]">
                  ML Discovery Studio
                </button>
              </li>
            </ul>
          </div>

          {/* Algorithms */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#B0E4CC] mb-3">
              Core ML Engines
            </h4>
            <ul className="space-y-2 text-xs text-[#9EC4B5] font-medium">
              <li>K-Means Clustering + Silhouette</li>
              <li>DBSCAN Density & Noise Isolation</li>
              <li>Isolation Forest Outlier Scoring</li>
              <li>2D / 3D PCA Dimension Projection</li>
              <li>Pearson & Spearman Correlation</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#285A48]/50 flex flex-col sm:flex-row items-center justify-between text-xs text-[#82AFA0] gap-4 font-medium">
          <p>© {new Date().getFullYear()} Nexora. All rights reserved.</p>
          <p className="flex items-center gap-1 text-[#B0E4CC] font-semibold">
            Powered by Python FastAPI, Scikit-learn & React.
          </p>
        </div>
      </div>
    </footer>
  );
}
