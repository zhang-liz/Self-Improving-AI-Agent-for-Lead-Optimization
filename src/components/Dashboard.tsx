import React, { useState, useMemo } from 'react';
import { Lead, FilterOptions } from '../types';
import LeadCard from './LeadCard';
import DashboardFilters from './DashboardFilters';
import MetricsCards from './MetricsCards';
import { mockLeads, mockTeamMetrics } from '../data/mockData';
import { Search } from 'lucide-react';

interface DashboardProps {
  onLeadSelect: (lead: Lead) => void;
}

export default function Dashboard({ onLeadSelect }: DashboardProps) {
  const [leads] = useState<Lead[]>(mockLeads);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    scoreRange: [0, 100],
    stages: [],
    sources: [],
    dateRange: null,
    trend: []
  });
  const [sortBy, setSortBy] = useState<'vibeScore' | 'lastInteraction' | 'name'>('vibeScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Calculate lead temperature categories
  const hotLeads = leads.filter(lead => lead.vibeScore >= 80);
  const warmLeads = leads.filter(lead => lead.vibeScore >= 60 && lead.vibeScore < 80);
  const coldLeads = leads.filter(lead => lead.vibeScore < 60);

  const [temperatureFilter, setTemperatureFilter] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');

  const filteredAndSortedLeads = useMemo(() => {
    let filtered = leads.filter(lead => {
      // Temperature filter
      if (temperatureFilter !== 'all') {
        if (temperatureFilter === 'hot' && lead.vibeScore < 80) return false;
        if (temperatureFilter === 'warm' && (lead.vibeScore < 60 || lead.vibeScore >= 80)) return false;
        if (temperatureFilter === 'cold' && lead.vibeScore >= 60) return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!lead.name.toLowerCase().includes(searchLower) &&
            !lead.email.toLowerCase().includes(searchLower) &&
            !lead.company.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Score range filter
      if (lead.vibeScore < filters.scoreRange[0] || lead.vibeScore > filters.scoreRange[1]) {
        return false;
      }

      // Stage filter
      if (filters.stages.length > 0 && !filters.stages.includes(lead.stage)) {
        return false;
      }

      // Source filter
      if (filters.sources.length > 0 && !filters.sources.includes(lead.source)) {
        return false;
      }

      // Trend filter
      if (filters.trend.length > 0 && !filters.trend.includes(lead.trend)) {
        return false;
      }

      return true;
    });

    // Sort leads
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'vibeScore':
          aValue = a.vibeScore;
          bValue = b.vibeScore;
          break;
        case 'lastInteraction':
          aValue = a.lastInteraction.getTime();
          bValue = b.lastInteraction.getTime();
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [leads, filters, sortBy, sortOrder, temperatureFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Lead Dashboard</h1>
          <p className="text-gray-400">Monitor your lead sentiment and engagement scores in real-time</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-400">{filteredAndSortedLeads.length}</div>
          <div className="text-sm text-gray-400">Active Leads</div>
        </div>
      </div>

      {/* Metrics Cards */}
      <MetricsCards metrics={mockTeamMetrics} />

      {/* Temperature Filter */}
      <div className="flex items-center gap-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
        <span className="text-gray-300 font-medium">Lead Temperature:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setTemperatureFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              temperatureFilter === 'all'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All ({leads.length})
          </button>
          <button
            onClick={() => setTemperatureFilter('hot')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              temperatureFilter === 'hot'
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🔥 Hot ({hotLeads.length})
          </button>
          <button
            onClick={() => setTemperatureFilter('warm')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              temperatureFilter === 'warm'
                ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-500/25'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🌡️ Warm ({warmLeads.length})
          </button>
          <button
            onClick={() => setTemperatureFilter('cold')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              temperatureFilter === 'cold'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            ❄️ Cold ({coldLeads.length})
          </button>
        </div>
      </div>
      {/* Search and Sort Controls */}
      <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none w-80"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="vibeScore">Sort by Vibe Score</option>
            <option value="lastInteraction">Sort by Last Interaction</option>
            <option value="name">Sort by Name</option>
          </select>
          
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white hover:bg-gray-600 transition-colors"
          >
            {sortOrder === 'desc' ? '↓' : '↑'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <DashboardFilters 
        filters={filters}
        onFiltersChange={setFilters}
        leads={leads}
      />

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedLeads.map(lead => (
          <LeadCard 
            key={lead.id} 
            lead={lead} 
            onClick={onLeadSelect}
          />
        ))}
      </div>

      {filteredAndSortedLeads.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No leads found</div>
          <div className="text-gray-500">Try adjusting your filters</div>
        </div>
      )}
    </div>
  );
}