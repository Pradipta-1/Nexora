import React from 'react';
import { 
  Home,
  LayoutDashboard, 
  UploadCloud, 
  BarChart3, 
  Cpu, 
  FileText,
  ArrowRight
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload', icon: UploadCloud },
    { id: 'profiler', label: 'Profiler', icon: BarChart3 },
    { id: 'studio', label: 'ML Studio', icon: Cpu },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#091413]/95 backdrop-blur-md border-b border-[#285A48]/80 shadow-lg select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0"
          >
            {/* Custom Connected Nodes Constellation Icon */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#16382F] via-[#285A48] to-[#408A71] flex items-center justify-center shadow-md group-hover:scale-105 group-active:scale-95 transition-transform duration-150 border border-[#B0E4CC]/40 p-1.5 flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                <circle cx="6" cy="7" r="2.5" fill="#B0E4CC" />
                <circle cx="18" cy="6" r="2.5" fill="#B0E4CC" />
                <circle cx="13" cy="18" r="2.5" fill="#408A71" />
                <circle cx="7" cy="15" r="1.8" fill="#B0E4CC" opacity="0.9" />
                <path d="M6 7L18 6M6 7L7 15M7 15L13 18M18 6L13 18" stroke="#B0E4CC" strokeWidth="1.5" strokeDasharray="2 1.5" />
              </svg>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-lg lg:text-xl font-black tracking-tight text-white group-hover:text-[#B0E4CC] transition-colors whitespace-nowrap">
                Nexora
              </span>
              <span className="hidden xl:inline-flex text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#16382F] text-[#B0E4CC] border border-[#408A71]">
                v1.0
              </span>
            </div>
          </div>

          {/* Desktop Navigation Segmented Bar - Single Line, Never Wraps, Never Overlaps */}
          <nav className="hidden md:flex items-center bg-[#0D201B]/90 p-1 rounded-xl border border-[#234C40] shadow-inner flex-shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  type="button"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors duration-150 active:scale-[0.97] border ${
                    isActive
                      ? 'bg-[#285A48] text-[#B0E4CC] border-[#408A71] shadow-sm font-bold'
                      : 'text-[#8FBBA9] hover:text-white hover:bg-[#16382F]/60 border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 flex-shrink-0 transition-colors ${isActive ? 'text-[#B0E4CC]' : 'text-[#649986]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Status & Action */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* Live System Indicator (Visible only on extra-wide screens) */}
            <div className="hidden 2xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#122923] border border-[#285A48] text-xs font-semibold text-[#B0E4CC] whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B0E4CC] shadow-[0_0_6px_#B0E4CC] animate-pulse"></span>
              <span>FastAPI Ready</span>
            </div>

            {/* Quick Ingest Action Button */}
            <button
              onClick={() => setActiveTab('upload')}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#B0E4CC] text-[#091413] text-xs font-black hover:bg-[#C9EFE0] active:scale-[0.96] transition-all duration-100 shadow-sm cursor-pointer whitespace-nowrap"
            >
              <span>Ingest Data</span>
              <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex overflow-x-auto px-3 py-1.5 border-t border-[#285A48]/70 gap-1 scrollbar-none bg-[#0B1815]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              type="button"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors duration-150 active:scale-[0.96] border ${
                isActive
                  ? 'bg-[#285A48] text-[#B0E4CC] border-[#408A71] shadow-sm font-bold'
                  : 'text-[#8FBBA9] bg-[#0E201B] hover:bg-[#16362D] border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
