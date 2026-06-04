import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Heart, Plus, ChevronLeft, ChevronRight, Activity, Thermometer, Info } from 'lucide-react';

export default function CycleTracker({ token, refreshUserData, user }) {
  const [periods, setPeriods] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [painLevel, setPainLevel] = useState('Mild');
  const [flowIntensity, setFlowIntensity] = useState('Normal');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Calendar Navigation State
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const pmsList = [
    'Bloating', 'Cramping', 'Headache', 'Mood Swings', 
    'Fatigue', 'Acne', 'Lower Back Pain', 'Breast Tenderness'
  ];

  useEffect(() => {
    if (token) {
      fetchPeriods();
    }
  }, [token]);

  const fetchPeriods = async () => {
    try {
      const res = await fetch('/api/periods', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPeriods(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSymptomToggle = (symptom) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date.');
      return;
    }

    try {
      const res = await fetch('/api/periods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
          pain_level: painLevel,
          flow_intensity: flowIntensity,
          pms_symptoms: selectedSymptoms
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to save cycle log.');

      setSuccess('Cycle parameters recorded in Digital Twin!');
      setStartDate('');
      setEndDate('');
      setPainLevel('Mild');
      setSelectedSymptoms([]);
      fetchPeriods();
      refreshUserData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Helper: check if date falls in range
  const isDateInRange = (date, startStr, endStr) => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const start = new Date(startStr);
    const end = new Date(endStr);
    // Clear times
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);
    return d >= start && d <= end;
  };

  // Helper: check if date matches specific ISO string date
  const isSameDay = (date, isoStr) => {
    if (!isoStr) return false;
    const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const d2 = new Date(isoStr);
    d1.setHours(0,0,0,0);
    d2.setHours(0,0,0,0);
    return d1.getTime() === d2.getTime();
  };

  // Generate days for Calendar Grid
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    // Fill pre-blanks
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Fill actual days
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const predictions = user?.cycle_predictions || {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Menstrual Intelligence Engine</h1>
          <p className="text-gray-500 text-sm">Log parameters, view average durations, and explore forecasted flow calendars.</p>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl p-5 border border-pink-100 shadow-sm text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Avg Cycle Duration</p>
          <h2 className="text-3xl font-black text-pink-600 mt-1">{predictions.avg_cycle_length || 28} Days</h2>
          <span className="text-[10px] text-gray-400">Regular baseline</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-pink-100 shadow-sm text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Avg Period Flow</p>
          <h2 className="text-3xl font-black text-purple-600 mt-1">{predictions.avg_period_length || 5} Days</h2>
          <span className="text-[10px] text-gray-400">Bleeding duration</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-pink-100 shadow-sm text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Next Period Start</p>
          <h2 className="text-2xl font-black text-pink-500 mt-1.5">
            {predictions.next_period_date 
              ? new Date(predictions.next_period_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : 'Add logs'}
          </h2>
          <span className="text-[10px] text-gray-400">Forecasted start</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-pink-100 shadow-sm text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ovulation Window</p>
          <h2 className="text-2xl font-black text-purple-500 mt-1.5">
            {predictions.ovulation_date 
              ? new Date(predictions.ovulation_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : 'Add logs'}
          </h2>
          <span className="text-[10px] text-gray-400">Peak fertility</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form and Timeline column */}
        <div className="space-y-6">
          
          {/* Logger Form */}
          <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-md">
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center space-x-2">
              <Plus className="h-5 w-5 text-pink-600" />
              <span>Log Period Flow</span>
            </h3>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl text-xs font-medium">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Start Date</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/70 border border-pink-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">End Date</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/70 border border-pink-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Pain Scale</label>
                  <select 
                    value={painLevel}
                    onChange={(e) => setPainLevel(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/70 border border-pink-100 rounded-xl text-sm"
                  >
                    {['Mild', 'Moderate', 'Severe'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Flow Level</label>
                  <select 
                    value={flowIntensity}
                    onChange={(e) => setFlowIntensity(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/70 border border-pink-100 rounded-xl text-sm"
                  >
                    {['Light', 'Normal', 'Heavy'].map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">PMS Symptoms</label>
                <div className="flex flex-wrap gap-2">
                  {pmsList.map(sym => {
                    const isSelected = selectedSymptoms.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => handleSymptomToggle(sym)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${isSelected ? 'bg-pink-500 border-pink-500 text-white shadow-sm' : 'bg-white border-pink-100 text-gray-500'}`}
                      >
                        {sym}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold shadow-md hover:opacity-90 transition active:scale-98 text-sm"
              >
                Log Cycle Parameters
              </button>
            </form>
          </div>

        </div>

        {/* Calendar grid view */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-md">
            
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-pink-600" />
                <h3 className="font-bold text-gray-800 text-md">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
              </div>
              
              <div className="flex items-center space-x-2">
                <button onClick={prevMonth} className="p-2 hover:bg-pink-50 text-pink-600 rounded-xl transition">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={nextMonth} className="p-2 hover:bg-pink-50 text-pink-600 rounded-xl transition">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-2">{d}</div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {getDaysInMonth().map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="aspect-square bg-gray-50/20 rounded-xl"></div>;
                
                let isLoggedFlow = false;
                let isPredictedFlow = false;
                let isPredictedOvulation = false;
                let isFertile = false;

                // Check logged period ranges
                periods.forEach(p => {
                  if (isDateInRange(day, p.start_date, p.end_date)) {
                    isLoggedFlow = true;
                  }
                });

                // Check cycle forecasts
                if (predictions.next_period_date) {
                  // Assume bleeding lasts average bleeding duration or default 5 days
                  const avgBleeding = predictions.avg_period_length || 5;
                  const predStart = new Date(predictions.next_period_date);
                  const predEnd = new Date(predStart.getTime() + (avgBleeding - 1) * 24 * 60 * 60 * 1000);
                  
                  if (day >= predStart && day <= predEnd) {
                    isPredictedFlow = true;
                  }
                }

                if (isSameDay(day, predictions.ovulation_date)) {
                  isPredictedOvulation = true;
                }

                if (predictions.fertility_start && predictions.fertility_end) {
                  if (isDateInRange(day, predictions.fertility_start, predictions.fertility_end)) {
                    isFertile = true;
                  }
                }

                const dayNum = day.getDate();
                const isToday = isSameDay(day, new Date().toISOString());

                // Style logic
                let cellClass = "bg-white/50 border border-gray-100 hover:bg-pink-50/50 ";
                if (isLoggedFlow) cellClass = "bg-pink-500 text-white border-pink-500 font-bold ";
                else if (isPredictedFlow) cellClass = "bg-pink-100 text-pink-700 border-pink-200 border-dashed font-semibold ";
                else if (isPredictedOvulation) cellClass = "bg-purple-600 text-white border-purple-600 font-bold ";
                else if (isFertile) cellClass = "bg-purple-100 text-purple-700 border-purple-200 font-semibold ";
                else if (isToday) cellClass = "border-2 border-pink-600 font-bold text-pink-600 ";

                return (
                  <div 
                    key={day.toISOString()} 
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-xs relative cursor-pointer shadow-sm transition-all duration-200 ${cellClass}`}
                  >
                    <span>{dayNum}</span>
                    
                    {/* Micro tags / Dots for overlaps */}
                    {isLoggedFlow && <div className="w-1 h-1 bg-white rounded-full absolute bottom-1.5"></div>}
                    {isFertile && !isPredictedOvulation && <div className="w-1.5 h-1.5 bg-purple-500 rounded-full absolute bottom-1.5"></div>}
                  </div>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-pink-500 rounded-lg"></div>
                <span>Logged Flow</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-pink-100 border border-pink-200 border-dashed rounded-lg"></div>
                <span>Forecasted Period</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-600 rounded-lg"></div>
                <span>Peak Ovulation</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-100 border border-purple-200 rounded-lg"></div>
                <span>Fertility Window</span>
              </div>
            </div>

          </div>

          {/* Guidelines info */}
          <div className="glass-card rounded-2xl p-4 border border-pink-50 bg-pink-50/20 flex items-start space-x-3">
            <Info className="h-5 w-5 text-pink-600 mt-0.5" />
            <div>
              <h5 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-1">Cycle Forecasting Guidelines</h5>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                HERBUDDY uses clinical calendar computation. Average cycle boundaries are based on the variance of last log intervals. 
                Keep tracking monthly period dates to optimize the digital twin forecast indicators.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
