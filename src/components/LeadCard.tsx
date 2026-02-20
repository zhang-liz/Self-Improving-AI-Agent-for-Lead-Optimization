import React from 'react';
import type { Lead } from '../types';
import ScoreGauge from './ScoreGauge';
import { Building, Mail, Calendar, MessageCircle, ExternalLink } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
}

export default function LeadCard({ lead, onClick }: LeadCardProps) {
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'prospect': return 'bg-gray-600 text-gray-300';
      case 'qualified': return 'bg-blue-600 text-blue-200';
      case 'opportunity': return 'bg-yellow-600 text-yellow-200';
      case 'customer': return 'bg-green-600 text-green-200';
      default: return 'bg-gray-600 text-gray-300';
    }
  };

  const formatLastInteraction = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  return (
    <div 
      className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-blue-500/20 group"
      onClick={() => onClick(lead)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
              {lead.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg group-hover:text-blue-400 transition-colors">
                {lead.name}
              </h3>
              <p className="text-gray-400 text-sm">{lead.position}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
            <div className="flex items-center gap-1">
              <Building className="w-4 h-4" />
              <span>{lead.company}</span>
            </div>
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              <span className="truncate max-w-40">{lead.email}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(lead.stage)}`}>
              {lead.stage.charAt(0).toUpperCase() + lead.stage.slice(1)}
            </span>
            <span className="text-xs text-gray-500">{lead.source}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <ScoreGauge 
            score={lead.engagementScore} 
            previousScore={lead.previousScore}
            trend={lead.trend}
            size="sm"
            animated={true}
          />
          {lead.mlScore != null && (
            <span className="text-xs text-purple-400" title="ML conversion score">ML {lead.mlScore}</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{formatLastInteraction(lead.lastInteraction)}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4" />
          <span>{lead.totalInteractions} interactions</span>
        </div>
        <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}