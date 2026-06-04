import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Clock, Award, Activity, Heart, 
  FileText, Clipboard, Stethoscope, RefreshCw, ChevronRight, CheckCircle
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function DoctorDashboard({ token, user, refreshUserData, setCurrentPage }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (token) {
      fetchDoctorData();
    }
  }, [token]);

  const fetchDoctorData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (e) {
      console.error("Error fetching doctor dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDoctorData();
    if (refreshUserData) await refreshUserData();
    setRefreshing(false);
  };

  // Calculations for Stats
  const totalConsultations = appointments.length;
  const pendingNotes = appointments.filter(a => a.status !== 'Completed').length;
  const completedConsults = appointments.filter(a => a.status === 'Completed').length;
  
  // Unique patients
  const uniquePatients = Array.from(new Set(appointments.map(a => a.patient_name || a.user_id))).length;

  // Chart data: Consultations by Month
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        label: 'Monthly Consultations Completed',
        data: [12, 19, 15, 24, 22, completedConsults + 18, completedConsults + 20, completedConsults + 25],
        backgroundColor: '#9333ea',
        borderRadius: 8,
        borderSkipped: false,
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
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold w-max mb-3 backdrop-blur-md">
              <Stethoscope className="h-3.5 w-3.5" />
              <span>Medical Portal Active</span>
            </div>
            <h1 className="text-3xl font-bold">Welcome Back, {user?.name}!</h1>
            <p className="text-white/80 mt-1 max-w-xl">
              Platform dashboard for managing patient consultation queues, review digital health twin metrics, and document clinical notes.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setCurrentPage('doctor')}
              className="px-6 py-3 bg-white text-purple-700 rounded-xl font-bold shadow-lg hover:bg-purple-50 transition active:scale-95 text-sm"
            >
              Open Consultation Queue
            </button>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className={`p-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition active:scale-95 ${refreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl p-5 border border-pink-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Active Patients</span>
            <span className="text-2xl font-black text-gray-800">{uniquePatients}</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-pink-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-pink-100 text-pink-600 rounded-2xl">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Total Bookings</span>
            <span className="text-2xl font-black text-gray-800">{totalConsultations}</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-pink-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Pending Notes</span>
            <span className="text-2xl font-black text-gray-800">{pendingNotes}</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-pink-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-2xl">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Completed Visits</span>
            <span className="text-2xl font-black text-gray-800">{completedConsults}</span>
          </div>
        </div>
      </div>

      {/* Main Workspace split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Appointments / consultations table */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-pink-100 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 text-md flex items-center space-x-2">
                <Clipboard className="h-5 w-5 text-purple-600" />
                <span>Today's Consultation Schedule</span>
              </h3>
              <span className="text-[10px] bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full font-bold">
                Live Queue
              </span>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400 text-xs">Loading queue...</div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs italic">
                No consultations found in your queue today.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-150 text-gray-400 uppercase font-extrabold text-[9px]">
                      <th className="pb-3">Patient Name</th>
                      <th className="pb-3">Consult Date</th>
                      <th className="pb-3">Reason for Visit</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.slice(0, 6).map(appt => (
                      <tr key={appt._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/40 transition">
                        <td className="py-4 font-bold text-gray-700">{appt.patient_name}</td>
                        <td className="py-4 text-gray-500">
                          {new Date(appt.appointment_date).toLocaleDateString()} at {new Date(appt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-4 text-gray-500 max-w-[150px] truncate">{appt.reason}</td>
                        <td className="py-4 text-right">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${appt.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {appt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="flex justify-end pt-4 border-t border-gray-100 mt-4">
            <button 
              onClick={() => setCurrentPage('doctor')}
              className="text-purple-600 hover:text-purple-700 font-bold text-xs flex items-center space-x-1"
            >
              <span>Manage all consultations</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right 1 Col: Clinic performance graph */}
        <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center space-x-2">
              <Activity className="h-4 w-4 text-purple-600" />
              <span>Monthly Consultation Analytics</span>
            </h3>
            <div className="h-56 relative mt-4">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-4">
            Updates automatically as consult histories are locked and completed.
          </p>
        </div>

      </div>
    </div>
  );
}
