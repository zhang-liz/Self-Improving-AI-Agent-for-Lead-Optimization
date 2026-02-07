import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import LeadProfile from './components/LeadProfile';
import type { Lead } from './types';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleLeadSelect = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleBackToDashboard = () => {
    setSelectedLead(null);
  };

  const renderMainContent = () => {
    if (selectedLead) {
      return <LeadProfile lead={selectedLead} onBack={handleBackToDashboard} />;
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
    <div className="min-h-screen bg-gray-900">
      <Navbar activeView={activeView} onViewChange={setActiveView} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderMainContent()}
      </main>
    </div>
  );
}

export default App;