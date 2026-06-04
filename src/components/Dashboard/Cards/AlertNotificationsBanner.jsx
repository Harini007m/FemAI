import React from 'react';
import { AlertTriangle, AlertCircle, Info, X, CheckCircle } from 'lucide-react';

export default function AlertNotificationsBanner({ alerts = [], onDismiss = () => {} }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-8 border border-green-100 bg-gradient-to-br from-green-50/50 to-emerald-50/50 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">All Systems Healthy</h3>
            <p className="text-sm text-gray-600">No alerts or health concerns at this time. Keep up with your wellness routine!</p>
          </div>
        </div>
      </div>
    );
  }

  const getSeverityInfo = (severity) => {
    switch (severity) {
      case 'Critical':
        return { icon: AlertTriangle, color: 'from-red-50 to-rose-50', border: 'border-red-200', text: 'text-red-700', bg: 'bg-red-100', label: 'bg-red-500' };
      case 'Monitor':
        return { icon: AlertCircle, color: 'from-amber-50 to-yellow-50', border: 'border-amber-200', text: 'text-amber-700', bg: 'bg-amber-100', label: 'bg-amber-500' };
      default:
        return { icon: Info, color: 'from-blue-50 to-cyan-50', border: 'border-blue-200', text: 'text-blue-700', bg: 'bg-blue-100', label: 'bg-blue-500' };
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase">Health Alerts & Notifications</h3>
      <div className="space-y-3">
        {alerts.map((alert, idx) => {
          const severity = alert.severity || 'Normal';
          const info = getSeverityInfo(severity);
          const Icon = info.icon;

          return (
            <div
              key={idx}
              className={`glass-card rounded-2xl p-4 border ${info.border} bg-gradient-to-r ${info.color} flex items-start justify-between group hover:shadow-md transition`}
            >
              <div className="flex items-start space-x-3 flex-1">
                <div className={`p-2.5 ${info.bg} text-white rounded-xl shrink-0 mt-0.5`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className={`font-bold text-sm ${info.text}`}>{alert.title}</h4>
                    <span className={`px-2 py-1 ${info.label} text-white rounded-full text-[10px] font-bold`}>
                      {severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">{alert.message}</p>
                  {alert.action && (
                    <button className="text-xs font-semibold mt-2 px-3 py-1 rounded-lg bg-white hover:bg-gray-50 transition">
                      {alert.action}
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={() => onDismiss(idx)}
                className="shrink-0 ml-2 p-1.5 hover:bg-white/30 rounded-lg transition opacity-0 group-hover:opacity-100"
                title="Dismiss alert"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
