import React, { useState, useEffect } from 'react';
import { History, Search, Calendar, Filter, FileText, Clock, UserCheck } from 'lucide-react';
import appointmentService from '../services/appointmentService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';

export const AppointmentHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      // Calling real Spring Boot GET /appointments/history
      const data = await appointmentService.getAppointmentHistory();
      setHistory(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch appointment archives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesSearch =
      !search ||
      item.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      item.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
      (item.tokenNumber && item.tokenNumber.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <History className="w-3.5 h-3.5" />
            Outpatient Records Archive
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Appointment History</h1>
          <p className="text-sm text-slate-500">
            Historical audit records of completed, cancelled, rescheduled, and missed patient consultations
          </p>
        </div>
      </div>

      <ErrorMessage message={error} onRetry={fetchHistory} />

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient, doctor, or token..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-2 px-3 text-xs rounded-lg border border-slate-200 bg-white"
        >
          <option value="ALL">All Past Consultations</option>
          <option value="COMPLETED">Completed Only</option>
          <option value="CANCELLED">Cancelled Only</option>
          <option value="RESCHEDULED">Rescheduled Only</option>
          <option value="MISSED">Missed Only</option>
        </select>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <Loading message="Loading appointment archive..." />
        ) : filteredHistory.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <History className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium">No past appointments found in this category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Token / ID</th>
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">Attending Doctor</th>
                  <th className="py-3.5 px-4">Scheduled Slot</th>
                  <th className="py-3.5 px-4">Final Status</th>
                  <th className="py-3.5 px-4">Audit Outcome / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-teal-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-800">
                      {item.tokenNumber || `#${item.id}`}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{item.patientName}</div>
                      <div className="text-[11px] text-slate-400">{item.patientNumber}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{item.doctorName}</div>
                      <div className="text-[11px] text-slate-500">{item.departmentName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">{item.appointmentDate}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {item.appointmentTime}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      {item.status === 'CANCELLED' && (
                        <div className="text-rose-700">
                          <span className="font-semibold">Reason:</span> {item.cancellationReason || 'Patient request'}
                        </div>
                      )}
                      {item.status === 'RESCHEDULED' && (
                        <div className="text-indigo-700">
                          <span className="font-semibold">Reason:</span> {item.rescheduleReason || 'Schedule adjustment'}
                        </div>
                      )}
                      {item.status === 'COMPLETED' && (
                        <div className="text-emerald-700">
                          Consultation completed successfully &bull; Prescriptions filed
                        </div>
                      )}
                      {item.status === 'MISSED' && (
                        <div className="text-amber-700">
                          Patient did not report during called queue window
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentHistory;
