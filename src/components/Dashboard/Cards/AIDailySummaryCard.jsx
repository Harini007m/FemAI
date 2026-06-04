import React from 'react';
import { Sparkles, Lightbulb, TrendingUp, Activity } from 'lucide-react';

export default function AIDailySummaryCard({ user = {}, cyclePhase = 'Follicular', summary = '' }) {
  const defaultSummary = summary || `Based on your ${cyclePhase} phase and wellness metrics, here's your personalized health summary for today:

**💧 Hydration Focus**: You're tracking well with water intake. Continue aiming for 2.5-3L daily, especially during your menstrual phase when iron absorption is key.

**🌙 Sleep Quality**: Your 7-5 hours of sleep is good, but aiming for consistent 8-hour cycles will optimize hormone production.

**🎯 Energy Levels**: You're in your growth phase - expect increased energy and motivation. Perfect time for more intense workouts!

**💪 Movement**: Light to moderate activity is ideal now. Consider yoga or strength training to boost metabolism.

**🥗 Nutrition Tips**: Focus on iron-rich foods, leafy greens, and plant-based proteins to support your natural rhythms.`;

  const insights = [
    { icon: '🔥', label: 'Peak Energy Day', color: 'from-orange-400 to-red-400' },
    { icon: '🧠', label: 'Mental Clarity', color: 'from-purple-400 to-pink-400' },
    { icon: '💪', label: 'Workout Ready', color: 'from-green-400 to-emerald-400' },
  ];

  return (
    <div className="glass-card rounded-3xl p-8 border border-pink-100 shadow-lg overflow-hidden relative">
      {/* Decorative background */}
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-gradient-to-br from-pink-200 to-purple-100 rounded-full blur-3xl opacity-30"></div>

      <div className="relative z-10">
        {/* Header with AI Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-pink-100 to-purple-100 text-pink-600 rounded-xl">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">AI Daily Health Summary</h3>
              <p className="text-xs text-gray-500">Powered by HERBUDDY AI</p>
            </div>
          </div>
        </div>

        {/* Daily Insights Pills */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {insights.map((insight, idx) => (
            <div key={idx} className={`p-3 rounded-xl bg-gradient-to-br ${insight.color} text-white text-center`}>
              <div className="text-2xl mb-1">{insight.icon}</div>
              <p className="text-xs font-bold">{insight.label}</p>
            </div>
          ))}
        </div>

        {/* Main Summary Text */}
        <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-white/80 to-pink-50/50 border border-pink-100 backdrop-blur-sm">
          <div className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-gray-800 prose-p:text-gray-700 prose-p:text-sm prose-li:text-gray-700 prose-li:text-sm prose-strong:text-pink-600">
            {/* Parse basic markdown for better presentation */}
            <div className="text-sm leading-relaxed text-gray-800 space-y-3">
              {defaultSummary.split('\n\n').map((paragraph, idx) => (
                <div key={idx}>
                  {paragraph.includes('**') ? (
                    <p>{paragraph.split('**').map((part, i) => 
                      i % 2 === 0 ? part : <span key={i} className="font-bold text-pink-600">{part}</span>
                    )}</p>
                  ) : paragraph.includes('-') ? (
                    <ul className="space-y-2 pl-4">
                      {paragraph.split('-').filter(item => item.trim()).map((item, i) => (
                        <li key={i} className="text-xs leading-relaxed">{item.trim()}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{paragraph}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition flex items-center justify-center space-x-2">
            <Lightbulb className="h-4 w-4" />
            <span>View Full Recommendations</span>
          </button>
          <button className="px-4 py-3 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-xl font-semibold text-sm transition">
            <TrendingUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
