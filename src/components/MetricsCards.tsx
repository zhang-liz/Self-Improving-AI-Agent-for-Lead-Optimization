import React, { useEffect, useState } from 'react';
import type { TeamMetrics } from '../types';
import { Users, TrendingUp, Target, Activity, Zap, BarChart3 } from 'lucide-react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

function AnimatedNumber({ value, duration = 2000, suffix = '', prefix = '' }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const steps = 60;
    const increment = value / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setDisplayValue(Math.min(value, increment * currentStep));
      
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent font-bold">
      {prefix}{Math.round(displayValue)}{suffix}
    </span>
  );
}

interface MetricsCardsProps {
  metrics: TeamMetrics;
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      title: 'Total Leads',
      value: metrics.totalLeads,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-500/30'
    },
    {
      title: 'Average Lead Score',
      value: metrics.averageEngagementScore,
      icon: BarChart3,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-500/30'
    },
    {
      title: 'High Quality Leads',
      value: metrics.highQualityLeads,
      icon: Target,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-500/30'
    },
    {
      title: 'Score Improvement',
      value: metrics.scoreImprovement,
      icon: TrendingUp,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20',
      borderColor: 'border-yellow-500/30',
      prefix: '+',
      suffix: '%'
    },
    {
      title: 'Interactions Today',
      value: metrics.interactionsToday,
      icon: Activity,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-900/20',
      borderColor: 'border-cyan-500/30'
    },
    {
      title: 'Conversion Rate',
      value: metrics.conversionRate,
      icon: Zap,
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/20',
      borderColor: 'border-orange-500/30',
      suffix: '%'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.bgColor} border ${card.borderColor} rounded-lg p-6 hover:border-gray-500 transition-all duration-300 hover:shadow-lg hover:shadow-${card.color.split('-')[1]}-500/20 hover:scale-105 transform`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${card.bgColor} border ${card.borderColor}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>
          <div className="text-3xl font-bold mb-2">
            <AnimatedNumber 
              value={card.value} 
              prefix={card.prefix || ''}
              suffix={card.suffix || ''}
            />
          </div>
          <div className="text-sm text-gray-300 font-medium">
            {card.title}
          </div>
        </div>
      ))}
    </div>
  );
}