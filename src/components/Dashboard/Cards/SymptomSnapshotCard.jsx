import React from 'react';
import { TrendingUp, Plus, Eye } from 'lucide-react';

export default function SymptomSnapshotCard({ symptoms = {}, onLogNew = () => {} }) {
  const defaultSymptoms = {
    recent: [
      { name: 'Mild Cramps', severity: 3, date: 'Today', trend: 'stable' },
      { name: 'Bloating', severity: 2, date: '2 hours ago', trend: 'improving' },
      { name: 'Fatigue', severity: 2, date: '4 hours ago', trend: 'stable' },
    ],
    frequency_trends: [
      { symptom: 'Cramps', frequency: 85, trend: '+5%' },
      { symptom: 'Bloating', frequency: 62, trend: '-3%' },
      { symptom: 'Mood Swings', frequency: 45, trend: 'stable' },
      { symptom: 'Headaches', frequency: 28, trend: '-8%' },
    ],
    ...symptoms
  };

  const getSeverityColor = (severity) => {
    if (severity <= 2) return { bg: 'bg-green-100', text: 'text-green-700', label: 'Mild' };
    if (severity <= 5) return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Moderate' };
    return { bg: 'bg-red-100', text: 'text-red-700', label: 'Severe' };
  };

  return (
    <div className="glass-card rounded-3xl p-8 border border-rose-100 shadow-lg overflow-hidden relative">
      {/* Decorative background */}
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-gradient-to-br from-rose-200 to-pink-100 rounded-full blur-3xl opacity-20"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-800 text-lg">Symptom Snapshot</h3>
          <button
            onClick={onLogNew}
            className="flex items-center space-x-2 px-3 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl font-semibold text-xs transition"
          >
            <Plus className="h-4 w-4" />
            <span>Log Symptom</span>
          </button>
        </div>

        {/* Recent Symptoms */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 text-sm mb-3">Recent Symptoms</h4>
          <div className="space-y-2">
            {defaultSymptoms.recent.map((symptom, idx) => {
              const severityInfo = getSeverityColor(symptom.severity);
              return (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-rose-50">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`px-2 py-1 ${severityInfo.bg} ${severityInfo.text} rounded-lg text-xs font-bold`}>
                      {severityInfo.label}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{symptom.name}</p>
                      <p className="text-xs text-gray-500">{symptom.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-rose-600">{symptom.severity}/10</div>
                    <p className={`text-xs font-bold ${
                      symptom.trend === 'improving' ? 'text-green-600' :
                      symptom.trend === 'worsening' ? 'text-red-600' :
                      'text-gray-500'
                    }`}>
                      {symptom.trend === 'improving' ? '↓' : symptom.trend === 'worsening' ? '↑' : '→'} {symptom.trend}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Frequency Trends */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 text-sm mb-3 flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span>Symptom Frequency Trends</span>
          </h4>
          <div className="space-y-3">
            {defaultSymptoms.frequency_trends.map((trend, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-gray-700">{trend.symptom}</span>
                  <span className="text-xs font-bold text-purple-600">{trend.frequency}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full"
                    style={{ width: `${trend.frequency}%` }}
                  ></div>
                </div>
                <p className={`text-xs mt-1 font-bold ${
                  trend.trend.includes('+') ? 'text-amber-600' :
                  trend.trend.includes('-') ? 'text-green-600' :
                  'text-gray-500'
                }`}>
                  {trend.trend}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <button className="w-full px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition flex items-center justify-center space-x-2">
          <Eye className="h-4 w-4" />
          <span>View Detailed Symptom Analysis</span>
        </button>
      </div>
    </div>
  );
}
