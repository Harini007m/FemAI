import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, FilePlus2, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';

export default function Reports({ token, user }) {
  const [reportsList, setReportsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      fetchReports();
    }
  }, [token]);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReportsList(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/reports/generate', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'PDF compilation failed.');

      setSuccess('PDF Health Report compiled successfully!');
      fetchReports();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Health Twin Summary Reports</h1>
        <p className="text-gray-500 text-sm">Download comprehensive monthly clinical digests containing diagnostics, charts, and recommendations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Compilation triggers panel */}
        <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 mb-4 text-pink-600">
              <FilePlus2 className="h-6 w-6" />
              <h3 className="text-lg font-bold text-gray-800">Compile Report</h3>
            </div>
            
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              Click below to initiate the HERBUDDY Health compiler. Our system collects cycle averages, deficiency trends, mood logs, and clinical consultant logs to compile a professional PDF report.
            </p>

            {success && (
              <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-2xl text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-green-600 shrink-0" />
                <span>{success}</span>
              </div>
            )}
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-semibold">
                {error}
              </div>
            )}
          </div>

          <div>
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl font-bold shadow-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                  <span>Compiling Patient Records...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4.5 w-4.5" />
                  <span>Compile PDF Health Summary</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* List of previously generated reports */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-md">
            <h3 className="font-bold text-gray-800 text-md mb-4 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-pink-600" />
              <span>Available Diagnostic Files</span>
            </h3>

            <div className="space-y-3">
              {reportsList.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs italic">
                  No compiled reports found. Hit compile on the sidebar to build your first summary.
                </div>
              ) : (
                reportsList.map(rep => (
                  <div key={rep._id} className="bg-white/80 p-4.5 rounded-2xl border border-pink-50 shadow-sm flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-pink-50 text-pink-600 rounded-xl shadow-inner">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-gray-800 text-sm">{rep.title}</h4>
                        <div className="flex items-center space-x-2 text-[10px] text-gray-400 mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>Compiled: {new Date(rep.date).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={rep.download_url}
                      className="p-3.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl shadow-md hover:opacity-90 transition active:scale-95 flex items-center justify-center"
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
