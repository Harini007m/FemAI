import React, { useState } from 'react';
import { ShieldAlert, Activity, Sparkles, Check, ChevronRight, HelpCircle, Heart, RefreshCw } from 'lucide-react';

export default function HealthAssessments({ token, user, refreshUserData }) {
  const [activeTab, setActiveTab] = useState('pcos'); // pcos, uterine, deficiency

  // 1. PCOS Form State
  const [pcosWg, setPcosWg] = useState(false);
  const [pcosAcne, setPcosAcne] = useState(false);
  const [pcosHg, setPcosHg] = useState(false);
  const [pcosCi, setPcosCi] = useState(false);
  const [pcosSedentary, setPcosSedentary] = useState(false);
  const [pcosResult, setPcosResult] = useState(null);
  const [pcosLoading, setPcosLoading] = useState(false);

  // 2. Uterine Form State
  const uterineSymptomsList = [
    { id: 'severe_cramping', label: 'Severe Period Cramping / Pain' },
    { id: 'chronic_pelvic_pain', label: 'Chronic Non-Period Pelvic Pain' },
    { id: 'painful_intercourse', label: 'Pain during/after Intercourse' },
    { id: 'lower_back_pain', label: 'Lower Back & Pelvic Aches' },
    { id: 'heavy_bleeding', label: 'Extremely Heavy Bleeding (Flow)' },
    { id: 'prolonged_periods', label: 'Bleeding lasting longer than 7 days' },
    { id: 'frequent_urination', label: 'Frequent urge to urinate' },
    { id: 'pelvic_pressure', label: 'Sense of fullness/pressure in pelvis' },
    { id: 'constipation', label: 'Constipation or painful bowel movements' },
    { id: 'irregular_spotting', label: 'Spotting / Bleeding between periods' },
    { id: 'spotting_after_intercourse', label: 'Bleeding / Spotting after intercourse' },
    { id: 'abnormal_discharge', label: 'Watery, bloody or foul-smelling discharge' }
  ];
  const [selectedUterine, setSelectedUterine] = useState([]);
  const [uterineResult, setUterineResult] = useState(null);
  const [uterineLoading, setUterineLoading] = useState(false);

  // 3. Deficiency Form State
  const deficiencySymptomsList = [
    { id: 'fatigue', label: 'Persistent fatigue or weakness' },
    { id: 'pale_skin', label: 'Unusually pale skin or conjunctiva' },
    { id: 'cold_hands_feet', label: 'Cold hands, feet or poor circulation' },
    { id: 'brittle_nails', label: 'Brittle, dry, or spoon-shaped nails' },
    { id: 'shortness_of_breath', label: 'Shortness of breath on light exertion' },
    { id: 'dizziness', label: 'Frequent dizziness or lightheadedness' },
    { id: 'bone_pain', label: 'Aching bones or lower back pain' },
    { id: 'muscle_weakness', label: 'General muscle weakness or soreness' },
    { id: 'joint_stiffness', label: 'Joint stiffness, especially in mornings' },
    { id: 'depressed_mood', label: 'Low mood, irritability, or seasonal blues' },
    { id: 'tingling_hands_feet', label: 'Tingling or pins-and-needles in limbs' },
    { id: 'numbness', label: 'Numbness or reduced sensitivity' },
    { id: 'mouth_ulcers', label: 'Frequent mouth ulcers or swollen tongue' },
    { id: 'memory_lapses', label: 'Brain fog or memory slips' },
    { id: 'muscle_cramps', label: 'Frequent calf cramps or twitching' }
  ];
  const [selectedDeficiencies, setSelectedDeficiencies] = useState([]);
  const [deficiencyResult, setDeficiencyResult] = useState(null);
  const [deficiencyLoading, setDeficiencyLoading] = useState(false);

  // Handlers
  const handlePcosSubmit = async (e) => {
    e.preventDefault();
    setPcosLoading(true);
    setPcosResult(null);

    try {
      const res = await fetch('/api/predictions/pcos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          weight_gain: pcosWg,
          acne: pcosAcne,
          hair_growth: pcosHg,
          cycle_irregularity: pcosCi,
          sedentary: pcosSedentary
        })
      });
      if (res.ok) {
        const data = await res.json();
        setPcosResult(data);
        refreshUserData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPcosLoading(false);
    }
  };

  const handleUterineToggle = (id) => {
    if (selectedUterine.includes(id)) {
      setSelectedUterine(selectedUterine.filter(s => s !== id));
    } else {
      setSelectedUterine([...selectedUterine, id]);
    }
  };

  const handleUterineSubmit = async (e) => {
    e.preventDefault();
    setUterineLoading(true);
    setUterineResult(null);

    try {
      const res = await fetch('/api/predictions/uterine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ symptoms: selectedUterine })
      });
      if (res.ok) {
        const data = await res.json();
        setUterineResult(data);
        refreshUserData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUterineLoading(false);
    }
  };

  const handleDeficiencyToggle = (id) => {
    if (selectedDeficiencies.includes(id)) {
      setSelectedDeficiencies(selectedDeficiencies.filter(s => s !== id));
    } else {
      setSelectedDeficiencies([...selectedDeficiencies, id]);
    }
  };

  const handleDeficiencySubmit = async (e) => {
    e.preventDefault();
    setDeficiencyLoading(true);
    setDeficiencyResult(null);

    try {
      const res = await fetch('/api/predictions/deficiencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ symptoms: selectedDeficiencies })
      });
      if (res.ok) {
        const data = await res.json();
        setDeficiencyResult(data);
        refreshUserData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeficiencyLoading(false);
    }
  };

  const resetPcos = () => {
    setPcosWg(false);
    setPcosAcne(false);
    setPcosHg(false);
    setPcosCi(false);
    setPcosSedentary(false);
    setPcosResult(null);
  };

  const resetUterine = () => {
    setSelectedUterine([]);
    setUterineResult(null);
  };

  const resetDeficiency = () => {
    setSelectedDeficiencies([]);
    setDeficiencyResult(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">AI Assessment Engines</h1>
        <p className="text-gray-500 text-sm">Consult our specialized diagnostics modules for targeted health forecasting.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-pink-100 pb-2 gap-4">
        {[
          { id: 'pcos', name: 'PCOS Risk Prediction' },
          { id: 'uterine', name: 'Uterine Health Risk' },
          { id: 'deficiency', name: 'Deficiency Detection' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2.5 px-4 font-bold text-sm transition relative ${activeTab === tab.id ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Active Tab Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Intake Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TAB 1: PCOS SCREEN */}
          {activeTab === 'pcos' && (
            <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-md">
              <div className="flex items-center space-x-2.5 mb-6 text-pink-600">
                <ShieldAlert className="h-6 w-6" />
                <h3 className="text-lg font-bold text-gray-800">PCOS Risk Questionnaire</h3>
              </div>

              {!pcosResult ? (
                <form onSubmit={handlePcosSubmit} className="space-y-6">
                  <div className="bg-pink-50/30 border border-pink-50 p-4 rounded-2xl text-xs text-gray-500 flex items-start space-x-2">
                    <HelpCircle className="h-5 w-5 text-pink-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Please mark the clinical indicators below. We evaluate metrics (Age, Weight, BMI) from your Health Twin profile to run predictions.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { id: 'wg', val: pcosWg, set: setPcosWg, label: 'Unexplained Weight Gain / Difficulty losing weight' },
                      { id: 'acne', val: pcosAcne, set: setPcosAcne, label: 'Severe Acne, oily skin, or sudden breakouts' },
                      { id: 'hg', val: pcosHg, set: setPcosHg, label: 'Hirsutism: Excess hair growth on face, chest, or chin' },
                      { id: 'ci', val: pcosCi, set: setPcosCi, label: 'Cycle Irregularity (periods delayed > 35 days, or skipped months)' },
                      { id: 'sedentary', val: pcosSedentary, set: setPcosSedentary, label: 'Sedentary Lifestyle (minimal active movement)' }
                    ].map(field => (
                      <button
                        key={field.id}
                        type="button"
                        onClick={() => field.set(!field.val)}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left text-sm transition ${field.val ? 'bg-pink-50/70 border-pink-400 text-pink-700 font-semibold' : 'bg-white border-pink-50 text-gray-600'}`}
                      >
                        <span>{field.label}</span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-4 ${field.val ? 'bg-pink-600 border-pink-600 text-white' : 'border-gray-300 bg-white'}`}>
                          {field.val && <Check className="h-3.5 w-3.5" />}
                        </div>
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={pcosLoading}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl font-bold shadow-md hover:opacity-90 transition disabled:opacity-50"
                  >
                    {pcosLoading ? 'Running ML Predictor...' : 'Predict PCOS Risk'}
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Results Screen */}
                  <div className="text-center py-6">
                    <div className="inline-block px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-3 bg-pink-100 text-pink-700">
                      {pcosResult.risk_level}
                    </div>
                    
                    {/* Gauge circle representation */}
                    <div className="relative w-40 h-40 mx-auto flex items-center justify-center border-4 border-pink-100 rounded-full shadow-inner bg-white mt-2">
                      <div className="absolute inset-2 border-2 border-dashed border-pink-400 rounded-full animate-spin"></div>
                      <div className="text-center relative z-10">
                        <span className="text-4xl font-black text-pink-600">{pcosResult.risk_percentage}%</span>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">Risk Factor</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
                    <h4 className="font-bold text-gray-800 text-sm mb-2">Diagnostic Explanation:</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">{pcosResult.explanation}</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-800 text-sm">Recommended Care Actions:</h4>
                    {pcosResult.recommended_actions.map((act, index) => (
                      <div key={index} className="flex items-start space-x-3 text-xs text-gray-600 bg-white border border-pink-50 p-3 rounded-xl">
                        <ChevronRight className="h-4 w-4 text-pink-600 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={resetPcos}
                    className="w-full py-3.5 bg-pink-50 text-pink-600 rounded-2xl font-bold transition hover:bg-pink-100 flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Run Another Survey</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UTERINE HEALTH SCREEN */}
          {activeTab === 'uterine' && (
            <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-md">
              <div className="flex items-center space-x-2.5 mb-6 text-purple-600">
                <ShieldAlert className="h-6 w-6" />
                <h3 className="text-lg font-bold text-gray-800">Uterine Health Symptom Checklist</h3>
              </div>

              {!uterineResult ? (
                <form onSubmit={handleUterineSubmit} className="space-y-6">
                  <div className="bg-purple-50/30 border border-purple-50 p-4 rounded-2xl text-xs text-gray-500 flex items-start space-x-2">
                    <HelpCircle className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Select all symptoms below. Our system matches responses against diagnostic matrices for Fibroids, Endometriosis, and Cervical checks.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {uterineSymptomsList.map(item => {
                      const isSelected = selectedUterine.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleUterineToggle(item.id)}
                          className={`flex items-center justify-between p-3.5 rounded-xl border text-left text-xs transition ${isSelected ? 'bg-purple-50/70 border-purple-400 text-purple-700 font-semibold' : 'bg-white border-pink-50 text-gray-600'}`}
                        >
                          <span>{item.label}</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-3 ${isSelected ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-300 bg-white'}`}>
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="submit"
                    disabled={uterineLoading}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl font-bold shadow-md hover:opacity-90 transition disabled:opacity-50"
                  >
                    {uterineLoading ? 'Analyzing indicators...' : 'Run Pelvic Analysis'}
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="text-center py-6">
                    <h2 className="text-3xl font-black text-purple-600">{uterineResult.risk_score}/100</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Uterine Risk Indicator Score</p>
                  </div>

                  <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
                    <h4 className="font-bold text-gray-800 text-xs uppercase mb-2">Anomalies Screened:</h4>
                    <div className="flex flex-wrap gap-2">
                      {uterineResult.risks_detected.map(risk => (
                        <span key={risk} className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-100">
                          {risk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-800 text-sm">Recommended Care Actions:</h4>
                    {uterineResult.recommendations.map((act, index) => (
                      <div key={index} className="flex items-start space-x-3 text-xs text-gray-600 bg-white border border-pink-50 p-3.5 rounded-xl">
                        <ChevronRight className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={resetUterine}
                    className="w-full py-3.5 bg-purple-50 text-purple-600 rounded-2xl font-bold transition hover:bg-purple-100 flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Run Another Survey</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DEFICIENCY DETECTION */}
          {activeTab === 'deficiency' && (
            <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-md">
              <div className="flex items-center space-x-2.5 mb-6 text-indigo-600">
                <ShieldAlert className="h-6 w-6" />
                <h3 className="text-lg font-bold text-gray-800">Nutritional Deficiencies Survey</h3>
              </div>

              {!deficiencyResult ? (
                <form onSubmit={handleDeficiencySubmit} className="space-y-6">
                  <div className="bg-indigo-50/30 border border-indigo-50 p-4 rounded-2xl text-xs text-gray-500 flex items-start space-x-2">
                    <HelpCircle className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Select all symptoms you have experienced consistently over the last 14 days to parse potential nutritional gaps.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {deficiencySymptomsList.map(item => {
                      const isSelected = selectedDeficiencies.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleDeficiencyToggle(item.id)}
                          className={`flex items-center justify-between p-3.5 rounded-xl border text-left text-xs transition ${isSelected ? 'bg-indigo-50/70 border-indigo-400 text-indigo-700 font-semibold' : 'bg-white border-pink-50 text-gray-600'}`}
                        >
                          <span>{item.label}</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-3 ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 bg-white'}`}>
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="submit"
                    disabled={deficiencyLoading}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl font-bold shadow-md hover:opacity-90 transition disabled:opacity-50"
                  >
                    {deficiencyLoading ? 'Mapping nutritional markers...' : 'Analyze Deficiency Profile'}
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  <h4 className="font-bold text-gray-800 text-sm">Identified Deficiency Indicators:</h4>
                  
                  <div className="space-y-5">
                    {Object.entries(deficiencyResult).map(([vitamin, info]) => (
                      <div key={vitamin} className="bg-white/80 p-5 rounded-2xl border border-pink-50 space-y-3.5 shadow-sm">
                        <div className="flex justify-between items-center">
                          <h5 className="font-black text-gray-800 text-sm uppercase">
                            {vitamin.replace('_', ' ')}
                          </h5>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${info.risk === 'High Risk' ? 'bg-red-150 text-red-700' : info.risk === 'Moderate Risk' ? 'bg-amber-150 text-amber-700' : 'bg-green-150 text-green-700'}`}>
                            {info.risk}
                          </span>
                        </div>

                        {/* Bar */}
                        <div>
                          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${info.risk === 'High Risk' ? 'bg-red-500' : info.risk === 'Moderate Risk' ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${info.percentage}%` }}></div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="block font-bold text-gray-500 uppercase text-[9px] mb-1">Recommended Superfoods</span>
                            <div className="flex flex-wrap gap-1">
                              {info.foods.map(f => (
                                <span key={f} className="px-2 py-0.5 bg-pink-50 text-pink-600 rounded-md font-medium text-[10px]">{f}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="block font-bold text-gray-500 uppercase text-[9px] mb-1">Lifestyle Support</span>
                            <p className="text-gray-500 text-[10px] leading-relaxed">{info.lifestyle}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={resetDeficiency}
                    className="w-full py-3.5 bg-indigo-50 text-indigo-600 rounded-2xl font-bold transition hover:bg-indigo-100 flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Run Another Survey</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Educational info / Cards */}
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-md">
            <h3 className="font-bold text-gray-800 text-md mb-4 flex items-center space-x-2">
              <Activity className="h-5 w-5 text-pink-600" />
              <span>Diagnostic Systems Overview</span>
            </h3>
            
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h5 className="font-bold text-gray-800 text-xs uppercase text-pink-600 mb-1">PCOS Random Forest Model</h5>
                <p className="text-gray-500 text-[11px] leading-relaxed">
                  Our machine learning model analyzes the interactions between weight patterns, insulin-linked markers (like acne or hirsutism), and cycle histories to estimate risk probabilities.
                </p>
              </div>

              <div className="border-b border-gray-100 pb-3">
                <h5 className="font-bold text-gray-800 text-xs uppercase text-purple-600 mb-1">Uterine Health Engine</h5>
                <p className="text-gray-500 text-[11px] leading-relaxed">
                  Correlates physical symptoms to clinical checkup markers. Risk levels alert the user to consult active practitioners on our panel if necessary.
                </p>
              </div>

              <div>
                <h5 className="font-bold text-gray-800 text-xs uppercase text-indigo-600 mb-1">Nutrient Gap Matcher</h5>
                <p className="text-gray-500 text-[11px] leading-relaxed">
                  Traces classic symptoms associated with iron, Vit D, and Vit B12 absorption deficiencies. Focuses on vegan/vegetarian diet differences.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
