import React, { useState, useMemo } from 'react';
import { Lead, Interaction } from '../types';
import VibeScoreGauge from './VibeScoreGauge';
import InteractionTimeline from './InteractionTimeline';
import ScoreHistoryChart from './ScoreHistoryChart';
import { ArrowLeft, Building, Mail, Phone, Calendar, ExternalLink, MessageCircle, Edit } from 'lucide-react';
import { mockInteractions, generateScoreHistory } from '../data/mockData';

interface LeadProfileProps {
  lead: Lead;
  onBack: () => void;
}

export default function LeadProfile({ lead, onBack }: LeadProfileProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'interactions' | 'history'>('overview');

  // Get interactions for this lead
  const leadInteractions = useMemo(() => {
    return mockInteractions.filter(interaction => interaction.leadId === lead.id);
  }, [lead.id]);

  // Generate score history for this lead
  const scoreHistory = useMemo(() => {
    return generateScoreHistory(lead.id);
  }, [lead.id]);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'prospect': return 'bg-gray-600 text-gray-200';
      case 'qualified': return 'bg-blue-600 text-blue-200';
      case 'opportunity': return 'bg-yellow-600 text-yellow-200';
      case 'customer': return 'bg-green-600 text-green-200';
      default: return 'bg-gray-600 text-gray-200';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'interactions', label: 'Interactions' },
    { id: 'history', label: 'Score History' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Lead Profile</h1>
          <p className="text-gray-400">Detailed analytics and interaction history</p>
        </div>
      </div>

      {/* Lead Header Card */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {lead.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            
            <div className="space-y-3">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{lead.name}</h2>
                <p className="text-gray-400 text-lg">{lead.position}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <Building className="w-4 h-4" />
                  <span>{lead.company}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Mail className="w-4 h-4" />
                  <span>{lead.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4" />
                  <span>Last active: {lead.lastInteraction.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <MessageCircle className="w-4 h-4" />
                  <span>{lead.totalInteractions} total interactions</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStageColor(lead.stage)}`}>
                  {lead.stage.charAt(0).toUpperCase() + lead.stage.slice(1)}
                </span>
                <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                  {lead.source}
                </span>
                {lead.hubspotId && (
                  <button className="flex items-center gap-1 px-3 py-1 bg-orange-600 text-orange-200 rounded-full text-sm hover:bg-orange-500 transition-colors">
                    <ExternalLink className="w-3 h-3" />
                    HubSpot
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="text-center">
            <VibeScoreGauge 
              score={lead.vibeScore}
              previousScore={lead.previousScore}
              trend={lead.trend}
              size="lg"
            />
            <div className="mt-3">
              <div className="text-sm text-gray-400 mb-1">Vibe Score</div>
              <div className="text-xs text-gray-500">Last updated: 2h ago</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-700">
        <div className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score Breakdown */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Score Breakdown</h3>
              <div className="space-y-4">
                {[
                  { label: 'Positivity', score: 85, color: 'bg-green-500' },
                  { label: 'Engagement', score: 72, color: 'bg-blue-500' },
                  { label: 'Responsiveness', score: 90, color: 'bg-yellow-500' },
                  { label: 'Interest Level', score: 68, color: 'bg-purple-500' }
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{item.label}</span>
                      <span className="text-white font-medium">{item.score}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`${item.color} h-2 rounded-full transition-all duration-1000`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {leadInteractions.slice(0, 3).map(interaction => (
                  <div key={interaction.id} className="flex items-start gap-3 p-3 bg-gray-700/50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      interaction.sentiment === 'positive' ? 'bg-green-400' :
                      interaction.sentiment === 'negative' ? 'bg-red-400' : 'bg-yellow-400'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white capitalize">
                          {interaction.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-400">
                          {interaction.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {interaction.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'interactions' && (
          <InteractionTimeline interactions={leadInteractions} />
        )}

        {activeTab === 'history' && (
          <ScoreHistoryChart history={scoreHistory} />
        )}
      </div>
    </div>
  );
}