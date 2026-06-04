import React from 'react';
import { Award, TrendingUp, Zap } from 'lucide-react';

export default function HealthScoreCard({ score = 82, breakdown = {}, user = {} }) {
  const defaultBreakdown = {
    cycle_health: 85,
    nutrition: 80,
    hydration: 75,
    sleep: 80,
    wellness: 80,
    ...breakdown
  };

  const getTwinColor = () => {
    if (score >= 85) return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', badge: 'from-green-500 to-emerald-500' };
    if (score >= 70) return { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200', badge: 'from-pink-500 to-purple-600' };
    return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', badge: 'from-amber-500 to-orange-500' };
  };

  const colors = getTwinColor();

  const getHealthStatus = () => {
    if (score >= 85) return 'Excellent Health State';
    if (score >= 70) return 'Optimal Hormonal Balance';
    return 'Needs Monitoring';
  };

  const metrics = [
    { label: 'Cycle Health', value: defaultBreakdown.cycle_health, color: 'from-pink-400 to-pink-500' },
    { label: 'Nutrition', value: defaultBreakdown.nutrition, color: 'from-purple-400 to-purple-500' },
    { label: 'Hydration', value: defaultBreakdown.hydration, color: 'from-blue-400 to-blue-500' },
    { label: 'Sleep Quality', value: defaultBreakdown.sleep, color: 'from-indigo-400 to-indigo-500' },
    { label: 'Wellness', value: defaultBreakdown.wellness, color: 'from-rose-400 to-rose-500' }
  ];

  return (
    <div className={`glass-card rounded-3xl p-8 border ${colors.border} shadow-lg overflow-hidden relative`}>
      {/* Decorative background elements */}
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-gradient-to-tl from-pink-100 to-blue-100 rounded-full blur-3xl opacity-10"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-bold text-gray-800 text-lg flex items-center space-x-2">
              <Award className={`h-5 w-5 ${colors.text}`} />
              <span>Health Score</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">Personal wellness index</p>
          </div>
          <div className="flex items-center space-x-2 bg-white/80 px-3 py-1 rounded-full">
            <TrendingUp className="h-3.5 w-3.5 text-green-500" />
            <span className="text-xs font-bold text-green-600">+2.5%</span>
          </div>
        </div>

        {/* Score Circle */}
        <div className="flex justify-center mb-8">
          <div className={`relative w-48 h-48 rounded-full border-8 flex items-center justify-center shadow-xl backdrop-blur-md ${colors.bg} ${colors.border}`}>
            {/* Animated ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-current border-r-current opacity-30 animate-spin slow" style={{ color: `var(--color-${colors.text.split('-')[1]}` }}></div>
            
            {/* Inner circle with score */}
            <div className="flex flex-col items-center">
              <span className={`text-5xl font-black ${colors.text}`}>{Math.round(score)}</span>
              <span className="text-xs text-gray-500 font-semibold mt-1">/ 100</span>
            </div>

            {/* Badge */}
            <div className={`absolute -bottom-4 bg-gradient-to-r ${colors.badge} text-white font-bold px-4 py-2 rounded-full text-xs shadow-lg border-2 border-white`}>
              {getHealthStatus()}
            </div>
          </div>
        </div>

        {/* Health Status Description */}
        <div className="text-center mb-8 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-100">
          <p className="text-sm text-gray-700 font-medium">
            {score >= 85
              ? '🌟 Your reproductive health is in excellent condition. Continue maintaining your current wellness routine.'
              : score >= 70
              ? '✨ Your health metrics are well-balanced. Small lifestyle adjustments can optimize your wellness further.'
              : '⚠️ Your health indicators need attention. Consider tracking more metrics and consulting health recommendations.'}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, idx) => (
            <div key={idx} className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-gray-600">{metric.label}</span>
                <span className={`text-xs font-bold bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
                  {metric.value}%
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${metric.color} transition-all duration-500`}
                  style={{ width: `${metric.value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
