import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';

// Import all card components
import HealthScoreCard from '../components/Dashboard/Cards/HealthScoreCard';
import CycleOverviewCard from '../components/Dashboard/Cards/CycleOverviewCard';
import WellnessTrackerCard from '../components/Dashboard/Cards/WellnessTrackerCard';
import RiskAssessmentCard from '../components/Dashboard/Cards/RiskAssessmentCard';
import AlertNotificationsBanner from '../components/Dashboard/Cards/AlertNotificationsBanner';
import AIDailySummaryCard from '../components/Dashboard/Cards/AIDailySummaryCard';
import SymptomSnapshotCard from '../components/Dashboard/Cards/SymptomSnapshotCard';
import RecommendationsCarousel from '../components/Dashboard/Cards/RecommendationsCarousel';
import HealthTrendsChart from '../components/Dashboard/Cards/HealthTrendsChart';
import AchievementBadgeSection from '../components/Dashboard/Cards/AchievementBadgeSection';
import ReportsAndDoctorAccessCard from '../components/Dashboard/Cards/ReportsAndDoctorAccessCard';
import FloatingActionMenu from '../components/Dashboard/Sections/FloatingActionMenu';

export default function Dashboard({ token, user, refreshUserData, setCurrentPage }) {
  const [alerts, setAlerts] = useState([]);
  const [wellnessLogs, setWellnessLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchAlerts();
      fetchWellnessHistory();
    }
  }, [token]);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/alerts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.filter(a => !a.read));
      }
    } catch (e) {
      console.error('Error fetching alerts:', e);
    }
  };

  const fetchWellnessHistory = async () => {
    try {
      const res = await fetch('/api/wellness/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWellnessLogs(data);
      }
    } catch (e) {
      console.error('Error fetching wellness history:', e);
    }
  };

  const handleDismissAlert = (index) => {
    setAlerts(alerts.filter((_, i) => i !== index));
  };

  const handleFloatingAction = (action) => {
    const actions = {
      onLogSymptoms: () => setCurrentPage('chatbot'),
      onAddCycleData: () => setCurrentPage('cycle'),
      onChatAI: () => setCurrentPage('chatbot'),
      onUpdateMetrics: () => setCurrentPage('wellness'),
      onGenerateReport: () => setCurrentPage('reports')
    };
    actions[action]?.();
  };

  const score = user?.health_score || 82;
  const breakdown = user?.health_score_breakdown || {
    cycle_health: 85,
    nutrition: 80,
    hydration: 75,
    sleep: 80,
    wellness: 80
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-purple-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* ===== 1. HERO BANNER ===== */}
        <div className="primary-gradient rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center space-x-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold w-max mb-3 backdrop-blur-md">
                <Sparkles className="h-3 w-3 animate-spin" />
                <span>Digital Twin Engine Active</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black mb-2">Hello, {user?.name}! 👋</h1>
              <p className="text-white/90 max-w-2xl leading-relaxed">
                Welcome back to your personalized healthcare dashboard. Your Health Score has improved by <span className="font-bold">+2%</span> since last week. Let's continue your wellness journey together.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setCurrentPage('chatbot')}
                className="px-6 py-3 bg-white text-pink-600 rounded-xl font-bold shadow-lg hover:bg-pink-50 transition active:scale-95 text-sm whitespace-nowrap"
              >
                💬 Ask AI Coach
              </button>
              <button 
                onClick={refreshUserData}
                className={`p-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition active:rotate-180 ${isLoading ? 'animate-spin' : ''}`}
                title="Refresh data"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* ===== 2. HEALTH ALERTS & NOTIFICATIONS ===== */}
        {alerts.length > 0 && (
          <AlertNotificationsBanner alerts={alerts} onDismiss={handleDismissAlert} />
        )}

        {/* ===== 3. HERO HEALTH SUMMARY SECTION ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Score Card */}
          <div className="lg:col-span-1">
            <HealthScoreCard score={score} breakdown={breakdown} user={user} />
          </div>

          {/* Cycle Overview Card */}
          <div className="lg:col-span-2">
            <CycleOverviewCard
              cycleData={{ current_day: 8, cycle_length: 28 }}
              predictions={user?.cycle_predictions || {}}
            />
          </div>
        </div>

        {/* ===== 4. AI DAILY HEALTH SUMMARY ===== */}
        <AIDailySummaryCard
          user={user}
          cyclePhase="Follicular"
          summary=""
        />

        {/* ===== 5. WELLNESS TRACKER & RISK ASSESSMENT ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WellnessTrackerCard wellnessData={{
            water_intake: user?.profile?.lifestyle_info?.water_intake || 2.0,
            sleep_hours: user?.profile?.lifestyle_info?.sleep_hours || 7.5,
            mood: 'Happy'
          }} />
          <RiskAssessmentCard risks={{}} />
        </div>

        {/* ===== 6. SYMPTOM SNAPSHOT & RECOMMENDATIONS ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SymptomSnapshotCard symptoms={{}} />
          <RecommendationsCarousel recommendations={[]} />
        </div>

        {/* ===== 7. HEALTH TRENDS ANALYTICS ===== */}
        <HealthTrendsChart trendData={{}} />

        {/* ===== 8. WELLNESS ACHIEVEMENTS & STREAKS ===== */}
        <AchievementBadgeSection achievements={{}} />

        {/* ===== 9. REPORTS & DOCTOR ACCESS ===== */}
        <ReportsAndDoctorAccessCard reports={{}} consultations={[]} />

      </div>

      {/* ===== FLOATING ACTION MENU ===== */}
      <FloatingActionMenu
        actions={{
          onLogSymptoms: () => handleFloatingAction('onLogSymptoms'),
          onAddCycleData: () => handleFloatingAction('onAddCycleData'),
          onChatAI: () => handleFloatingAction('onChatAI'),
          onUpdateMetrics: () => handleFloatingAction('onUpdateMetrics'),
          onGenerateReport: () => handleFloatingAction('onGenerateReport'),
        }}
      />
    </div>
  );
}
