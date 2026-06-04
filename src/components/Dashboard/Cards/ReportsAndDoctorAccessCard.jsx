import React from 'react';
import { FileText, Download, Share2, Calendar, CheckCircle2 } from 'lucide-react';

export default function ReportsAndDoctorAccessCard({ reports = {}, consultations = [] }) {
  const defaultReports = {
    recent: [
      { id: 1, name: 'Monthly Health Report', date: '2024-01-15', type: 'comprehensive', status: 'ready' },
      { id: 2, name: 'Cycle Analysis Report', date: '2024-01-10', type: 'cycle', status: 'ready' },
      { id: 3, name: 'Risk Assessment Report', date: '2024-01-05', type: 'risk', status: 'pending' },
    ],
    ...reports
  };

  const defaultConsultations = consultations.length > 0 ? consultations : [
    { id: 1, doctorName: 'Dr. Sarah Johnson', specialty: 'Gynecologist', date: '2024-01-20', status: 'scheduled', notes: 'Period tracking consultation' },
    { id: 2, doctorName: 'Dr. Rajesh Patel', specialty: 'Nutritionist', date: '2024-01-18', status: 'completed', notes: 'Dietary recommendations' },
  ];

  return (
    <div className="glass-card rounded-3xl p-8 border border-blue-100 shadow-lg overflow-hidden relative">
      {/* Decorative background */}
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-gradient-to-br from-blue-200 to-indigo-100 rounded-full blur-3xl opacity-20"></div>

      <div className="relative z-10">
        {/* Header */}
        <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center space-x-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <span>Reports & Doctor Access</span>
        </h3>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Reports */}
          <div>
            <h4 className="font-semibold text-gray-700 text-sm mb-3">Recent Reports</h4>
            <div className="space-y-2">
              {defaultReports.recent.map((report) => (
                <div key={report.id} className="p-3 bg-white/60 rounded-xl border border-blue-50 hover:border-blue-200 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start space-x-2 flex-1">
                      <FileText className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{report.name}</p>
                        <p className="text-xs text-gray-500">{new Date(report.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {report.status === 'ready' && <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />}
                  </div>
                  <div className="flex gap-2">
                    <button className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition flex items-center space-x-1">
                      <Download className="h-3 w-3" />
                      <span>PDF</span>
                    </button>
                    <button className="text-xs px-2 py-1 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg transition flex items-center space-x-1">
                      <Share2 className="h-3 w-3" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consultation History */}
          <div>
            <h4 className="font-semibold text-gray-700 text-sm mb-3">Consultation History</h4>
            <div className="space-y-2">
              {defaultConsultations.map((consultation) => (
                <div key={consultation.id} className="p-3 bg-white/60 rounded-xl border border-blue-50 hover:border-blue-200 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-800">{consultation.doctorName}</p>
                      <p className="text-xs text-gray-500">{consultation.specialty}</p>
                      <p className="text-xs text-gray-600 mt-1">{consultation.notes}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold shrink-0 ${
                      consultation.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {consultation.status === 'scheduled' ? '📅 Scheduled' : '✓ Completed'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(consultation.date).toLocaleDateString()}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-6 border-t border-blue-100 grid grid-cols-2 gap-3">
          <button className="px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl font-semibold text-sm transition">
            Generate New Report
          </button>
          <button className="px-4 py-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl font-semibold text-sm transition">
            Schedule Consultation
          </button>
        </div>
      </div>
    </div>
  );
}
