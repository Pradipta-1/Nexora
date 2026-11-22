import React from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  BarChart3, 
  Cpu, 
  FileText,
  Home,
  ArrowRight
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload Data', icon: UploadCloud },
    { id: 'profiler', label: 'Data Profiler', icon: BarChart3 },
    { id: 'studio', label: 'ML Studio', icon: Cpu },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#091413]/95 backdrop-blur-md border-b-2 border-[#285A48] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 cursor-pointer group select-none flex-shrink-0"
          >
            {/* Custom Connected Nodes Discovery Logo */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#16382F] via-[#285A48] to-[#408A71] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200 border border-[#B0E4CC]/40 p-2">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                <circle cx="6" cy="7" r="2.5" fill="#B0E4CC" />
                <circle cx="18" cy="6" r="2.5" fill="#B0E4CC" />
                <circle cx="13" cy="18" r="2.5" fill="#408A71" />
                <circle cx="7" cy="15" r="1.8" fill="#B0E4CC" opacity="0.9" />
                <path d="M6 7L18 6M6 7L7 15M7 15L13 18M18 6L13 18" stroke="#B0E4CC" strokeWidth="1.5" strokeDasharray="2 1.5" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white group-hover:text-[#B0E4CC] transition-colors">
                  Nexora
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#16382F] text-[#B0E4CC] border border-[#408A71]">
                  ML Core v1.0
                </span>
              </div>
              <p className="text-[11px] text-[#82AFA0] font-semibold hidden sm:block leading-none mt-0.5">
                Discover Beyond the Obvious.
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 flex-1 justify-center max-w-2xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 lg:gap-2 px-3 py-1.5 lg:px-3.5 lg:py-2 rounded-xl text-xs lg:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#B0E4CC] text-[#091413] border border-[#B0E4CC] shadow-[0_0_15px_rgba(176,228,204,0.35)] font-black'
                      : 'text-[#9EC4B5] hover:text-white hover:bg-[#16382F]/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#091413]' : 'text-[#5D9280]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Status & Action */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* Live System Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#122923] border border-[#285A48] text-xs font-bold text-[#B0E4CC]">
              <span className="w-2 h-2 rounded-full bg-[#B0E4CC] shadow-[0_0_8px_#B0E4CC] animate-pulse"></span>
              <span className="hidden xl:inline">FastAPI & ML </span>Ready
            </div>

            {/* Quick Action Button */}
            <button
              onClick={() => setActiveTab('upload')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#B0E4CC] text-[#091413] text-xs font-black hover:bg-[#C9EFE0] transition-all shadow-md cursor-pointer"
            >
              <span>Ingest Data</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex overflow-x-auto px-4 py-2 border-t border-[#285A48] gap-1.5 scrollbar-none bg-[#0B1815]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                isActive
                  ? 'bg-[#B0E4CC] text-[#091413] font-black'
                  : 'text-[#9EC4B5] bg-[#0E201B] hover:bg-[#16362D]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
