import React from 'react';
import { 
  Sparkles, 
  LayoutDashboard, 
  UploadCloud, 
  BarChart3, 
  Cpu, 
  FileText
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'landing', label: 'Home', icon: Sparkles },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload Dataset', icon: UploadCloud },
    { id: 'profiler', label: 'Data Profiler', icon: BarChart3 },
    { id: 'studio', label: 'ML Discovery Studio', icon: Cpu },
    { id: 'reports', label: 'Reports & Compare', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#091413]/95 backdrop-blur-md border-b-2 border-[#285A48] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#285A48] via-[#35745D] to-[#408A71] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200 border border-[#B0E4CC]/40">
              <Sparkles className="w-5 h-5 text-[#B0E4CC]" />
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
              <p className="text-[11px] text-[#82AFA0] font-semibold hidden sm:block">
                Discover Beyond the Obvious.
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#B0E4CC] text-[#091413] border border-[#B0E4CC] shadow-md'
                      : 'text-[#9EC4B5] hover:text-white hover:bg-[#16362D]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#091413]' : 'text-[#5D9280]'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Live System Indicator */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#122923] border border-[#285A48] text-xs font-bold text-[#B0E4CC]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B0E4CC] shadow-[0_0_8px_#B0E4CC] animate-pulse"></span>
              <span>FastAPI & ML Engine Ready</span>
            </div>
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#B0E4CC] text-[#091413]'
                  : 'text-[#9EC4B5] bg-[#0E201B] hover:bg-[#16362D]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
