import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface VibeScoreGaugeProps {
  score: number;
  previousScore?: number;
  trend: 'up' | 'down' | 'stable';
  size?: 'sm' | 'md' | 'lg';
  showTrend?: boolean;
  animated?: boolean;
}

export default function VibeScoreGauge({ 
  score, 
  previousScore, 
  trend, 
  size = 'md', 
  showTrend = true,
  animated = true 
}: VibeScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isJumping, setIsJumping] = useState(false);

  useEffect(() => {
    if (animated) {
      const duration = 1000;
      const steps = 60;
      const increment = score / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        setAnimatedScore(Math.min(score, increment * currentStep));
        
        if (currentStep >= steps) {
          clearInterval(timer);
          // Trigger jumping animation
          setIsJumping(true);
          setTimeout(() => setIsJumping(false), 600);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setAnimatedScore(score);
    }
  }, [score, animated]);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg'
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStrokeColor = (score: number) => {
    if (score >= 80) return 'stroke-green-400';
    if (score >= 60) return 'stroke-blue-400';
    if (score >= 40) return 'stroke-yellow-400';
    return 'stroke-red-400';
  };

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const scoreChange = previousScore ? score - previousScore : 0;

  return (
    <div className="relative flex flex-col items-center">
      <div className={`relative ${sizeClasses[size]} ${isJumping ? 'animate-bounce' : ''}`}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-700"
          />
          {/* Score circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${getStrokeColor(animatedScore)} ${
              animated ? 'transition-all duration-1000 ease-out' : ''
            }`}
          />
        </svg>
        
        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${getScoreColor(animatedScore)} ${textSizeClasses[size]}`}>
            {Math.round(animatedScore)}
          </span>
        </div>
      </div>

      {showTrend && (
        <div className="mt-2 flex items-center gap-1">
          {getTrendIcon()}
          {scoreChange !== 0 && (
            <span className={`text-xs ${scoreChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {scoreChange > 0 ? '+' : ''}{scoreChange.toFixed(1)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}