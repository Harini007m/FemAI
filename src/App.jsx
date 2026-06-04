import React, { useState, useEffect } from 'react';
import { 
  Heart, LayoutDashboard, Calendar, Activity, 
  Brain, MessageSquare, Stethoscope, FileText, 
  LogOut, LogIn, Users, Server, ShieldCheck, Sparkles 
} from 'lucide-react';

// Import Views
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import CycleTracker from './pages/CycleTracker';
import HealthAssessments from './pages/HealthAssessments';
import WellnessNutrition from './pages/WellnessNutrition';
import Chatbot from './pages/Chatbot';
import DoctorPortal from './pages/DoctorPortal';
import Reports from './pages/Reports';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('herbuddy_token') || '');
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [roleMode, setRoleMode] = useState('patient'); // for testing multiple roles: patient, doctor, admin
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      setRoleMode(user.role);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        // Token expired/invalid
        handleLogout();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('herbuddy_token');
    localStorage.removeItem('herbuddy_user');
    setCurrentPage('dashboard');
  };

  // Instantly toggle role mode for testing admin/doctor dashboards
  const handleRoleOverride = (newRole) => {
    setRoleMode(newRole);
    if (newRole === 'admin') {
      setCurrentPage('admin_dashboard');
    } else if (currentPage === 'admin_dashboard') {
      setCurrentPage('dashboard');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['patient', 'doctor'] },
    { id: 'cycle', label: 'Menstrual Intelligence', icon: Calendar, roles: ['patient'] },
    { id: 'assessments', label: 'AI Risk Predictors', icon: Activity, roles: ['patient'] },
    { id: 'wellness', label: 'Wellness & Nutrition', icon: Brain, roles: ['patient'] },
    { id: 'chatbot', label: 'AI Health Chat', icon: MessageSquare, roles: ['patient'] },
    { id: 'doctor', label: 'Doctor Consultation', icon: Stethoscope, roles: ['patient', 'doctor'] },
    { id: 'reports', label: 'Health Reports', icon: FileText, roles: ['patient'] },
  ];

  const adminMenuItems = [
    { id: 'admin_dashboard', label: 'System Admin Panel', icon: ShieldCheck }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row pink-purple-gradient text-gray-800">
      
      {/* Mobile Top Navbar */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-pink-100 relative z-40 w-full">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => {
          setCurrentPage('dashboard');
          setIsMobileMenuOpen(false);
        }}>
          <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl shadow-md">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-gray-800 tracking-tight block">HERBUDDY</span>
            <span className="text-[8px] text-pink-600 font-extrabold tracking-wider uppercase">DIGITAL TWIN 2.0</span>
          </div>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600 hover:text-pink-600 focus:outline-none"
        >
          {isMobileMenuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Backdrop for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/25 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* 1. Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white/95 backdrop-blur-md border-r border-pink-100 
        flex flex-col justify-between p-6 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:flex md:bg-white/70
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8 cursor-pointer" onClick={() => {
            setCurrentPage('dashboard');
            setIsMobileMenuOpen(false);
          }}>
            <div className="p-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl shadow-md">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-gray-800 tracking-tight block">HERBUDDY</span>
              <span className="text-[10px] text-pink-600 font-extrabold tracking-wider uppercase">DIGITAL TWIN 2.0</span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="space-y-1.5">
            {token ? (
              <>
                {menuItems.filter(item => item.roles.includes(roleMode)).map(item => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentPage(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${isActive ? 'bg-pink-500 text-white shadow-md shadow-pink-200' : 'text-gray-500 hover:bg-pink-50/50 hover:text-pink-600'}`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}

                {roleMode === 'admin' && adminMenuItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentPage(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${isActive ? 'bg-purple-600 text-white shadow-md' : 'text-purple-600 hover:bg-purple-50 hover:text-purple-700'}`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </>
            ) : (
              <p className="text-[10px] text-gray-400 italic px-2">Please login to configure your digital twin features.</p>
            )}
          </nav>
        </div>

        {/* Profile Card and Action */}
        <div className="mt-8 border-t border-pink-100 pt-6">
          {token && user ? (
            <div className="space-y-4">
              {/* Account profile link */}
              <div 
                onClick={() => {
                  setCurrentPage('auth');
                  setIsMobileMenuOpen(false);
                }} 
                className="flex items-center space-x-3 p-2 hover:bg-pink-50/40 rounded-2xl cursor-pointer transition"
              >
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                  {user.name[0].toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-gray-800 truncate">{user.name}</h4>
                  <span className="text-[9px] text-gray-400 font-semibold uppercase">{roleMode} mode</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 hover:bg-red-100/50 text-red-600 rounded-xl text-xs font-bold transition"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Log Out Session</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => {
                setCurrentPage('auth');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition"
            >
              <LogIn className="h-4.5 w-4.5" />
              <span>Sign In / Sign Up</span>
            </button>
          )}
        </div>
      </aside>

      {/* 2. Main Page Wrap */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Panel (Role switches for test reviewers) */}
        <header className="px-8 py-4 bg-white/40 backdrop-blur-md border-b border-pink-50 flex flex-col md:flex-row md:items-center justify-between gap-4 z-20">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hormone Sync status:</span>
            <span className="bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-green-200">
              Twin Synced
            </span>
          </div>

          {/* Interactive tester switcher */}
          {token && (
            <div className="flex items-center space-x-2 bg-white/70 p-1.5 rounded-2xl border border-pink-100 shadow-sm text-xs">
              <span className="text-[10px] text-gray-500 font-bold uppercase px-2">Role Overrides:</span>
              <button 
                onClick={() => handleRoleOverride('patient')}
                className={`px-3 py-1 rounded-xl text-[10px] font-bold transition ${roleMode === 'patient' ? 'bg-pink-500 text-white' : 'text-gray-500 hover:bg-gray-150'}`}
              >
                Patient
              </button>
              <button 
                onClick={() => handleRoleOverride('doctor')}
                className={`px-3 py-1 rounded-xl text-[10px] font-bold transition ${roleMode === 'doctor' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-150'}`}
              >
                Doctor
              </button>
              <button 
                onClick={() => handleRoleOverride('admin')}
                className={`px-3 py-1 rounded-xl text-[10px] font-bold transition ${roleMode === 'admin' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-150'}`}
              >
                System Admin
              </button>
            </div>
          )}
        </header>

        {/* 3. Main Views router */}
        <main className="flex-1 overflow-y-auto">
          {!token ? (
            <Auth 
              token={token} 
              setToken={setToken} 
              user={user} 
              setUser={setUser} 
              setCurrentPage={setCurrentPage} 
            />
          ) : (
            <>
              {currentPage === 'dashboard' && (
                roleMode === 'doctor' ? (
                  <DoctorDashboard 
                    token={token} 
                    user={user} 
                    refreshUserData={fetchUserProfile} 
                    setCurrentPage={setCurrentPage}
                  />
                ) : (
                  <Dashboard 
                    token={token} 
                    user={user} 
                    refreshUserData={fetchUserProfile} 
                    setCurrentPage={setCurrentPage}
                  />
                )
              )}
              {currentPage === 'cycle' && (
                <CycleTracker 
                  token={token} 
                  user={user}
                  refreshUserData={fetchUserProfile}
                />
              )}
              {currentPage === 'assessments' && (
                <HealthAssessments 
                  token={token} 
                  user={user} 
                  refreshUserData={fetchUserProfile}
                />
              )}
              {currentPage === 'wellness' && (
                <WellnessNutrition 
                  token={token} 
                  user={user} 
                  refreshUserData={fetchUserProfile}
                />
              )}
              {currentPage === 'chatbot' && (
                <Chatbot 
                  token={token} 
                  user={user}
                />
              )}
              {currentPage === 'doctor' && (
                <DoctorPortal 
                  token={token} 
                  user={user}
                />
              )}
              {currentPage === 'reports' && (
                <Reports 
                  token={token} 
                  user={user}
                />
              )}
              {currentPage === 'auth' && (
                <Auth 
                  token={token} 
                  setToken={setToken} 
                  user={user} 
                  setUser={setUser} 
                  setCurrentPage={setCurrentPage} 
                />
              )}

              {/* ADMIN MODULE */}
              {currentPage === 'admin_dashboard' && roleMode === 'admin' && (
                <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
                  <div>
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">System Admin Workspace</h1>
                    <p className="text-gray-500 text-sm">Monitor platform metrics, query clinical registers, and review system hardware performance.</p>
                  </div>

                  {/* Diagnostic stats cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="glass-card rounded-2xl p-5 border border-pink-100 shadow-sm text-center">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Registered Patients</p>
                      <h2 className="text-3xl font-black text-pink-600 mt-1">1,489</h2>
                      <span className="text-[9px] text-green-600">+12 this week</span>
                    </div>

                    <div className="glass-card rounded-2xl p-5 border border-pink-100 shadow-sm text-center">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Licensed Doctors</p>
                      <h2 className="text-3xl font-black text-purple-600 mt-1">24</h2>
                      <span className="text-[9px] text-gray-400">On duty panel</span>
                    </div>

                    <div className="glass-card rounded-2xl p-5 border border-pink-100 shadow-sm text-center">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">System CPU Load</p>
                      <h2 className="text-3xl font-black text-blue-600 mt-1">4.2%</h2>
                      <span className="text-[9px] text-green-600">Stable latency</span>
                    </div>

                    <div className="glass-card rounded-2xl p-5 border border-pink-100 shadow-sm text-center">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Server Status</p>
                      <h2 className="text-2xl font-black text-emerald-600 mt-1.5">Online</h2>
                      <span className="text-[9px] text-gray-400">WS-SSL Secure</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User Management Panel */}
                    <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-pink-100 shadow-md">
                      <h3 className="font-bold text-gray-800 text-md mb-4 flex items-center space-x-2">
                        <Users className="h-5 w-5 text-pink-600" />
                        <span>Platform User Registries</span>
                      </h3>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-gray-150 text-gray-400 uppercase font-extrabold text-[9px]">
                              <th className="pb-3">User ID</th>
                              <th className="pb-3">Name</th>
                              <th className="pb-3">Role</th>
                              <th className="pb-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { id: user?._id || 'hb-u-001', name: user?.name || 'Jane Doe', role: 'admin' },
                              { id: 'hb-u-002', name: 'Dr. Sarah Connor', role: 'doctor' },
                              { id: 'hb-u-003', name: 'Dr. Emily Vance', role: 'doctor' },
                              { id: 'hb-u-004', name: 'Mia Peterson', role: 'patient' },
                              { id: 'hb-u-005', name: 'Clara Oswald', role: 'patient' }
                            ].map(reg => (
                              <tr key={reg.id} className="border-b border-gray-100 last:border-0">
                                <td className="py-3.5 font-mono text-[10px] text-gray-400">{reg.id}</td>
                                <td className="py-3.5 font-bold text-gray-700">{reg.name}</td>
                                <td className="py-3.5">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${reg.role === 'admin' ? 'bg-blue-50 text-blue-700' : reg.role === 'doctor' ? 'bg-purple-50 text-purple-700' : 'bg-pink-50 text-pink-700'}`}>
                                    {reg.role}
                                  </span>
                                </td>
                                <td className="py-3.5">
                                  <button className="text-pink-600 hover:underline font-bold text-[10px]">Suspend</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Hardware Monitor */}
                    <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-md space-y-6">
                      <h3 className="font-bold text-gray-800 text-md flex items-center space-x-2">
                        <Server className="h-5 w-5 text-purple-600" />
                        <span>Server Monitor</span>
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                            <span>MongoDB Thread Connection</span>
                            <span className="text-green-600">Connected</span>
                          </div>
                          <div className="w-full bg-gray-150 h-2 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full rounded-full" style={{ width: '100%' }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                            <span>Flask Engine Gateway</span>
                            <span className="text-green-600">Active</span>
                          </div>
                          <div className="w-full bg-gray-150 h-2 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full rounded-full" style={{ width: '100%' }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                            <span>Report Compilation Queue</span>
                            <span className="text-purple-600">Idle (0 in queue)</span>
                          </div>
                          <div className="w-full bg-gray-150 h-2 rounded-full overflow-hidden">
                            <div className="bg-purple-600 h-full rounded-full" style={{ width: '100%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
