import React from 'react';
import { Award, Flame, Star, Trophy, CheckCircle2 } from 'lucide-react';

export default function AchievementBadgeSection({ achievements = {} }) {
  const defaultAchievements = {
    logging_streak: 15,
    hydration_streak: 8,
    sleep_streak: 12,
    activity_streak: 6,
    total_logs: 156,
    badges: [
      { icon: '🔥', label: 'Hydration Master', earned: true, description: '30-day hydration tracking' },
      { icon: '😴', label: 'Sleep Champion', earned: true, description: 'Consistent 8-hour sleep' },
      { icon: '💪', label: 'Activity Warrior', earned: false, description: 'Complete 60 activities', progress: 45 },
      { icon: '🎯', label: 'Wellness Guru', earned: false, description: 'Reach 90+ health score', progress: 85 },
      { icon: '📊', label: 'Data Scientist', earned: true, description: 'Log 100+ wellness entries' },
      { icon: '🌟', label: 'Cycle Expert', earned: false, description: 'Track 6+ complete cycles' },
    ],
    ...achievements
  };

  const StreakCard = ({ icon: Icon, label, value, unit }) => (
    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
      <Icon className="h-8 w-8 text-purple-600 mb-2" />
      <p className="text-xs text-gray-600 font-semibold text-center">{label}</p>
      <p className="text-2xl font-black text-purple-600 mt-1">{value}</p>
      <p className="text-xs text-gray-500">{unit}</p>
    </div>
  );

  const BadgeItem = ({ badge, index }) => {
    const earned = badge.earned;
    return (
      <div
        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
          earned
            ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300 shadow-md'
            : 'bg-gray-50 border-gray-200 opacity-60'
        }`}
      >
        <div className="text-4xl mb-2 relative">
          {badge.icon}
          {earned && <span className="absolute -top-1 -right-1 text-sm">✨</span>}
        </div>
        <p className={`text-xs font-bold text-center ${earned ? 'text-amber-900' : 'text-gray-600'}`}>
          {badge.label}
        </p>
        <p className="text-[10px] text-gray-600 text-center mt-1">{badge.description}</p>
        {!earned && badge.progress && (
          <div className="w-full mt-2">
            <div className="w-full bg-gray-300 h-1 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${badge.progress}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-gray-600 mt-1 text-center">{badge.progress}% done</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="glass-card rounded-3xl p-8 border border-amber-100 shadow-lg overflow-hidden relative">
      {/* Decorative background */}
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-gradient-to-br from-yellow-200 to-amber-100 rounded-full blur-3xl opacity-20"></div>

      <div className="relative z-10">
        {/* Header */}
        <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-amber-600" />
          <span>Wellness Achievements & Streaks</span>
        </h3>

        {/* Streaks Section */}
        <div className="mb-8">
          <h4 className="font-semibold text-gray-700 text-sm mb-4 flex items-center space-x-2">
            <Flame className="h-4 w-4 text-orange-600" />
            <span>Current Streaks</span>
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StreakCard icon={CheckCircle2} label="Logging" value={defaultAchievements.logging_streak} unit="days" />
            <StreakCard icon={Flame} label="Hydration" value={defaultAchievements.hydration_streak} unit="days" />
            <StreakCard icon={Award} label="Sleep" value={defaultAchievements.sleep_streak} unit="days" />
            <StreakCard icon={Star} label="Activity" value={defaultAchievements.activity_streak} unit="days" />
          </div>
          <p className="text-xs text-gray-600 mt-3 text-center font-semibold">
            🎉 {defaultAchievements.total_logs} total wellness logs recorded
          </p>
        </div>

        {/* Badges Section */}
        <div>
          <h4 className="font-semibold text-gray-700 text-sm mb-4 flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-600" />
            <span>Badges & Achievements</span>
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {defaultAchievements.badges.map((badge, idx) => (
              <BadgeItem key={idx} badge={badge} index={idx} />
            ))}
          </div>
        </div>

        {/* Milestone Progress */}
        <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-amber-900">Next Milestone: Wellness Guru Badge</p>
              <p className="text-xs text-gray-700 mt-1">Reach 90+ health score</p>
            </div>
            <span className="text-2xl">🌟</span>
          </div>
          <div className="w-full bg-yellow-200 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full" style={{ width: '85%' }}></div>
          </div>
          <p className="text-xs text-gray-700 mt-2">You're 85% of the way there! Keep maintaining your wellness routine.</p>
        </div>
      </div>
    </div>
  );
}
