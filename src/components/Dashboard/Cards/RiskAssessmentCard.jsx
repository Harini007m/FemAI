import React from 'react';
import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

export default function RiskAssessmentCard({ risks = {} }) {
  const defaultRisks = {
    pcos: { score: 28, level: 'Low', explanation: 'Based on your cycle patterns, PCOS risk is minimal.' },
    iron_deficiency: { score: 42, level: 'Monitor', explanation: 'Track iron intake; consider blood work annually.' },
    anemia: { score: 35, level: 'Monitor', explanation: 'Monitor energy levels; ensure adequate B12 intake.' },
    hormonal_imbalance: { score: 22, level: 'Low', explanation: 'Your hormone levels appear balanced.' },
    uterine_health: { score: 38, level: 'Monitor', explanation: 'Regular gynecological checkups recommended.' },
    ...risks
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'Low': return { bg: 'from-green-50 to-emerald-50', border: 'border-green-200', icon: 'text-green-600', label: 'bg-green-100 text-green-700' };
      case 'Monitor': return { bg: 'from-amber-50 to-yellow-50', border: 'border-amber-200', icon: 'text-amber-600', label: 'bg-amber-100 text-amber-700' };
      case 'Critical': return { bg: 'from-red-50 to-rose-50', border: 'border-red-200', icon: 'text-red-600', label: 'bg-red-100 text-red-700' };
      default: return { bg: 'from-gray-50 to-gray-100', border: 'border-gray-200', icon: 'text-gray-600', label: 'bg-gray-100 text-gray-700' };
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'Low': return <CheckCircle2 className="h-5 w-5" />;
      case 'Monitor': return <AlertCircle className="h-5 w-5" />;
      case 'Critical': return <AlertTriangle className="h-5 w-5" />;
      default: return <AlertCircle className="h-5 w-5" />;
    }
  };

  const RiskItem = ({ name, data }) => {
    const colors = getRiskColor(data.level);
    return (
      <div className={`p-5 rounded-2xl bg-gradient-to-br ${colors.bg} border ${colors.border} hover:shadow-md transition`}>
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-bold text-gray-800 text-sm flex items-center space-x-2">
            <span>{name}</span>
          </h4>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${colors.label} flex items-center space-x-1`}>
            <span>{getRiskIcon(data.level)}</span>
            <span>{data.level}</span>
          </span>
        </div>

        {/* Risk Score Bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600 font-semibold">Risk Score</span>
            <span className="text-sm font-bold text-gray-800">{data.score}%</span>
          </div>
          <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-gray-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                data.level === 'Low' ? 'bg-green-500' : data.level === 'Monitor' ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${data.score}%` }}
            ></div>
          </div>
        </div>

        {/* Explanation */}
        <p className="text-xs text-gray-700 leading-relaxed">{data.explanation}</p>
      </div>
    );
  };

  const overallRisk = Math.round(
    (defaultRisks.pcos.score + defaultRisks.iron_deficiency.score + defaultRisks.anemia.score + defaultRisks.hormonal_imbalance.score + defaultRisks.uterine_health.score) / 5
  );

  return (
    <div className="glass-card rounded-3xl p-8 border border-amber-100 shadow-lg overflow-hidden relative">
      {/* Decorative background */}
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-gradient-to-br from-amber-200 to-orange-100 rounded-full blur-3xl opacity-20"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-800 text-lg">Risk Assessment</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 font-semibold">Overall Risk</span>
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-yellow-50 border-2 border-amber-200 flex items-center justify-center">
              <span className="font-black text-lg text-amber-700">{overallRisk}%</span>
            </div>
          </div>
        </div>

        {/* Health Status Summary */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100">
          <p className="text-sm text-gray-700">
            <span className="font-bold text-gray-800">Health Summary: </span>
            Your health profile shows manageable risk levels. Maintain regular checkups and continue tracking wellness metrics for optimal preventive care.
          </p>
        </div>

        {/* Risk Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RiskItem name="PCOS/PCOD Risk" data={defaultRisks.pcos} />
          <RiskItem name="Iron Deficiency Risk" data={defaultRisks.iron_deficiency} />
          <RiskItem name="Anemia Risk" data={defaultRisks.anemia} />
          <RiskItem name="Hormonal Imbalance" data={defaultRisks.hormonal_imbalance} />
          <RiskItem name="Uterine Health" data={defaultRisks.uterine_health} />
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-gray-800 text-sm mb-3">Preventive Actions</h4>
              <ul className="text-xs text-gray-700 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-pink-600 font-bold mt-0.5">✓</span>
                  <span>Schedule annual gynecological checkup</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-pink-600 font-bold mt-0.5">✓</span>
                  <span>Maintain consistent wellness logging</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-pink-600 font-bold mt-0.5">✓</span>
                  <span>Consult AI for personalized recommendations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
