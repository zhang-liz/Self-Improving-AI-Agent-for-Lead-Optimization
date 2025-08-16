import React from 'react';
import { Interaction } from '../types';
import { Mail, MessageCircle, Phone, HelpCircle, ExternalLink } from 'lucide-react';

interface InteractionTimelineProps {
  interactions: Interaction[];
}

export default function InteractionTimeline({ interactions }: InteractionTimelineProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'chat': return MessageCircle;
      case 'call': return Phone;
      case 'support_ticket': return HelpCircle;
      default: return MessageCircle;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400 bg-green-900/20 border-green-400';
      case 'negative': return 'text-red-400 bg-red-900/20 border-red-400';
      default: return 'text-yellow-400 bg-yellow-900/20 border-yellow-400';
    }
  };

  const sortedInteractions = [...interactions].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (interactions.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
        <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-400 mb-2">No interactions yet</h3>
        <p className="text-gray-500">Interactions will appear here as they're processed</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Interaction Timeline</h3>
      
      <div className="space-y-6">
        {sortedInteractions.map((interaction, index) => {
          const Icon = getIcon(interaction.type);
          const isLast = index === sortedInteractions.length - 1;

          return (
            <div key={interaction.id} className="relative">
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-6 top-12 w-0.5 h-6 bg-gray-600" />
              )}
              
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center ${getSentimentColor(interaction.sentiment)}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-white capitalize">
                        {interaction.type.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(interaction.sentiment)}`}>
                        {interaction.sentiment}
                      </span>
                      <span className="text-sm text-gray-400">
                        Score: {(interaction.sentimentScore * 100).toFixed(0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>{interaction.timestamp.toLocaleDateString()}</span>
                      <span>{interaction.timestamp.toLocaleTimeString()}</span>
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Metadata */}
                  {interaction.metadata?.subject && (
                    <div className="text-sm text-gray-300 font-medium mb-2">
                      Subject: {interaction.metadata.subject}
                    </div>
                  )}

                  {/* Content */}
                  <div className="text-gray-300 leading-relaxed">
                    {interaction.content}
                  </div>

                  {/* Source */}
                  <div className="mt-3 text-xs text-gray-500">
                    Source: {interaction.source}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}