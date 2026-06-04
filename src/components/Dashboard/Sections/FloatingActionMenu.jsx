import React, { useState } from 'react';
import { Plus, Activity, MessageSquare, TrendingUp, RefreshCw, Zap } from 'lucide-react';

export default function FloatingActionMenu({ actions = {} }) {
  const [isOpen, setIsOpen] = useState(false);

  const defaultActions = {
    onLogSymptoms: () => alert('Log Symptoms'),
    onAddCycleData: () => alert('Add Cycle Data'),
    onChatAI: () => alert('Chat with AI'),
    onUpdateMetrics: () => alert('Update Metrics'),
    onGenerateReport: () => alert('Generate Report'),
    ...actions
  };

  const menuItems = [
    { icon: Activity, label: 'Log Symptoms', action: defaultActions.onLogSymptoms, color: 'bg-red-500', position: 'top-32 right-0' },
    { icon: TrendingUp, label: 'Add Cycle Data', action: defaultActions.onAddCycleData, color: 'bg-pink-500', position: 'top-24 right-20' },
    { icon: MessageSquare, label: 'Chat with AI', action: defaultActions.onChatAI, color: 'bg-purple-500', position: 'top-20 right-32' },
    { icon: RefreshCw, label: 'Update Metrics', action: defaultActions.onUpdateMetrics, color: 'bg-blue-500', position: 'top-24 -right-20' },
    { icon: Zap, label: 'Quick Report', action: defaultActions.onGenerateReport, color: 'bg-amber-500', position: 'top-32 -right-2' },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      {/* Menu Items - visible when open */}
      {isOpen && (
        <div className="mb-4 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  item.action();
                  setIsOpen(false);
                }}
                className={`flex items-center space-x-3 px-4 py-3 ${item.color} text-white rounded-full font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-110 transition-all group`}
              >
                <span className="hidden group-hover:inline max-w-[100px] text-right">{item.label}</span>
                <Icon className="h-5 w-5 shrink-0" />
              </button>
            );
          })}
        </div>
      )}

      {/* Main Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center h-16 w-16 rounded-full font-bold text-white text-2xl shadow-2xl hover:shadow-3xl transition-all transform ${
          isOpen
            ? 'bg-gradient-to-r from-pink-600 to-purple-600 rotate-45'
            : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-110'
        }`}
      >
        <Plus className={`h-8 w-8 transition-transform ${isOpen ? 'rotate-45' : 'rotate-0'}`} />
      </button>

      {/* Tooltip text for main button */}
      <p className="text-xs text-gray-600 font-semibold mt-2 text-right whitespace-nowrap">
        Quick Actions
      </p>
    </div>
  );
}
