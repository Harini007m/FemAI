import React, { useState, useEffect } from 'react';
import { Stethoscope, Calendar, Clock, Clipboard, FileText, Send, User, ChevronRight, Check } from 'lucide-react';

export default function DoctorPortal({ token, user }) {
  const [appointments, setAppointments] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [reason, setReason] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [activeApptId, setActiveApptId] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const isDoctor = user?.role === 'doctor';

  useEffect(() => {
    if (token) {
      fetchDoctors();
      fetchAppointments();
    }
  }, [token]);

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/auth/doctors');
      if (res.ok) {
        const data = await res.json();
        setDoctorsList(data);
        if (data.length > 0) setSelectedDoc(data[0]._id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctor_id: selectedDoc,
          appointment_date: apptDate,
          reason: reason
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Booking failed');

      setSuccess('Consultation scheduled successfully!');
      setApptDate('');
      setReason('');
      fetchAppointments();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateNotes = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!activeApptId) {
      setError('Please select an active consultation to write notes.');
      return;
    }

    try {
      const res = await fetch(`/api/appointments/${activeApptId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          notes: doctorNotes,
          diagnosis,
          prescription,
          recommendations,
          follow_up_date: followUpDate
        })
        });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save notes');

      setSuccess('Clinical checkup notes updated and sent to patient!');
      setDoctorNotes('');
      setDiagnosis('');
      setPrescription('');
      setRecommendations('');
      setFollowUpDate('');
      setActiveApptId(null);
      fetchAppointments();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Clinical Consultation Portal</h1>
        <p className="text-gray-500 text-sm">
          {isDoctor 
            ? 'Review patient biological twins and update diagnostic records.' 
            : 'Book digital appointments with licensed specialists and review clinical records.'}
        </p>
      </div>

      {isDoctor ? (
        // DOCTOR WORKSPACE
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List of Consultations */}
          <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-md flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-800 text-md mb-4 flex items-center space-x-2">
                <Clipboard className="h-5 w-5 text-purple-600" />
                <span>Assigned Consultation Queues</span>
              </h3>
              
              <div className="space-y-3">
                {appointments.length === 0 ? (
                  <p className="text-xs text-gray-400">No scheduled consultations found.</p>
                ) : (
                  appointments.map(appt => (
                    <button
                      key={appt._id}
                      onClick={() => {
                        setActiveApptId(appt._id);

                        setDoctorNotes(appt.doctor_notes || '');

                        setDiagnosis(
                          appt.consultation_report?.diagnosis || ''
                        );

                        setPrescription(
                          appt.consultation_report?.prescription || ''
                        );

                        setRecommendations(
                          appt.consultation_report?.recommendations || ''
                        );

                        setFollowUpDate(
                          appt.consultation_report?.follow_up_date || ''
                        );
                      }}
                      className={`w-full p-4 rounded-2xl border text-left text-xs transition flex flex-col space-y-1.5 ${activeApptId === appt._id ? 'bg-purple-50/70 border-purple-400 text-purple-700' : 'bg-white border-pink-50 text-gray-600'}`}
                    >
                      <div className="flex justify-between w-full font-bold">
                        <span>Patient: {appt.patient_name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase ${appt.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {appt.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-[10px]">Reason: {appt.reason}</p>
                      <p className="text-gray-400 text-[10px]">Date: {new Date(appt.appointment_date).toLocaleString()}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Form to leave Notes */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-md">
              <h3 className="font-bold text-gray-800 text-md mb-4 flex items-center space-x-2">
                <Stethoscope className="h-5 w-5 text-purple-600" />
                <span>Write Clinical Guidelines</span>
              </h3>

              {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl text-xs font-medium">{success}</div>}
              {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium">{error}</div>}

              {activeApptId ? (
                <form onSubmit={handleUpdateNotes} className="space-y-4">
                  <div className="p-4 bg-purple-50/20 border border-purple-50/50 rounded-2xl">
                    <span className="text-[10px] font-bold text-purple-600 uppercase">Selected Log Context</span>
                    <h4 className="font-bold text-gray-800 text-xs mt-1">
                      Patient Name: {appointments.find(a => a._id === activeApptId)?.patient_name}
                    </h4>
                    <p className="text-gray-400 text-[10px] mt-0.5">
                      Consultation Date: {new Date(appointments.find(a => a._id === activeApptId)?.appointment_date || '').toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-4">

                    <input
                      type="text"
                      placeholder="Diagnosis"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 border border-pink-150 rounded-xl text-xs"
                    />

                    <input
                      type="text"
                      placeholder="Prescription"
                      value={prescription}
                      onChange={(e) => setPrescription(e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 border border-pink-150 rounded-xl text-xs"
                    />

                    <textarea
                      rows="3"
                      placeholder="Recommendations"
                      value={recommendations}
                      onChange={(e) => setRecommendations(e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 border border-pink-150 rounded-xl text-xs"
                    />

                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 border border-pink-150 rounded-xl text-xs"
                    />

                    <textarea
                      rows="6"
                      placeholder="Clinical Notes"
                      value={doctorNotes}
                      onChange={(e) => setDoctorNotes(e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 border border-pink-150 rounded-xl text-xs"
                      required
                    />

                  </div>



                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setActiveApptId(null)}
                      className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition"
                    >
                      Update Consultation Files
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-12 text-gray-400 text-xs italic">
                  Select a consultation queue item from the sidebar to compile reports.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // PATIENT WORKSPACE
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Appointment Scheduler */}
          <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-md">
            <h3 className="font-bold text-gray-800 text-md mb-4 flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-pink-600" />
              <span>Schedule Consult</span>
            </h3>

            {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl text-xs font-medium">{success}</div>}
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium">{error}</div>}

            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Select Specialist</label>
                <select
                  value={selectedDoc}
                  onChange={(e) => setSelectedDoc(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/70 border border-pink-100 rounded-xl text-xs"
                >
                  {doctorsList.map(doc => (
                    <option key={doc._id} value={doc._id}>
                      {doc.name} — {doc.specialty}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Consultation Time & Date</label>
                <input
                  type="datetime-local"
                  value={apptDate}
                  onChange={(e) => setApptDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/70 border border-pink-100 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Reason for Visit</label>
                <textarea
                  placeholder="Describe your concerns: e.g. severe period pain, PCOS screen details, irregular cycles"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 bg-white/70 border border-pink-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs placeholder:text-gray-400"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold shadow-md hover:opacity-90 transition text-xs"
              >
                Schedule Appointment
              </button>
            </form>
          </div>

          {/* Consultation History and Notes Display */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-md">
              <h3 className="font-bold text-gray-800 text-md mb-4 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-pink-600" />
                <span>Your Consultations History</span>
              </h3>

              <div className="space-y-4">
                {appointments.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No booked appointments. Schedule a consult using the form.</p>
                ) : (
                  appointments.map(appt => (
                    <div key={appt._id} className="bg-white/80 p-5 rounded-2xl border border-pink-50 shadow-sm space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-black text-gray-800 text-sm">{appt.doctor_name}</h4>
                          <div className="flex items-center space-x-2 text-gray-400 text-[10px] mt-0.5">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(appt.appointment_date).toLocaleString()}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${appt.status === 'Completed' ? 'bg-green-150 text-green-700 border border-green-200' : 'bg-amber-150 text-amber-700 border border-amber-200'}`}>
                          {appt.status}
                        </span>
                      </div>

                      <div className="border-t border-gray-50 pt-2 text-xs">
                        <span className="block font-bold text-gray-400 uppercase text-[8px] mb-0.5">Reason for consult</span>
                        <p className="text-gray-600 text-xs">{appt.reason}</p>
                      </div>

                      {appt.doctor_notes && (
                        <div className="bg-purple-50/30 border border-purple-50 p-4 rounded-xl text-xs mt-2">
                          <span className="block font-black text-purple-700 uppercase text-[9px] mb-1">Doctor's Clinical Notes</span>
                          <p className="text-gray-700 whitespace-pre-line leading-relaxed">{appt.doctor_notes}</p>
                        </div>
                      )}
                      {appt.consultation_report && (
                        <div className="bg-blue-50/40 border border-blue-100 p-4 rounded-xl text-xs mt-2">

                          <span className="block font-black text-blue-700 uppercase text-[9px] mb-2">
                            Consultation Report
                          </span>

                          {appt.consultation_report.diagnosis && (
                            <p>
                              <strong>Diagnosis:</strong> {appt.consultation_report.diagnosis}
                            </p>
                          )}

                          {appt.consultation_report.prescription && (
                            <p>
                              <strong>Prescription:</strong> {appt.consultation_report.prescription}
                            </p>
                          )}

                          {appt.consultation_report.recommendations && (
                            <p>
                              <strong>Recommendations:</strong> {appt.consultation_report.recommendations}
                            </p>
                          )}

                          {appt.consultation_report.follow_up_date && (
                            <p>
                              <strong>Follow Up:</strong> {appt.consultation_report.follow_up_date}
                            </p>
                          )}

  </div>
)}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
