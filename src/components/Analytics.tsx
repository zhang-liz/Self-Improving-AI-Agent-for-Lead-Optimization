import React from 'react';
import { mockTeamMetrics, mockLeads } from '../data/mockData';
import MetricsCards from './MetricsCards';
import { BarChart3, TrendingUp, Users, Target, Activity, Calendar } from 'lucide-react';

export default function Analytics() {
  // Calculate additional analytics
  const scoreDistribution = {
    'Excellent (80-100)': mockLeads.filter(l => l.vibeScore >= 80).length,
    'Good (60-79)': mockLeads.filter(l => l.vibeScore >= 60 && l.vibeScore < 80).length,
    'Average (40-59)': mockLeads.filter(l => l.vibeScore >= 40 && l.vibeScore < 60).length,
    'Poor (0-39)': mockLeads.filter(l => l.vibeScore < 40).length,
  };

  const stageDistribution = mockLeads.reduce((acc, lead) => {
    acc[lead.stage] = (acc[lead.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sourceDistribution = mockLeads.reduce((acc, lead) => {
    acc[lead.source] = (acc[lead.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
        <p className="text-gray-400">Comprehensive insights into your lead scoring performance</p>
      </div>

      {/* Metrics Cards */}
      <MetricsCards metrics={mockTeamMetrics} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Score Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(scoreDistribution).map(([range, count]) => {
              const percentage = (count / mockLeads.length) * 100;
              const colors = {
                'Excellent (80-100)': 'bg-green-500',
                'Good (60-79)': 'bg-blue-500',
                'Average (40-59)': 'bg-yellow-500',
                'Poor (0-39)': 'bg-red-500',
              };
              
              return (
                <div key={range} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{range}</span>
                    <span className="text-white font-medium">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`${colors[range as keyof typeof colors]} h-2 rounded-full transition-all duration-1000`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stage Distribution */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Pipeline Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(stageDistribution).map(([stage, count]) => {
              const percentage = (count / mockLeads.length) * 100;
              const colors = {
                prospect: 'bg-gray-500',
                qualified: 'bg-blue-500',
                opportunity: 'bg-yellow-500',
                customer: 'bg-green-500',
              };
              
              return (
                <div key={stage} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300 capitalize">{stage}</span>
                    <span className="text-white font-medium">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`${colors[stage as keyof typeof colors]} h-2 rounded-full transition-all duration-1000`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Source Performance */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Lead Sources
          </h3>
          <div className="space-y-3">
            {Object.entries(sourceDistribution).map(([source, count]) => {
              const percentage = (count / mockLeads.length) * 100;
              
              return (
                <div key={source} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{source}</span>
                    <span className="text-white font-medium">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Trends */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Insights
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 font-medium">Strong Performance</span>
              </div>
              <p className="text-sm text-gray-300">
                {mockLeads.filter(l => l.vibeScore >= 80).length} leads have excellent vibe scores (80+)
              </p>
            </div>

            <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-blue-400 font-medium">Engagement Trend</span>
              </div>
              <p className="text-sm text-gray-300">
                Average {mockTeamMetrics.interactionsToday} daily interactions per lead
              </p>
            </div>

            <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-yellow-400 font-medium">Opportunity</span>
              </div>
              <p className="text-sm text-gray-300">
                {mockLeads.filter(l => l.vibeScore < 60).length} leads could benefit from targeted engagement
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Recommended Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
            <h4 className="font-medium text-blue-400 mb-2">Focus on High Scorers</h4>
            <p className="text-sm text-gray-300">
              Prioritize follow-up with {mockLeads.filter(l => l.vibeScore >= 80).length} high-scoring leads for faster conversion
            </p>
          </div>
          <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <h4 className="font-medium text-yellow-400 mb-2">Re-engage Cold Leads</h4>
            <p className="text-sm text-gray-300">
              {mockLeads.filter(l => l.vibeScore < 40).length} leads need nurturing campaigns to improve sentiment
            </p>
          </div>
          <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
            <h4 className="font-medium text-green-400 mb-2">Optimize Sources</h4>
            <p className="text-sm text-gray-300">
              LinkedIn and referrals show highest conversion rates - increase investment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}