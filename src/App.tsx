import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import LeadProfile from './components/LeadProfile';
import { ConfigProvider } from './contexts/ConfigContext';
import type { Lead, RecommendationSuggestion } from './types';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<RecommendationSuggestion | null>(null);

  const handleLeadSelect = (lead: Lead, suggestion?: RecommendationSuggestion) => {
    setSelectedLead(lead);
    setSelectedSuggestion(suggestion ?? null);
  };

  const handleBackToDashboard = () => {
    setSelectedLead(null);
    setSelectedSuggestion(null);
  };

  const renderMainContent = () => {
    if (selectedLead) {
      return (
        <LeadProfile
          lead={selectedLead}
          onBack={handleBackToDashboard}
          suggestion={selectedSuggestion}
        />
      );
    }

    switch (activeView) {
      case 'dashboard':
        return <Dashboard onLeadSelect={handleLeadSelect} />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onLeadSelect={handleLeadSelect} />;
    }
  };

  return (
    <ConfigProvider>
      <div className="min-h-screen bg-gray-900">
        <Navbar activeView={activeView} onViewChange={setActiveView} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderMainContent()}
        </main>
      </div>
    </ConfigProvider>
  );
}

export default App;