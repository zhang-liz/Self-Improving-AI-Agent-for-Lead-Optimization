import React from 'react';
import { Lead, FilterOptions } from '../types';
import { Filter, X } from 'lucide-react';

interface DashboardFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  leads: Lead[];
}

export default function DashboardFilters({ filters, onFiltersChange, leads }: DashboardFiltersProps) {
  const [showFilters, setShowFilters] = React.useState(false);

  const allStages = Array.from(new Set(leads.map(lead => lead.stage)));
  const allSources = Array.from(new Set(leads.map(lead => lead.source)));
  const allTrends = ['up', 'down', 'stable'];

  const updateFilter = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = <K extends keyof FilterOptions>(key: K, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray as FilterOptions[K]);
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      scoreRange: [0, 100],
      stages: [],
      sources: [],
      dateRange: null,
      trend: []
    });
  };

  const hasActiveFilters = filters.scoreRange[0] > 0 || filters.scoreRange[1] < 100 ||
    filters.stages.length > 0 || filters.sources.length > 0 || filters.trend.length > 0;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg">
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          <Filter className="w-5 h-5" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>

      {showFilters && (
        <div className="border-t border-gray-700 p-4 space-y-4">
          {/* Score Range */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Vibe Score Range: {filters.scoreRange[0]} - {filters.scoreRange[1]}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={filters.scoreRange[0]}
                onChange={(e) => updateFilter('scoreRange', [parseInt(e.target.value), filters.scoreRange[1]])}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={filters.scoreRange[1]}
                onChange={(e) => updateFilter('scoreRange', [filters.scoreRange[0], parseInt(e.target.value)])}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>

          {/* Stages */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Stages</label>
            <div className="flex flex-wrap gap-2">
              {allStages.map(stage => (
                <button
                  key={stage}
                  onClick={() => toggleArrayFilter('stages', stage)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.stages.includes(stage)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Sources */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Sources</label>
            <div className="flex flex-wrap gap-2">
              {allSources.map(source => (
                <button
                  key={source}
                  onClick={() => toggleArrayFilter('sources', source)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.sources.includes(source)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {source}
                </button>
              ))}
            </div>
          </div>

          {/* Trends */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Trends</label>
            <div className="flex flex-wrap gap-2">
              {allTrends.map(trend => (
                <button
                  key={trend}
                  onClick={() => toggleArrayFilter('trend', trend)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.trend.includes(trend)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {trend.charAt(0).toUpperCase() + trend.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}