import React, { useMemo } from 'react';
import type { ScoreHistory } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ScoreHistoryChartProps {
  history: ScoreHistory[];
}

export default function ScoreHistoryChart({ history }: ScoreHistoryChartProps) {
  const chartData = useMemo(() => {
    if (history.length === 0) return { points: '', viewBox: '0 0 400 200', minScore: 0, maxScore: 100 };

    const minScore = Math.min(...history.map(h => h.score));
    const maxScore = Math.max(...history.map(h => h.score));
    const scoreRange = maxScore - minScore || 1;
    
    const width = 800;
    const height = 200;
    const padding = 40;
    
    const points = history.map((item, index) => {
      const x = padding + (index * (width - 2 * padding)) / (history.length - 1);
      const y = height - padding - ((item.score - minScore) / scoreRange) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    return {
      points,
      viewBox: `0 0 ${width} ${height}`,
      minScore,
      maxScore,
      width,
      height,
      padding
    };
  }, [history]);

  const totalChange = history.length > 1 ? history[history.length - 1].score - history[0].score : 0;
  const averageScore = history.length > 0 ? history.reduce((sum, h) => sum + h.score, 0) / history.length : 0;

  if (history.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
        <div className="text-gray-400 text-lg mb-2">No score history available</div>
        <div className="text-gray-500">Historical data will appear here as interactions are processed</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            {totalChange >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
            <span className="text-sm text-gray-400">30-Day Change</span>
          </div>
          <div className={`text-2xl font-bold ${totalChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(1)}
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-2">Average Score</div>
          <div className="text-2xl font-bold text-blue-400">
            {averageScore.toFixed(1)}
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-2">Current Score</div>
          <div className="text-2xl font-bold text-white">
            {history[history.length - 1]?.score.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Score Trend (Last 30 Days)</h3>
        
        <div className="relative">
          <svg viewBox={chartData.viewBox} className="w-full h-64">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(score => {
              const y = chartData.height - chartData.padding - ((score - chartData.minScore) / (chartData.maxScore - chartData.minScore || 1)) * (chartData.height - 2 * chartData.padding);
              return (
                <g key={score}>
                  <line
                    x1={chartData.padding}
                    y1={y}
                    x2={chartData.width - chartData.padding}
                    y2={y}
                    stroke="#374151"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                  <text
                    x={chartData.padding - 10}
                    y={y + 4}
                    fill="#9CA3AF"
                    fontSize="12"
                    textAnchor="end"
                  >
                    {score}
                  </text>
                </g>
              );
            })}

            {/* Area under curve */}
            <path
              d={`M${chartData.padding},${chartData.height - chartData.padding} L${chartData.points} L${chartData.width - chartData.padding},${chartData.height - chartData.padding} Z`}
              fill="url(#scoreGradient)"
              opacity="0.1"
            />

            {/* Score line */}
            <polyline
              points={chartData.points}
              fill="none"
              stroke="#60A5FA"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {history.map((item, index) => {
              const x = chartData.padding + (index * (chartData.width - 2 * chartData.padding)) / (history.length - 1);
              const y = chartData.height - chartData.padding - ((item.score - chartData.minScore) / (chartData.maxScore - chartData.minScore || 1)) * (chartData.height - 2 * chartData.padding);
              
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#60A5FA"
                    stroke="#1F2937"
                    strokeWidth="2"
                    className="hover:r-6 transition-all cursor-pointer"
                  />
                  {item.majorEvents && item.majorEvents.length > 0 && (
                    <circle
                      cx={x}
                      cy={y - 15}
                      r="3"
                      fill="#F59E0B"
                      className="animate-pulse"
                    />
                  )}
                </g>
              );
            })}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
          <span>30 days ago</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span>Vibe Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span>Major Events</span>
            </div>
          </div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}