import React, { useState, useEffect } from 'react';
import { 
  Heart, Calendar, Droplets, Flame, Activity, TrendingUp, 
  Moon, Award, AlertCircle, Sparkles, User, RefreshCw
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard({ token, user, refreshUserData, setCurrentPage }) {
  const [alerts, setAlerts] = useState([]);
  const [quickWater, setQuickWater] = useState(user?.profile?.lifestyle_info?.water_intake || 2.0);
  const [quickSleep, setQuickSleep] = useState(user?.profile?.lifestyle_info?.sleep_hours || 7.5);
  const [quickMood, setQuickMood] = useState('Happy');
  const [quickStress, setQuickStress] = useState('Medium');
  const [logSuccess, setLogSuccess] = useState('');
  const [wellnessLogs, setWellnessLogs] = useState([]);

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
      console.error(e);
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
      console.error(e);
    }
  };

  const handleQuickLog = async () => {
    setLogSuccess('');
    try {
      const res = await fetch('/api/wellness/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          water_intake: Number(quickWater),
          sleep_hours: Number(quickSleep),
          mood: quickMood,
          stress_level: quickStress,
          date: new Date().toISOString().split('T')[0]
        })
      });
      if (res.ok) {
        setLogSuccess('Daily health logged! Digital Twin synchronized.');
        refreshUserData();
        fetchWellnessHistory();
        setTimeout(() => setLogSuccess(''), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAlertAsRead = async (id) => {
    try {
      const res = await fetch(`/api/alerts/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAlerts(alerts.filter(a => a._id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const score = user?.health_score || 82;
  const breakdown = user?.health_score_breakdown || {
    cycle_health: 85,
    nutrition: 80,
    hydration: 75,
    sleep: 80,
    wellness: 80
  };

  // Determine avatar color states based on score
  const getTwinColor = () => {
    if (score >= 85) return 'text-green-500 fill-green-100 border-green-200';
    if (score >= 70) return 'text-pink-500 fill-pink-100 border-pink-200';
    return 'text-amber-500 fill-amber-100 border-amber-200';
  };

  // Prepare chart data
  const chartDates = wellnessLogs.map(l => l.date).slice(-7);
  const chartScores = wellnessLogs.map(l => {
    // Generate simulated aggregate score if not present in log
    const water = l.water_intake || 2.0;
    const sleep = l.sleep_hours || 7.5;
    const stress = l.stress_level === 'Low' ? 100 : l.stress_level === 'Medium' ? 80 : 50;
    return Math.round((water / 2.5) * 20 + (sleep / 8.0) * 30 + stress * 0.5);
  }).slice(-7);

  // If no logs, fallback to static weekly trend
  const chartData = {
    labels: chartDates.length > 0 ? chartDates : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Health Twin Index',
        data: chartScores.length > 0 ? chartScores : [78, 80, 82, 81, 84, 82, 85],
        fill: true,
        borderColor: '#db2777',
        backgroundColor: 'rgba(219, 39, 119, 0.08)',
        tension: 0.4,
        pointBackgroundColor: '#7c3aed',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        titleFont: { family: 'Outfit', size: 12 },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 10,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        min: 40,
        max: 100,
        grid: { color: 'rgba(0,0,0,0.03)' },
        ticks: { font: { family: 'Inter' } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter' } }
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* 1. Welcoming Hero Banner */}
      <div className="primary-gradient rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold w-max mb-3 backdrop-blur-md">
              <Sparkles className="h-3 w-3 animate-spin" />
              <span>Digital Twin Engine Active</span>
            </div>
            <h1 className="text-3xl font-bold">Hello, {user?.name}!</h1>
            <p className="text-white/80 mt-1 max-w-xl">
              Welcome back to your personalized care dashboard. Your Health Score has improved by +2% since last week. Let's synchronize today's logs.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setCurrentPage('chatbot')}
              className="px-6 py-3 bg-white text-pink-600 rounded-xl font-bold shadow-lg hover:bg-pink-50 transition active:scale-95 text-sm"
            >
              Consult AI Assistant
            </button>
            <button 
              onClick={refreshUserData}
              className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition active:rotate-185"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Notifications & Forecast Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-gray-400 tracking-wider uppercase">Active Notifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((a) => (
              <div key={a._id} className="glass-card border-l-4 border-pink-500 rounded-2xl p-4 flex items-start justify-between shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-pink-50 text-pink-600 rounded-xl mt-0.5">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{a.title}</h4>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">{a.message}</p>
                  </div>
                </div>
                <button 
                  onClick={() => markAlertAsRead(a._id)}
                  className="text-xs text-gray-400 hover:text-pink-600 font-semibold ml-2 transition"
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Main Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Col 1: Smart Health Score & Digital Twin Avatar */}
        <div className="glass-card rounded-3xl p-6 border border-pink-100 flex flex-col justify-between shadow-md relative overflow-hidden">
          <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center space-x-2">
            <Award className="h-5 w-5 text-pink-600" />
            <span>Digital Twin Health Index</span>
          </h3>

          <div className="flex flex-col items-center py-4">
            {/* Pulsing Avatar */}
            <div className={`w-36 h-36 rounded-full border-4 flex items-center justify-center relative ${getTwinColor()} bg-white/70 shadow-lg`}>
              <svg className="w-24 h-24 text-pink-500 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l1.244 5.496L12 9l1.756 5.496L15 9M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                <circle cx="12" cy="12" r="5" className="stroke-pink-400 stroke-dasharray-[2,2] animate-spin" />
              </svg>
              
              <div className="absolute -bottom-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black px-4 py-1.5 rounded-full text-lg shadow-md border-2 border-white">
                {score}
              </div>
            </div>
            
            <p className="text-gray-500 text-xs font-semibold uppercase mt-6 tracking-wide">
              {score >= 85 ? 'Excellent Health State' : score >= 70 ? 'Optimal Hormonal State' : 'Hormonal Imbalance Flagged'}
            </p>
          </div>

          {/* Breakdown meters */}
          <div className="space-y-3.5 mt-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                <span>Cycle Regularity</span>
                <span>{breakdown.cycle_health}%</span>
              </div>
              <div className="w-full bg-gray-150 h-2 rounded-full overflow-hidden">
                <div className="bg-pink-500 h-full rounded-full transition-all duration-500" style={{ width: `${breakdown.cycle_health}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                <span>Nutrition Intake</span>
                <span>{breakdown.nutrition}%</span>
              </div>
              <div className="w-full bg-gray-150 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${breakdown.nutrition}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                <span>Hydration (Water)</span>
                <span>{breakdown.hydration}%</span>
              </div>
              <div className="w-full bg-gray-150 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-400 h-full rounded-full transition-all duration-500" style={{ width: `${breakdown.hydration}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                <span>Sleep Quality</span>
                <span>{breakdown.sleep}%</span>
              </div>
              <div className="w-full bg-gray-150 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${breakdown.sleep}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Col 2: Predicted Cycle Forecast & Health Score Trend */}
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          
          {/* Top Panel: Predicted dates card */}
          <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-pink-50 text-pink-600 rounded-2xl shadow-inner">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase">Next Period</p>
                <h4 className="font-bold text-gray-800 text-md">
                  {user?.cycle_predictions?.next_period_date 
                    ? new Date(user.cycle_predictions.next_period_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'Log cycle data'}
                </h4>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl shadow-inner">
                <Flame className="h-6 w-6" />
              </div>
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase">Ovulation Window</p>
                <h4 className="font-bold text-gray-800 text-md">
                  {user?.cycle_predictions?.ovulation_date 
                    ? new Date(user.cycle_predictions.ovulation_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'Pending logs'}
                </h4>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl shadow-inner">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase">Cycle Regularity</p>
                <h4 className="font-bold text-gray-800 text-md">
                  {user?.cycle_predictions?.irregular_detected ? 'Irregular Cycle Warning' : 'Healthy / Stable'}
                </h4>
              </div>
            </div>
          </div>

          {/* Bottom Panel: Interactive Trend line chart */}
          <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-sm flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-sm flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span>Weekly Digital Twin Score Trend</span>
              </h3>
              <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-bold">7-Day Span</span>
            </div>
            
            <div className="h-56 relative">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

        </div>
      </div>

      {/* 4. Quick Daily Health Logger */}
      <div className="glass-card rounded-3xl p-8 border border-pink-100 shadow-md">
        <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center space-x-2">
          <Activity className="h-5 w-5 text-pink-600" />
          <span>Synchronize Digital Twin Stats</span>
        </h3>

        {logSuccess && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl text-sm font-medium">{logSuccess}</div>}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Water log */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center space-x-1">
              <Droplets className="h-4 w-4 text-blue-400 fill-blue-400" />
              <span>Hydration (Liters)</span>
            </label>
            <div className="flex items-center space-x-2">
              <input 
                type="number" 
                step="0.25"
                min="0"
                max="10"
                value={quickWater}
                onChange={(e) => setQuickWater(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/70 border border-pink-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <button 
                onClick={() => setQuickWater(prev => (Number(prev) + 0.25).toFixed(2))}
                className="px-3 py-2.5 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-xl font-bold transition text-xs"
              >
                +250ml
              </button>
            </div>
          </div>

          {/* Sleep hours */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center space-x-1">
              <Moon className="h-4 w-4 text-indigo-400 fill-indigo-400" />
              <span>Sleep Hours</span>
            </label>
            <input 
              type="number" 
              step="0.5"
              min="0"
              max="24"
              value={quickSleep}
              onChange={(e) => setQuickSleep(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/70 border border-pink-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          {/* Mood status */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Current Mood</label>
            <select 
              value={quickMood}
              onChange={(e) => setQuickMood(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/70 border border-pink-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              {['Happy', 'Neutral', 'Sad', 'Anxious', 'Irritable', 'Fatigued'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Stress Level */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Stress Level</label>
            <select 
              value={quickStress}
              onChange={(e) => setQuickStress(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/70 border border-pink-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              {['Low', 'Medium', 'High'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button 
            onClick={handleQuickLog}
            className="px-8 py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:opacity-90 transform transition active:scale-95"
          >
            Update Sync Log
          </button>
        </div>
      </div>

    </div>
  );
}
