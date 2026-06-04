import React, { useState } from 'react';
import { Smile, Brain, Soup, GlassWater, Moon, CheckCircle, Flame, Coffee, Carrot, Apple } from 'lucide-react';

export default function WellnessNutrition({ token, user, refreshUserData }) {
  const [activeTab, setActiveTab] = useState('nutrition'); // nutrition, wellness
  
  // Custom Meal Plans by Menstrual Phase
  const mealPlans = {
    Menstrual: {
      phase: 'Menstrual Phase (Days 1-5)',
      description: 'Estrogen and progesterone are at baseline levels. Focus on iron-rich foods and soothing warm meals to replenish iron stores lost during menstruation and ease cramp pain.',
      breakfast: 'Iron-rich Oatmeal topped with pumpkin seeds, sliced banana, and a drizzle of honey.',
      lunch: 'Warm Quinoa Salad with baby spinach, roasted beetroot, chickpeas, and lemon-tahini dressing.',
      dinner: 'Lentil Vegetable Soup served with baked wild salmon or roasted tofu and sautéed kale.',
      snacks: 'Dark chocolate (70%+ cacao) and a handful of raw walnuts or almonds.'
    },
    Follicular: {
      phase: 'Follicular Phase (Days 6-11)',
      description: 'Estrogen begins to rise, boosting energy. Focus on light, fresh, fermented foods that support estrogen metabolism and build stamina.',
      breakfast: 'Avocado toast on whole grain bread with a poached egg and microgreens.',
      lunch: 'Mixed green salad with grilled chicken breast (or edamame), sliced cucumbers, and carrots.',
      dinner: 'Stir-fried broccoli, snap peas, and bell peppers with brown rice and grilled sesame tempeh.',
      snacks: 'Fresh berries (blueberries, raspberries) with probiotic plain Greek yogurt.'
    },
    Ovulatory: {
      phase: 'Ovulatory Phase (Days 12-16)',
      description: 'Estrogen and LH peak. Energy is at its highest. Focus on high-fiber foods to help process excess hormones and raw vegetables to cool body temperature.',
      breakfast: 'Green smoothie bowl made with spinach, coconut milk, chia seeds, mango, and hemp hearts.',
      lunch: 'Quinoa bowl with shredded red cabbage, edamame, sliced avocado, and a ginger vinaigrette.',
      dinner: 'Grilled salmon or bean burger over a large mixed salad with bell peppers and roasted asparagus.',
      snacks: 'Celery sticks or carrot sticks dipped in organic garlic hummus.'
    },
    Luteal: {
      phase: 'Luteal Phase (Days 17-28)',
      description: 'Progesterone rises, increasing metabolic demands. Focus on complex carbohydrates to support serotonin levels, magnesium-rich foods to prevent PMS, and warm root vegetables.',
      breakfast: 'Sweet potato hash sautéed with onions, bell peppers, spinach, and scrambled tofu or eggs.',
      lunch: 'Brown rice bowl with black beans, roasted butternut squash, and steamed broccoli.',
      dinner: 'Slow-cooked beef stew (or lentil dahl) with root vegetables like carrots, parsnips, and turnips.',
      snacks: 'Baked apple slices dusted with cinnamon and topped with a spoonful of almond butter.'
    }
  };

  const [selectedPhase, setSelectedPhase] = useState('Menstrual');

  // Logs state
  const [mood, setMood] = useState('Happy');
  const [stress, setStress] = useState('Medium');
  const [anxiety, setAnxiety] = useState('Low');
  const [sleep, setSleep] = useState('7.5');
  const [water, setWater] = useState('2.0');
  const [logSuccess, setLogSuccess] = useState('');

  const handleWellnessSubmit = async (e) => {
    e.preventDefault();
    setLogSuccess('');

    try {
      const res = await fetch('/api/wellness/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mood,
          stress_level: stress,
          anxiety_level: anxiety,
          sleep_hours: Number(sleep),
          water_intake: Number(water),
          date: new Date().toISOString().split('T')[0]
        })
      });
      if (res.ok) {
        setLogSuccess('Wellness metrics logged! Digital Twin synchronized.');
        refreshUserData();
        setTimeout(() => setLogSuccess(''), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Determine user wellness score
  const getWellnessScore = () => {
    let score = 80;
    if (stress === 'High') score -= 20;
    if (stress === 'Low') score += 10;
    if (anxiety === 'High') score -= 15;
    if (anxiety === 'Low') score += 5;
    
    const sleepHr = Number(sleep);
    if (sleepHr < 6.5) score -= 15;
    else if (sleepHr >= 7.0 && sleepHr <= 9.0) score += 10;

    return Math.min(100, Math.max(30, score));
  };

  const wellnessScore = getWellnessScore();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Smart Wellness & Nutrition</h1>
        <p className="text-gray-500 text-sm">Fine-tune your diet and monitor psychological metrics to optimize your Digital Twin score.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-pink-100 pb-2 gap-4">
        <button
          onClick={() => setActiveTab('nutrition')}
          className={`pb-2.5 px-4 font-bold text-sm transition relative ${activeTab === 'nutrition' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Smart Nutrition Planner
        </button>
        <button
          onClick={() => setActiveTab('wellness')}
          className={`pb-2.5 px-4 font-bold text-sm transition relative ${activeTab === 'wellness' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Mental Wellness Tracker
        </button>
      </div>

      {activeTab === 'nutrition' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
          {/* Left Panel: Phase Picker */}
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-md">
              <h3 className="font-bold text-gray-800 text-md mb-4 flex items-center space-x-2">
                <Flame className="h-5 w-5 text-pink-600" />
                <span>Select Menstrual Phase</span>
              </h3>

              <div className="space-y-2">
                {Object.keys(mealPlans).map(p => {
                  const isSelected = selectedPhase === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setSelectedPhase(p)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left text-sm transition ${isSelected ? 'bg-pink-500 border-pink-500 text-white font-bold' : 'bg-white border-pink-50 text-gray-600 hover:bg-pink-50/30'}`}
                    >
                      <span>{mealPlans[p].phase}</span>
                    </button>
                  );
                })}
              </div>

              <div className="bg-pink-50/20 border border-pink-50/50 p-4 rounded-2xl text-xs text-gray-500 mt-6 leading-relaxed">
                <Brain className="h-5 w-5 text-pink-600 mb-2" />
                Eating according to your cycle phase helps control insulin spikes, reduce PMS-induced sugar cravings, and balance hormone output naturally.
              </div>
            </div>
          </div>

          {/* Right Panel: Meal Plan Display */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-md space-y-6">
              <div>
                <span className="text-[10px] uppercase font-extrabold text-pink-600 tracking-wider">Hormonal Diet Guide</span>
                <h2 className="text-2xl font-black text-gray-800 mt-1">{mealPlans[selectedPhase].phase} Recommendations</h2>
                <p className="text-gray-500 text-xs mt-2 leading-relaxed">{mealPlans[selectedPhase].description}</p>
              </div>

              {/* Meal Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Breakfast */}
                <div className="bg-white/80 p-5 rounded-2xl border border-pink-50 flex items-start space-x-3.5 shadow-sm">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                    <Coffee className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-1">Breakfast Plan</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">{mealPlans[selectedPhase].breakfast}</p>
                  </div>
                </div>

                {/* Lunch */}
                <div className="bg-white/80 p-5 rounded-2xl border border-pink-50 flex items-start space-x-3.5 shadow-sm">
                  <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl shrink-0">
                    <Carrot className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-1">Lunch Plate</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">{mealPlans[selectedPhase].lunch}</p>
                  </div>
                </div>

                {/* Dinner */}
                <div className="bg-white/80 p-5 rounded-2xl border border-pink-50 flex items-start space-x-3.5 shadow-sm">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                    <Soup className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-1">Dinner Option</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">{mealPlans[selectedPhase].dinner}</p>
                  </div>
                </div>

                {/* Snacks */}
                <div className="bg-white/80 p-5 rounded-2xl border border-pink-50 flex items-start space-x-3.5 shadow-sm">
                  <div className="p-2.5 bg-red-50 text-red-500 rounded-xl shrink-0">
                    <Apple className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-1">Snacks & Support</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">{mealPlans[selectedPhase].snacks}</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'wellness' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
          {/* Left Panel: Log Wellness Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-md">
              <h3 className="font-bold text-gray-800 text-md mb-4 flex items-center space-x-2">
                <Smile className="h-5 w-5 text-pink-600" />
                <span>Log Daily Mental Wellness Metrics</span>
              </h3>

              {logSuccess && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl text-xs font-medium">{logSuccess}</div>}

              <form onSubmit={handleWellnessSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Mood Rating</label>
                  <select 
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/70 border border-pink-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                  >
                    {['Happy', 'Neutral', 'Sad', 'Anxious', 'Irritable', 'Fatigued'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Anxiety Level</label>
                  <select 
                    value={anxiety}
                    onChange={(e) => setAnxiety(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/70 border border-pink-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                  >
                    {['Low', 'Medium', 'High'].map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Stress Level</label>
                  <select 
                    value={stress}
                    onChange={(e) => setStress(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/70 border border-pink-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                  >
                    {['Low', 'Medium', 'High'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Sleep Quality (Hours)</label>
                  <input 
                    type="number"
                    step="0.5"
                    value={sleep}
                    onChange={(e) => setSleep(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/70 border border-pink-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Water Intake (Liters)</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={water}
                    onChange={(e) => setWater(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/70 border border-pink-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                    required
                  />
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <button 
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold shadow-md hover:opacity-90 transition"
                  >
                    Update Wellness Twins
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Panel: Wellness score card */}
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-md text-center">
              <h3 className="font-bold text-gray-800 text-md mb-2 flex items-center justify-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <span>Mental Wellness Score</span>
              </h3>
              
              <div className="text-4xl font-black text-purple-600 my-4">{wellnessScore}/100</div>

              <div className="bg-purple-50/20 border border-purple-50 p-4 rounded-xl text-left text-xs text-gray-600 leading-relaxed space-y-2">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4.5 w-4.5 text-purple-500 shrink-0 mt-0.5" />
                  <span>
                    {wellnessScore >= 80 ? 'Your cortisol levels appear balanced. Maintain current sleep boundaries.' : 'Elevated stress flagged. Try light yoga or a 10-minute mindfulness breathing exercise.'}
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4.5 w-4.5 text-purple-500 shrink-0 mt-0.5" />
                  <span>Ensure you log water: current water log stands at **{water} Liters**. Target is 2.5L.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
