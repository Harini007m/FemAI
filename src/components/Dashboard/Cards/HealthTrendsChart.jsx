import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
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

export default function HealthTrendsChart({ trendData = {} }) {
  const defaultData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    cycleLength: [28, 28, 28, 28, 28, 28, 28],
    painTrend: [6, 5, 4, 3, 4, 5, 4],
    healthScore: [78, 80, 82, 81, 84, 82, 85],
    wellnessScore: [75, 76, 78, 80, 82, 81, 83],
    hydrationHistory: [1.8, 2.0, 2.2, 2.5, 2.3, 2.1, 2.4],
    ...trendData
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom', labels: { font: { family: 'Inter', size: 12 } } },
      tooltip: {
        backgroundColor: '#1f2937',
        titleFont: { family: 'Outfit', size: 12 },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        min: 0,
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

  const healthScoreData = {
    labels: defaultData.labels,
    datasets: [
      {
        label: 'Health Score',
        data: defaultData.healthScore,
        borderColor: '#db2777',
        backgroundColor: 'rgba(219, 39, 119, 0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#db2777',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
        borderWidth: 2
      },
      {
        label: 'Wellness Score',
        data: defaultData.wellnessScore,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#7c3aed',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
        borderWidth: 2
      }
    ]
  };

  const painTrendData = {
    labels: defaultData.labels,
    datasets: [
      {
        label: 'Pain Level (Severity)',
        data: defaultData.painTrend,
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#f97316',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
        borderWidth: 2
      }
    ]
  };

  const hydrationData = {
    labels: defaultData.labels,
    datasets: [
      {
        label: 'Water Intake (Liters)',
        data: defaultData.hydrationHistory,
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="glass-card rounded-3xl p-8 border border-teal-100 shadow-lg overflow-hidden relative">
      {/* Decorative background */}
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-gradient-to-br from-teal-200 to-cyan-100 rounded-full blur-3xl opacity-20"></div>

      <div className="relative z-10">
        {/* Header */}
        <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-teal-600" />
          <span>Health Trends & Analytics</span>
        </h3>

        {/* Charts Grid */}
        <div className="space-y-8">
          {/* Health & Wellness Scores */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-700 text-sm flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-pink-600" />
                <span>Health Score Trends</span>
              </h4>
              <span className="text-xs text-gray-500 font-semibold">7-Day Average</span>
            </div>
            <div className="h-64 bg-white/30 rounded-2xl p-4 backdrop-blur-sm">
              <Line data={healthScoreData} options={chartOptions} />
            </div>
          </div>

          {/* Pain Trends */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-700 text-sm flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span>Pain Level Trends</span>
              </h4>
              <span className="text-xs text-gray-500 font-semibold">📉 Improving</span>
            </div>
            <div className="h-56 bg-white/30 rounded-2xl p-4 backdrop-blur-sm">
              <Line data={painTrendData} options={chartOptions} />
            </div>
          </div>

          {/* Hydration History */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-700 text-sm flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-cyan-600" />
                <span>Hydration History</span>
              </h4>
              <span className="text-xs text-green-600 font-bold">↑ 12% increase</span>
            </div>
            <div className="h-56 bg-white/30 rounded-2xl p-4 backdrop-blur-sm">
              <Line data={hydrationData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200">
          <p className="text-sm text-gray-700">
            <span className="font-bold text-teal-700">📊 Insight: </span>
            Your health scores show positive momentum! Keep maintaining consistent hydration and sleep patterns for continued improvement.
          </p>
        </div>
      </div>
    </div>
  );
}
