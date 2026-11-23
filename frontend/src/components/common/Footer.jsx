import React from 'react';
import { Shield, Terminal, Cpu, Database, Activity } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  return (
    <footer className="mt-20 border-t border-[#285A48]/80 bg-[#07110F] text-[#82AFA0] text-sm select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              {/* Connected Coordinate Lattice SVG */}
              <div className="w-7 h-7 rounded-lg bg-[#16382F] flex items-center justify-center text-[#B0E4CC] border border-[#408A71]/50 p-1">
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                  <circle cx="6" cy="6" r="2.5" fill="#B0E4CC" />
                  <circle cx="18" cy="6" r="2.5" fill="#B0E4CC" />
                  <circle cx="12" cy="18" r="2.5" fill="#408A71" />
                  <path d="M6 6L18 6M6 6L12 18M18 6L12 18" stroke="#B0E4CC" strokeWidth="1.5" strokeDasharray="2 1.5" />
                </svg>
              </div>
              <span className="text-base font-black text-white tracking-tight">Nexora</span>
              <span className="text-xs font-mono text-[#408A71] font-semibold">// STATISTICAL DISCOVERY KERNEL</span>
            </div>
            <p className="text-xs text-[#9EC4B5] max-w-md leading-relaxed font-normal">
              High-throughput tabular pattern discovery engine. Automated density clustering, 
              multivariate anomaly isolation, and orthogonal projection for tabular datasets.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#8FBBA9] pt-2 font-mono">
              <Shield className="w-3.5 h-3.5 text-[#B0E4CC]" />
              <span>Deterministically verified via Scikit-learn 1.4 & SciPy.</span>
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#B0E4CC] mb-3">
              Workstation Navigation
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-white transition-colors cursor-pointer text-[#9EC4B5] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#408A71]" />
                  Telemetry Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('upload')} className="hover:text-white transition-colors cursor-pointer text-[#9EC4B5] flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#408A71]" />
                  Dataset Ingestion Terminal
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('profiler')} className="hover:text-white transition-colors cursor-pointer text-[#9EC4B5] flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#408A71]" />
                  Automated Data Profiler
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('studio')} className="hover:text-white transition-colors cursor-pointer text-[#9EC4B5] flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#408A71]" />
                  ML Discovery Studio
                </button>
              </li>
            </ul>
          </div>

          {/* Algorithms */}
          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#B0E4CC] mb-3">
              Execution Primitives
            </h4>
            <ul className="space-y-1.5 text-xs font-mono text-[#9EC4B5]">
              <li>• K-Means (Lloyd / Elkan)</li>
              <li>• DBSCAN (kd-tree index)</li>
              <li>• Isolation Forest (iTree ensemble)</li>
              <li>• SVD / PCA Dimensionality</li>
              <li>• Spearman Rank Covariance</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#285A48]/40 flex flex-col sm:flex-row items-center justify-between text-xs text-[#82AFA0] gap-4 font-mono">
          <p>© {new Date().getFullYear()} Nexora Engineering. Local Workstation.</p>
          <div className="flex items-center gap-3 text-[11px] text-[#8FBBA9]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B0E4CC]"></span>
              FastAPI 0.110
            </span>
            <span>•</span>
            <span>React 18</span>
            <span>•</span>
            <span>Vite HMR</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
