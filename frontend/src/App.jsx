import React, { useState } from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import ProfilerPage from './pages/ProfilerPage';
import DiscoveryStudioPage from './pages/DiscoveryStudioPage';
import ReportsPage from './pages/ReportsPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null);

  return (
    <div className="min-h-screen bg-[#091413] text-[#E0F4EC] flex flex-col font-sans selection:bg-[#B0E4CC] selection:text-[#091413]">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Page Content */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage 
            setActiveTab={setActiveTab} 
            setSelectedDatasetId={setSelectedDatasetId} 
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage 
            setActiveTab={setActiveTab} 
            setSelectedDatasetId={setSelectedDatasetId}
            setSelectedAnalysisId={setSelectedAnalysisId}
          />
        )}

        {activeTab === 'upload' && (
          <UploadPage 
            setActiveTab={setActiveTab} 
            setSelectedDatasetId={setSelectedDatasetId} 
          />
        )}

        {activeTab === 'profiler' && (
          <ProfilerPage 
            selectedDatasetId={selectedDatasetId}
            setSelectedDatasetId={setSelectedDatasetId}
            selectedFeatures={selectedFeatures}
            setSelectedFeatures={setSelectedFeatures}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'studio' && (
          <DiscoveryStudioPage 
            selectedDatasetId={selectedDatasetId}
            selectedFeatures={selectedFeatures}
            selectedAnalysisId={selectedAnalysisId}
            setSelectedAnalysisId={setSelectedAnalysisId}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsPage 
            selectedAnalysisId={selectedAnalysisId}
            setSelectedAnalysisId={setSelectedAnalysisId}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
