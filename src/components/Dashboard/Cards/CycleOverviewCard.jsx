import React, { useMemo } from 'react';
import { Calendar, Heart, Flame, Activity, AlertCircle } from 'lucide-react';

export default function CycleOverviewCard({ cycleData = {}, predictions = {} }) {
  const defaultData = {
    current_day: 8,
    cycle_length: 28,
    last_period_start: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    ...cycleData
  };

  const defaultPredictions = {
    next_period_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    ovulation_date: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString(),
    irregular_detected: false,
    cycle_regularity_score: 88,
    ...predictions
  };

  const getCurrentPhase = () => {
    const day = defaultData.current_day;
    if (day <= 5) return { name: 'Menstrual', color: 'from-red-500 to-rose-500', icon: '🩸', description: 'Shedding phase' };
    if (day <= 12) return { name: 'Follicular', color: 'from-pink-500 to-purple-500', icon: '🌱', description: 'Growth phase' };
    if (day <= 16) return { name: 'Ovulation', color: 'from-yellow-500 to-orange-500', icon: '🔥', description: 'Peak fertility' };
    return { name: 'Luteal', color: 'from-purple-600 to-indigo-600', icon: '🌙', description: 'Hormone decline' };
  };

  const phase = getCurrentPhase();
  const daysUntilPeriod = Math.round((new Date(defaultPredictions.next_period_date) - new Date()) / (1000 * 60 * 60 * 24));
  const daysUntilOvulation = Math.round((new Date(defaultPredictions.ovulation_date) - new Date()) / (1000 * 60 * 60 * 24));

  const cycleProgress = Math.round((defaultData.current_day / defaultData.cycle_length) * 100);

  return (
    <div className="glass-card rounded-3xl p-8 border border-purple-100 shadow-lg overflow-hidden relative">
      {/* Decorative background */}
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-gradient-to-br from-purple-200 to-pink-100 rounded-full blur-3xl opacity-20"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-800 text-lg flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            <span>Cycle Overview</span>
          </h3>
          <div className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Day {defaultData.current_day}/{defaultData.cycle_length}
          </div>
        </div>

        {/* Current Phase Banner */}
        <div className={`mb-6 p-4 rounded-2xl bg-gradient-to-r ${phase.color} text-white`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-3xl mb-2">{phase.icon}</div>
              <h4 className="font-bold text-lg">{phase.name} Phase</h4>
              <p className="text-sm text-white/80">{phase.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black">{defaultData.current_day}</div>
              <div className="text-xs text-white/70">of {defaultData.cycle_length} days</div>
            </div>
          </div>
        </div>

        {/* Cycle Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-600">Cycle Progress</span>
            <span className="text-xs font-bold text-purple-600">{cycleProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${cycleProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Key Dates Timeline */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-4 bg-white/60 rounded-2xl border border-purple-100 hover:border-purple-300 transition">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-red-100 text-red-600 rounded-xl">
                <Heart className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Next Period</p>
                <p className="font-bold text-gray-800">{daysUntilPeriod} days away</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">
                {new Date(defaultPredictions.next_period_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/60 rounded-2xl border border-yellow-100 hover:border-yellow-300 transition">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-yellow-100 text-yellow-600 rounded-xl">
                <Flame className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Ovulation Window</p>
                <p className="font-bold text-gray-800">{daysUntilOvulation > 0 ? `${daysUntilOvulation} days away` : 'In progress'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">
                {new Date(defaultPredictions.ovulation_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/60 rounded-2xl border border-green-100 hover:border-green-300 transition">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-green-100 text-green-600 rounded-xl">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Cycle Regularity</p>
                <p className="font-bold text-gray-800">{defaultPredictions.cycle_regularity_score}% Regular</p>
              </div>
            </div>
            <div className={defaultPredictions.irregular_detected ? 'text-orange-600' : 'text-green-600'}>
              <p className="text-xs font-semibold">
                {defaultPredictions.irregular_detected ? '⚠️ Monitor' : '✓ Healthy'}
              </p>
            </div>
          </div>
        </div>

        {/* Fertility Status */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-600">Fertility Status</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Peak</span>
          </div>
          <p className="text-sm text-gray-700">
            You are approaching your most fertile window. If planning conception, this is an optimal time.
          </p>
        </div>
      </div>
    </div>
  );
}
