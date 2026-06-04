import React, { useState } from 'react';
import { User, Mail, Lock, Activity, Heart, ArrowRight } from 'lucide-react';

export default function Auth({ token, setToken, user, setUser, setCurrentPage }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('patient'); // patient, doctor
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showForgot, setShowForgot] = useState(false);

  // Profile management edit states (used when logged in)
  const [profileData, setProfileData] = useState({
    age: user?.profile?.age || 25,
    height: user?.profile?.height || 160,
    weight: user?.profile?.weight || 55,
    blood_group: user?.profile?.blood_group || 'O+',
    medical_history: user?.profile?.medical_history || '',
    family_history: user?.profile?.family_history || '',
    exercise: user?.profile?.lifestyle_info?.exercise || 'Sedentary',
    diet: user?.profile?.lifestyle_info?.diet || 'Balanced',
    water_intake: user?.profile?.lifestyle_info?.water_intake || 2.0,
    sleep_hours: user?.profile?.lifestyle_info?.sleep_hours || 7.5,
    stress_level: user?.profile?.lifestyle_info?.stress_level || 'Medium'
  });

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email, password } 
      : { email, password, name, role, age: Number(profileData.age), height: Number(profileData.height), weight: Number(profileData.weight) };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      if (isLogin) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('herbuddy_token', data.token);
        localStorage.setItem('herbuddy_user', JSON.stringify(data.user));
        setCurrentPage('dashboard');
      } else {
        setMessage('Registration successful! Please login.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setMessage(data.message + " Use reset code " + (data.reset_code || ""));
    } catch (err) {
      setError('Could not process password recovery.');
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          height: Number(profileData.height),
          weight: Number(profileData.weight),
          age: Number(profileData.age),
          blood_group: profileData.blood_group,
          medical_history: profileData.medical_history,
          family_history: profileData.family_history,
          lifestyle_info: {
            exercise: profileData.exercise,
            diet: profileData.diet,
            water_intake: Number(profileData.water_intake),
            sleep_hours: Number(profileData.sleep_hours),
            stress_level: profileData.stress_level
          }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Profile update failed');

      setUser(data.user);
      localStorage.setItem('herbuddy_user', JSON.stringify(data.user));
      setMessage('Health Twin profile updated successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  // If already logged in, show the profile management screen
  if (token && user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="glass-card rounded-3xl p-8 border border-pink-100 shadow-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-pink-100 text-pink-600 rounded-2xl">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Your Health Twin Profile</h2>
              <p className="text-gray-500 text-sm">Update clinical and lifestyle metrics to synchronize your digital health score.</p>
            </div>
          </div>

          {error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>}
          {message && <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium">{message}</div>}

          <form onSubmit={updateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Age */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Age (Years)</label>
                <input 
                  type="number" 
                  value={profileData.age}
                  onChange={(e) => setProfileData({...profileData, age: e.target.value})}
                  className="w-full px-4 py-3 bg-white/70 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                  required
                />
              </div>
              {/* Height */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Height (cm)</label>
                <input 
                  type="number" 
                  value={profileData.height}
                  onChange={(e) => setProfileData({...profileData, height: e.target.value})}
                  className="w-full px-4 py-3 bg-white/70 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                  required
                />
              </div>
              {/* Weight */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Weight (kg)</label>
                <input 
                  type="number" 
                  value={profileData.weight}
                  onChange={(e) => setProfileData({...profileData, weight: e.target.value})}
                  className="w-full px-4 py-3 bg-white/70 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Blood Group */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Blood Group</label>
                <select 
                  value={profileData.blood_group}
                  onChange={(e) => setProfileData({...profileData, blood_group: e.target.value})}
                  className="w-full px-4 py-3 bg-white/70 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              {/* Diet */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Dietary Pattern</label>
                <select 
                  value={profileData.diet}
                  onChange={(e) => setProfileData({...profileData, diet: e.target.value})}
                  className="w-full px-4 py-3 bg-white/70 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                >
                  {['Balanced', 'Vegetarian', 'Vegan', 'Keto', 'High Protein'].map(dt => (
                    <option key={dt} value={dt}>{dt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Exercise */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Exercise Routine</label>
                <select 
                  value={profileData.exercise}
                  onChange={(e) => setProfileData({...profileData, exercise: e.target.value})}
                  className="w-full px-4 py-3 bg-white/70 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                >
                  {['Sedentary', 'Moderate', 'Active'].map(ex => (
                    <option key={ex} value={ex}>{ex}</option>
                  ))}
                </select>
              </div>
              {/* Water Intake */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Water Target (Liters/day)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={profileData.water_intake}
                  onChange={(e) => setProfileData({...profileData, water_intake: e.target.value})}
                  className="w-full px-4 py-3 bg-white/70 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                  required
                />
              </div>
              {/* Sleep Hours */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Sleep Target (Hours/night)</label>
                <input 
                  type="number" 
                  step="0.5"
                  value={profileData.sleep_hours}
                  onChange={(e) => setProfileData({...profileData, sleep_hours: e.target.value})}
                  className="w-full px-4 py-3 bg-white/70 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Medical History */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Personal Medical History</label>
                <textarea 
                  value={profileData.medical_history}
                  onChange={(e) => setProfileData({...profileData, medical_history: e.target.value})}
                  placeholder="e.g. Thyroid history, diabetes, previous surgeries"
                  rows="3"
                  className="w-full px-4 py-3 bg-white/70 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder:text-gray-400"
                />
              </div>
              {/* Family History */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Family Medical History</label>
                <textarea 
                  value={profileData.family_history}
                  onChange={(e) => setProfileData({...profileData, family_history: e.target.value})}
                  placeholder="e.g. PCOS, breast cancer history, cardiac illness"
                  rows="3"
                  className="w-full px-4 py-3 bg-white/70 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                className="px-8 py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-pink-200 hover:opacity-90 transform transition hover:-translate-y-0.5 active:translate-y-0"
              >
                Sync Digital Twin Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Not logged in: Show Login / Register Screen
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="glass-card rounded-3xl p-8 border border-pink-100 shadow-2xl relative overflow-hidden">
        {/* Decorative subtle ambient circle */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-pink-200 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-60"></div>

        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="p-3 bg-pink-100 text-pink-600 rounded-2xl mb-3 shadow-inner">
            <Heart className="h-8 w-8 animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">HERBUDDY 2.0</h2>
          <p className="text-pink-600 text-xs font-semibold tracking-wider uppercase mt-1">Women's Health AI Companion</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 border-l-4 border-red-500 rounded-r-xl text-sm font-medium">{error}</div>}
        {message && <div className="mb-4 p-3 bg-green-50 text-green-700 border-l-4 border-green-500 rounded-r-xl text-sm font-medium">{message}</div>}

        {showForgot ? (
          <form onSubmit={handleForgotPassword} className="space-y-5 relative z-10">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Reset Password</h3>
            <p className="text-sm text-gray-500">Enter your registered email and we will simulate sending a verification code.</p>
            
            <div className="relative">
              <Mail className="absolute left-3.5 top-4 h-5 w-5 text-gray-400" />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white/80 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-pink-200 hover:opacity-90 transform transition hover:-translate-y-0.5"
            >
              Get Recovery Code
            </button>
            <div className="text-center">
              <button type="button" onClick={() => setShowForgot(false)} className="text-sm text-pink-600 hover:underline">
                Back to Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAuth} className="space-y-5 relative z-10">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3.5 top-4 h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/80 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3.5 top-4 h-5 w-5 text-gray-400" />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white/80 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-4 h-5 w-5 text-gray-400" />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white/80 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Select User Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button" 
                    onClick={() => setRole('patient')}
                    className={`py-2 rounded-xl text-sm font-semibold border ${role === 'patient' ? 'bg-pink-50 border-pink-400 text-pink-600' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    Patient
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setRole('doctor')}
                    className={`py-2 rounded-xl text-sm font-semibold border ${role === 'doctor' ? 'bg-purple-50 border-purple-400 text-purple-600' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    Medical Doctor
                  </button>
                </div>
              </div>
            )}

            {isLogin && (
              <div className="text-right">
                <button type="button" onClick={() => setShowForgot(true)} className="text-xs text-pink-600 hover:underline">
                  Forgot Password?
                </button>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-pink-200 hover:opacity-90 transform transition hover:-translate-y-0.5 flex items-center justify-center space-x-2"
            >
              <span>{isLogin ? 'Sign In to Platform' : 'Generate Health Twin'}</span>
              <ArrowRight className="h-5 w-5" />
            </button>

            <div className="text-center pt-2">
              <button 
                type="button" 
                onClick={() => { setIsLogin(!isLogin); setError(''); }} 
                className="text-sm text-gray-600 hover:underline"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
