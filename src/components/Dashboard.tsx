import React, { useState, useMemo, useEffect } from 'react';
import type { Lead, FilterOptions, RecommendationSuggestion, TeamMetrics } from '../types';
import LeadCard from './LeadCard';
import DashboardFilters from './DashboardFilters';
import MetricsCards from './MetricsCards';
import { mockLeads, mockTeamMetrics, mockInteractions, applyAttributionToLeads } from '../data/mockData';
import { getRecommendations, recordFeedback } from '../services/agentService';
import { useConfig } from '../contexts/ConfigContext';
import { Search, ThumbsUp, ThumbsDown, Sparkles, RefreshCw } from 'lucide-react';

interface DashboardProps {
  onLeadSelect: (lead: Lead, suggestion?: RecommendationSuggestion) => void;
}

export default function Dashboard({ onLeadSelect }: DashboardProps) {
  const { config } = useConfig();
  const [leads, setLeads] = useState<Lead[]>(mockLeads);

  useEffect(() => {
    if (config) {
      const attributed = applyAttributionToLeads(mockLeads, mockInteractions, config);
      setLeads(attributed);
    } else {
      setLeads(mockLeads);
    }
  }, [config]);
  const [recommendations, setRecommendations] = useState<{ prioritizedLeadIds: string[]; suggestions: RecommendationSuggestion[]; summary?: string } | null>(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsOpen, setRecommendationsOpen] = useState(true);

  const suggestionByLead = useMemo(() => {
    const m: Record<string, RecommendationSuggestion> = {};
    recommendations?.suggestions?.forEach(s => { m[s.leadId] = s; });
    return m;
  }, [recommendations]);

  const fetchRecommendations = async () => {
    setRecommendationsLoading(true);
    const result = await getRecommendations(leads, teamMetrics, mockInteractions);
    setRecommendations(result ?? null);
    setRecommendationsLoading(false);
  };

  useEffect(() => { fetchRecommendations(); }, [leads]);

  const handleFeedback = async (e: React.MouseEvent, leadId: string, helpful: boolean) => {
    e.stopPropagation();
    const lead = leads.find(l => l.id === leadId);
    const metadata = lead ? { stage: lead.stage, source: lead.source } : undefined;
    await recordFeedback(leadId, helpful ? 'helpful' : 'not_helpful', undefined, metadata);
  };
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    scoreRange: [0, 100],
    stages: [],
    sources: [],
    dateRange: null,
    trend: []
  });
  const [sortBy, setSortBy] = useState<'engagementScore' | 'lastInteraction' | 'name'>('engagementScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Calculate lead temperature categories
  const hotLeads = leads.filter(lead => lead.engagementScore >= 80);
  const warmLeads = leads.filter(lead => lead.engagementScore >= 60 && lead.engagementScore < 80);
  const coldLeads = leads.filter(lead => lead.engagementScore < 60);

  const [temperatureFilter, setTemperatureFilter] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');

  const teamMetrics: TeamMetrics = useMemo(() => ({
    ...mockTeamMetrics,
    totalLeads: leads.length,
    averageEngagementScore: Math.round(leads.reduce((sum, l) => sum + l.engagementScore, 0) / leads.length) || 0,
    highQualityLeads: leads.filter(l => l.engagementScore > 75).length
  }), [leads]);

  const filteredAndSortedLeads = useMemo(() => {
    const filtered = leads.filter(lead => {
      // Temperature filter
      if (temperatureFilter !== 'all') {
        if (temperatureFilter === 'hot' && lead.engagementScore < 80) return false;
        if (temperatureFilter === 'warm' && (lead.engagementScore < 60 || lead.engagementScore >= 80)) return false;
        if (temperatureFilter === 'cold' && lead.engagementScore >= 60) return false;
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
      if (lead.engagementScore < filters.scoreRange[0] || lead.engagementScore > filters.scoreRange[1]) {
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
        case 'engagementScore':
          aValue = a.engagementScore;
          bValue = b.engagementScore;
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

      {/* AI Recommendations */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setRecommendationsOpen(prev => !prev)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/50 transition-colors"
        >
          <span className="flex items-center gap-2 text-white font-semibold">
            <Sparkles className="w-5 h-5 text-amber-400" />
            AI Recommendations
          </span>
          <span className="text-gray-400 text-sm">
            {recommendationsOpen ? 'Collapse' : 'Expand'}
          </span>
        </button>
        {recommendationsOpen && (
          <div className="border-t border-gray-700 p-4">
            {recommendationsLoading ? (
              <div className="text-gray-400 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Loading recommendations...
              </div>
            ) : recommendations ? (
              <div className="space-y-3">
                {recommendations.summary && (
                  <p className="text-gray-400 text-sm mb-3">{recommendations.summary}</p>
                )}
                <ul className="space-y-2">
                  {recommendations.suggestions.map((s) => {
                    const lead = leads.find(l => l.id === s.leadId);
                    return (
                      <li
                        key={s.leadId}
                        className="flex items-center justify-between gap-4 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700"
                      >
                        <button
                          type="button"
                          className="flex-1 text-left min-w-0"
                          onClick={() => lead && onLeadSelect(lead, s)}
                        >
                          <span className="font-medium text-white block truncate">{lead?.name ?? s.leadId}</span>
                          <span className="text-sm text-gray-400">{s.action} – {s.reason}</span>
                        </button>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleFeedback(e, s.leadId, true)}
                            className="p-1.5 rounded text-gray-400 hover:text-green-400 hover:bg-gray-600"
                            title="Helpful"
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleFeedback(e, s.leadId, false)}
                            className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-gray-600"
                            title="Not helpful"
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <button
                  type="button"
                  onClick={fetchRecommendations}
                  disabled={recommendationsLoading}
                  className="mt-2 text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50 flex items-center gap-1"
                >
                  <RefreshCw className={`w-4 h-4 ${recommendationsLoading ? 'animate-spin' : ''}`} />
                  Refresh recommendations
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Start the backend server to see AI recommendations.</p>
            )}
          </div>
        )}
      </div>

      {/* Metrics Cards */}
      <MetricsCards metrics={teamMetrics} />

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
            onChange={(e) => setSortBy((e.target.value as 'engagementScore' | 'lastInteraction' | 'name') || 'engagementScore')}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="engagementScore">Sort by Lead Score</option>
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
            onClick={() => onLeadSelect(lead, suggestionByLead[lead.id])}
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