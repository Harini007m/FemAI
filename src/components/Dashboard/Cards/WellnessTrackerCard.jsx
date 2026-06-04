import React from 'react';
import { Droplets, Moon, Activity, Smile, Weight, TrendingDown } from 'lucide-react';

export default function WellnessTrackerCard({ wellnessData = {}, onUpdate = () => {} }) {
  const defaultData = {
    water_intake: 2.0,
    water_goal: 2.5,
    sleep_hours: 7.5,
    sleep_goal: 8,
    physical_activity: 45,
    activity_goal: 60,
    mood: 'Happy',
    weight: 62,
    weight_prev: 62.5,
    bmi: 22.1,
    bmi_category: 'Normal',
    ...wellnessData
  };

  const waterPercent = Math.min((defaultData.water_intake / defaultData.water_goal) * 100, 100);
  const sleepPercent = Math.min((defaultData.sleep_hours / defaultData.sleep_goal) * 100, 100);
  const activityPercent = Math.min((defaultData.physical_activity / defaultData.activity_goal) * 100, 100);
  const weightChange = defaultData.weight_prev - defaultData.weight;

  const getMoodEmoji = (mood) => {
    const moods = {
      'Happy': '😊', 'Neutral': '😐', 'Sad': '😢', 
      'Anxious': '😰', 'Irritable': '😠', 'Fatigued': '😴'
    };
    return moods[mood] || '😊';
  };

  const getBMIColor = (bmi) => {
    if (bmi < 18.5) return 'from-blue-400 to-blue-500';
    if (bmi < 25) return 'from-green-400 to-green-500';
    if (bmi < 30) return 'from-yellow-400 to-yellow-500';
    return 'from-red-400 to-red-500';
  };

  const WellnessMetric = ({ icon: Icon, label, value, goal, unit, color, percent }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${color} text-white`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">{label}</p>
            <p className="font-bold text-gray-800">{value}{unit}</p>
          </div>
        </div>
        <div className="text-right text-xs">
          <p className="text-gray-400">Goal: {goal}{unit}</p>
          <p className="font-bold text-gray-700">{Math.round(percent)}%</p>
        </div>
      </div>
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="glass-card rounded-3xl p-8 border border-blue-100 shadow-lg overflow-hidden relative">
      {/* Decorative background */}
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-gradient-to-br from-blue-200 to-indigo-100 rounded-full blur-3xl opacity-20"></div>

      <div className="relative z-10">
        {/* Header */}
        <h3 className="font-bold text-gray-800 text-lg mb-6">Wellness Tracker</h3>

        {/* Grid of metrics */}
        <div className="space-y-6 mb-6">
          <WellnessMetric
            icon={Droplets}
            label="Hydration"
            value={defaultData.water_intake}
            goal={defaultData.water_goal}
            unit=" L"
            color="from-blue-400 to-blue-500"
            percent={waterPercent}
          />

          <WellnessMetric
            icon={Moon}
            label="Sleep Quality"
            value={defaultData.sleep_hours}
            goal={defaultData.sleep_goal}
            unit=" hrs"
            color="from-indigo-400 to-indigo-500"
            percent={sleepPercent}
          />

          <WellnessMetric
            icon={Activity}
            label="Physical Activity"
            value={defaultData.physical_activity}
            goal={defaultData.activity_goal}
            unit=" min"
            color="from-green-400 to-green-500"
            percent={activityPercent}
          />
        </div>

        {/* Mood & Weight Section */}
        <div className="grid grid-cols-2 gap-4">
          {/* Mood */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-3xl">{getMoodEmoji(defaultData.mood)}</span>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Current Mood</p>
                <p className="font-bold text-gray-800 text-sm">{defaultData.mood}</p>
              </div>
            </div>
          </div>

          {/* Weight & BMI */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200">
            <p className="text-xs text-gray-500 font-semibold mb-2">Weight & BMI</p>
            <div className="flex items-baseline justify-between">
              <div>
                <p className="font-bold text-gray-800 text-lg">{defaultData.weight} kg</p>
                <p className={`text-xs font-bold ${weightChange > 0 ? 'text-green-600' : 'text-amber-600'}`}>
                  {weightChange > 0 ? '↓' : '↑'} {Math.abs(weightChange).toFixed(1)} kg
                </p>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold bg-gradient-to-r ${getBMIColor(defaultData.bmi)} bg-clip-text text-transparent`}>
                  {defaultData.bmi}
                </div>
                <p className="text-xs text-gray-500">{defaultData.bmi_category}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200 flex gap-2">
          <button
            onClick={() => onUpdate('water')}
            className="flex-1 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl font-semibold text-xs transition"
          >
            + Water
          </button>
          <button
            onClick={() => onUpdate('sleep')}
            className="flex-1 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl font-semibold text-xs transition"
          >
            + Sleep
          </button>
          <button
            onClick={() => onUpdate('activity')}
            className="flex-1 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl font-semibold text-xs transition"
          >
            + Activity
          </button>
        </div>
      </div>
    </div>
  );
}
