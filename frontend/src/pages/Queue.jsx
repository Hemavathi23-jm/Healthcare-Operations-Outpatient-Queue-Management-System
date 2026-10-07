import React, { useState, useEffect, useCallback } from 'react';
import {
  ListOrdered,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  Volume2,
  PhoneCall,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Stethoscope,
  Radio,
  FileText,
  Printer,
} from 'lucide-react';
import queueService from '../services/queueService';
import auditService from '../services/auditService';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConsultationModal from '../components/ConsultationModal';
import useQueueWebSocket from '../hooks/useQueueWebSocket';

export const Queue = () => {
  const { user, role } = useAuth();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  // Priority Change Modal State
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [newPriority, setNewPriority] = useState('EMERGENCY');
  const [priorityReason, setPriorityReason] = useState('Triage Escalation');
  const [updatingPriority, setUpdatingPriority] = useState(false);

  // Focus token for the "Patient Live Queue View" display
  const [patientViewTokenId, setPatientViewTokenId] = useState(null);

  // Consultation Modal State
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [consultationAppointment, setConsultationAppointment] = useState(null);

  const fetchQueue = useCallback(async () => {
    try {
      // Calling real Spring Boot GET /queue
      const data = await queueService.getQueue();
      setQueue(data || []);
      if (data && data.length > 0 && !patientViewTokenId) {
        const firstWaiting = data.find((q) => q.status === 'WAITING') || data[0];
        setPatientViewTokenId(firstWaiting.id);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch active queue');
    } finally {
      setLoading(false);
    }
  }, [patientViewTokenId]);

  // Real-Time WebSocket Hook Subscription
  const handleWsEvent = useCallback((event) => {
    // console.log('[Queue] Real-time event received:', event);
    if (event.message) {
      setActionMessage(`⚡ Real-time Update: ${event.message}`);
    }
    fetchQueue();
  }, [fetchQueue]);

  const { isConnected } = useQueueWebSocket(handleWsEvent);

  useEffect(() => {
    setLoading(true);
    fetchQueue();
  }, [fetchQueue]);

  const handleCallNext = async (item) => {
    try {
      setError('');
      setActionMessage('');
      await queueService.callNext(item.id, item.doctorId);

      auditService.logAction({
        user: `${user?.role?.toLowerCase() || 'doctor'} (${user?.name || 'User'})`,
        action: 'CALL_PATIENT',
        entity: 'QueueToken',
        entityId: item.tokenNumber,
        details: `Called ${item.patientName} (${item.tokenNumber}) into consultation with ${item.doctorName}`,
      });

      setActionMessage(`Now calling Token ${item.tokenNumber} (${item.patientName}) to consultation room!`);
      await fetchQueue();
    } catch (err) {
      setError('Failed to call patient: ' + err.message);
    }
  };

  const handleComplete = async (item) => {
    try {
      setActionMessage('');
      await queueService.completeConsultation(item.id);

      auditService.logAction({
        user: `${user?.role?.toLowerCase() || 'doctor'} (${user?.name || 'User'})`,
        action: 'COMPLETE_CONSULTATION',
        entity: 'QueueToken',
        entityId: item.tokenNumber,
        details: `Completed consultation for ${item.patientName}`,
      });

      setActionMessage(`Token ${item.tokenNumber} consultation completed.`);
      fetchQueue();
    } catch (err) {
      setError('Failed to complete consultation: ' + err.message);
    }
  };

  const handleOpenConsultation = (item) => {
    // Map queue entry to appointment object needed by ConsultationModal
    const appointmentObj = {
      id: item.appointmentId || item.id,
      appointmentNumber: item.appointmentNumber || item.tokenNumber,
      patientName: item.patientName,
      patientCode: item.patientCode || item.patientNumber,
      patientPhone: item.patientPhone,
      doctorName: item.doctorName,
      appointmentTypeName: item.appointmentTypeName || 'General Consultation',
      reasonForVisit: item.reasonForVisit || '',
    };
    setConsultationAppointment(appointmentObj);
    setIsConsultationModalOpen(true);
  };

  const openPriorityModal = (item) => {
    setSelectedToken(item);
    setNewPriority(item.priority === 'EMERGENCY' ? 'NORMAL' : 'EMERGENCY');
    setPriorityReason(
      item.priority === 'EMERGENCY'
        ? 'Condition stabilized, standard triage'
        : 'Acute vital signs triage escalation'
    );
    setIsPriorityModalOpen(true);
  };

  const handleUpdatePriority = async (e) => {
    e.preventDefault();
    if (!selectedToken) return;

    try {
      setUpdatingPriority(true);
      await queueService.updatePriority(selectedToken.id, {
        priority: newPriority,
        priorityReason,
      });

      auditService.logAction({
        user: `${user?.role?.toLowerCase() || 'staff'} (${user?.name || 'User'})`,
        action: 'UPDATE_PRIORITY',
        entity: 'QueueToken',
        entityId: selectedToken.tokenNumber,
        details: `Updated priority to ${newPriority}. Reason: ${priorityReason}`,
      });

      setIsPriorityModalOpen(false);
      setSelectedToken(null);
      setActionMessage(`Priority updated for ${selectedToken.tokenNumber}. Queue re-sorted accordingly.`);
      fetchQueue();
    } catch (err) {
      setError(err.message || 'Failed to update priority');
    } finally {
      setUpdatingPriority(false);
    }
  };

  const patientViewItem = queue.find((q) => q.id === patientViewTokenId) || queue[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <ListOrdered className="w-3.5 h-3.5" />
            Live Outpatient Queue Board
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Queue & Waiting Time</h1>
          <p className="text-sm text-slate-500">
            Real-time token calling, priority triage routing, and estimated waiting time monitor
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Real-time WebSocket connection status badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            isConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
            {isConnected ? 'Live WebSocket Active' : 'Connecting WebSocket...'}
          </div>

          <button
            onClick={fetchQueue}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Queue
          </button>
        </div>
      </div>

      <ErrorMessage message={error} onRetry={fetchQueue} />

      {actionMessage && (
        <div className="p-4 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-teal-600 flex-shrink-0 animate-bounce" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage('')} className="text-teal-700 hover:text-teal-900 font-bold px-1">
            &times;
          </button>
        </div>
      )}

      {/* Patient Live Queue Banner */}
      {patientViewItem && (
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-teal-800/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-teal-400" /> Patient Token Display View
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <h2 className="text-4xl font-extrabold font-mono text-white tracking-tight">
                  Your Token: {patientViewItem.tokenNumber}
                </h2>
                <span className="text-xs px-2.5 py-1 rounded-full bg-teal-800/80 text-teal-200 border border-teal-600/50">
                  {patientViewItem.patientName}
                </span>
              </div>
              <p className="text-xs text-teal-200/80 mt-1">
                Attending: <span className="font-semibold text-white">{patientViewItem.doctorName}</span> &bull; {patientViewItem.departmentName}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15">
              <div className="text-center px-2">
                <span className="block text-[11px] text-teal-200 font-medium">Patients Ahead</span>
                <span className="text-2xl font-black text-white">{patientViewItem.patientsAhead}</span>
              </div>

              <div className="text-center border-x border-white/20 px-3">
                <span className="block text-[11px] text-amber-300 font-bold uppercase tracking-wider">
                  Estimated Waiting Time *
                </span>
                <span className="text-2xl font-black text-amber-300">
                  {patientViewItem.estimatedWaitMinutes} mins
                </span>
                <span className="block text-[9px] text-teal-100/70 italic">* ESTIMATE ONLY</span>
              </div>

              <div className="text-center px-2">
                <span className="block text-[11px] text-teal-200 font-medium">Current Status</span>
                <span className="inline-block mt-1">
                  <StatusBadge status={patientViewItem.status} />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Queue Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm font-bold text-slate-900">Active Queue Tokens</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Emergency (P1) prioritized automatically at top of queue
          </span>
        </div>

        {loading ? (
          <Loading message="Syncing queue positions with backend..." />
        ) : queue.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <CheckCircle className="w-10 h-10 mx-auto text-teal-300 mb-2" />
            <p className="text-sm font-medium">The queue is currently empty.</p>
            <p className="text-xs text-slate-400 mt-1">Check-in scheduled appointments to generate live tokens.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Token</th>
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">Doctor & Room</th>
                  <th className="py-3.5 px-4">Priority & Triage Rule</th>
                  <th className="py-3.5 px-4">Est. Waiting Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queue.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setPatientViewTokenId(item.id)}
                    className={`cursor-pointer transition-colors ${
                      patientViewTokenId === item.id ? 'bg-teal-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-teal-800 text-sm">
                      {item.tokenNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 text-sm">{item.patientName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item.patientNumber || item.patientCode}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{item.doctorName}</div>
                      <div className="text-[11px] text-teal-700 font-medium">{item.departmentName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={item.priority} type="priority" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openPriorityModal(item);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-teal-700 hover:bg-slate-100"
                          title="Change Priority"
                        >
                          <SlidersHorizontal className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Rule: <span className="font-medium text-slate-700">{item.priorityReason || 'Normal priority'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">
                        {item.status === 'IN_CONSULTATION' ? (
                          <span className="text-emerald-600">Now with Doctor</span>
                        ) : (
                          `${item.estimatedWaitMinutes} min (ESTIMATE)`
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.patientsAhead} patients ahead
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {/* Doctor Consultation & Prescription Modal Button */}
                        {(item.status === 'IN_CONSULTATION' || role === 'DOCTOR' || role === 'ADMIN') && (
                          <button
                            onClick={() => handleOpenConsultation(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all"
                            title="Open Clinical Consultation & Prescriptions"
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            <span>Prescribe / Rx</span>
                          </button>
                        )}

                        {item.status === 'WAITING' && (
                          <button
                            onClick={() => handleCallNext(item)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-all"
                          >
                            <PhoneCall className="w-3 h-3" />
                            Call Next
                          </button>
                        )}

                        {item.status === 'IN_CONSULTATION' && (
                          <button
                            onClick={() => handleComplete(item)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Priority Management Modal */}
      <Modal
        isOpen={isPriorityModalOpen}
        onClose={() => setIsPriorityModalOpen(false)}
        title="Manage Triage Priority"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdatePriority} className="space-y-4">
          <p className="text-xs text-slate-600">
            Override the queue priority for Token <span className="font-bold text-slate-900 font-mono">{selectedToken?.tokenNumber}</span> ({selectedToken?.patientName}).
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Priority Classification
            </label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200"
            >
              <option value="EMERGENCY">Emergency (P1) - Immediate Queue Jump</option>
              <option value="SENIOR_CITIZEN">Senior Citizen (P2) - Age Priority</option>
              <option value="NORMAL">Normal (P3) - Standard Sequence</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinical Justification / Rule *
            </label>
            <input
              type="text"
              required
              value={priorityReason}
              onChange={(e) => setPriorityReason(e.target.value)}
              placeholder="e.g. Acute dyspnea, abnormal ECG"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPriorityModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updatingPriority}
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20"
            >
              {updatingPriority ? 'Updating...' : 'Apply Priority'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Doctor Consultation & Prescription Modal */}
      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        appointment={consultationAppointment}
        onConsultationSaved={() => {
          fetchQueue();
        }}
      />
    </div>
  );
};

export default Queue;
