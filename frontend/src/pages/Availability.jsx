import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  Coffee,
  CalendarX,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import doctorService from '../services/doctorService';
import availabilityService from '../services/availabilityService';
import auditService from '../services/auditService';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const Availability = () => {
  const { user, role } = useAuth();
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Leave Modal State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveSession, setLeaveSession] = useState('FULL_DAY');
  const [leaveReason, setLeaveReason] = useState('');

  useEffect(() => {
    const initDoctors = async () => {
      try {
        setLoading(true);
        const docList = await doctorService.getAllDoctors();
        setDoctors(docList);

        const activeList = docList.filter((d) => d.status !== 'INACTIVE' && d.status !== 'LEFT_HOSPITAL');
        const paramDocId = searchParams.get('doctorId');
        if (paramDocId) {
          setSelectedDoctorId(paramDocId);
        } else if (role === 'DOCTOR' && user?.doctorId) {
          setSelectedDoctorId(String(user.doctorId));
        } else if (activeList.length > 0) {
          setSelectedDoctorId(String(activeList[0].id));
        } else if (docList.length > 0) {
          setSelectedDoctorId(String(docList[0].id));
        }
      } catch (err) {
        setError('Failed to load doctors roster');
      } finally {
        setLoading(false);
      }
    };
    initDoctors();
  }, [role, user]);

  const fetchDoctorAvailability = async (docId) => {
    if (!docId) return;
    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');
      const data = await availabilityService.getDoctorAvailability(docId);
      setAvailability(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch schedule availability');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDoctorId) {
      fetchDoctorAvailability(selectedDoctorId);
    }
  }, [selectedDoctorId]);

  const toggleDay = (day) => {
    if (!availability) return;
    const currentDays = availability.workingDays || [];
    const updated = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];
    setAvailability({ ...availability, workingDays: updated });
  };

  // Quick Preset Handlers
  const applyMorningPreset = () => {
    if (!availability) return;
    setAvailability({
      ...availability,
      shiftStart: '08:00',
      shiftEnd: '13:00',
      breakStart: '10:30',
      breakEnd: '11:00',
      maxCapacityPerDay: 15,
    });
    setSuccessMsg('Applied Morning Availability Preset (08:00 AM - 01:00 PM). Click "Save Schedule" to commit.');
  };

  const applyFullDayPreset = () => {
    if (!availability) return;
    setAvailability({
      ...availability,
      shiftStart: '09:00',
      shiftEnd: '17:00',
      breakStart: '13:00',
      breakEnd: '14:00',
      maxCapacityPerDay: 20,
    });
    setSuccessMsg('Applied Full Day Preset (09:00 AM - 05:00 PM). Click "Save Schedule" to commit.');
  };

  const applyEveningPreset = () => {
    if (!availability) return;
    setAvailability({
      ...availability,
      shiftStart: '14:00',
      shiftEnd: '20:00',
      breakStart: '16:30',
      breakEnd: '17:00',
      maxCapacityPerDay: 18,
    });
    setSuccessMsg('Applied Evening Shift Preset (02:00 PM - 08:00 PM). Click "Save Schedule" to commit.');
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccessMsg('');
      // Real Spring Boot POST /doctors/{docId}/availability for each day
      await availabilityService.updateDoctorAvailability(selectedDoctorId, availability);

      const docObj = doctors.find((d) => d.id === Number(selectedDoctorId));
      auditService.logAction({
        user: `${user?.role?.toLowerCase() || 'admin'} (${user?.name || 'User'})`,
        action: 'UPDATE_AVAILABILITY',
        entity: 'DoctorSchedule',
        entityId: String(selectedDoctorId),
        details: `Updated consultation hours (${availability.shiftStart} - ${availability.shiftEnd}) for Dr. ${docObj?.name || 'Physician'}`,
      });

      setSuccessMsg('Doctor consultation shift and working hours updated successfully in MySQL database!');
      fetchDoctorAvailability(selectedDoctorId);
    } catch (err) {
      setError(err.message || 'Error saving availability to database');
    } finally {
      setSaving(false);
    }
  };

  const handleAddLeave = async (e) => {
    e.preventDefault();
    if (!leaveDate) return;
    try {
      // Real Spring Boot POST /doctors/leave
      await availabilityService.addDoctorLeave(selectedDoctorId, {
        leaveDate: leaveDate,
        sessionType: leaveSession || 'FULL_DAY',
        reason: leaveReason || 'Planned Medical Leave',
      });

      auditService.logAction({
        user: `${user?.role?.toLowerCase() || 'doctor'} (${user?.name || 'User'})`,
        action: 'ADD_LEAVE',
        entity: 'DoctorLeave',
        entityId: leaveDate,
        details: `Marked ${leaveSession} leave for doctor on ${leaveDate}: ${leaveReason}`,
      });

      setIsLeaveModalOpen(false);
      setLeaveDate('');
      setLeaveReason('');
      setLeaveSession('FULL_DAY');
      fetchDoctorAvailability(selectedDoctorId);
      setSuccessMsg('Leave day recorded. Capacity will be locked for this date.');
    } catch (err) {
      setError(err.message || 'Error adding leave');
    }
  };

  const selectedDoctor = doctors.find((d) => d.id === Number(selectedDoctorId));
  const isDoctorInactive = selectedDoctor?.status === 'INACTIVE' || selectedDoctor?.status === 'LEFT_HOSPITAL';

  if (loading && !availability) return <Loading message="Loading doctor availability roster..." />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Doctor Availability &amp; Shift Rostering
          </h1>
          <p className="text-xs text-slate-500">
            Configure morning/evening availability shifts, break times, capacity caps, and planned leaves
          </p>
        </div>

        {role === 'ADMIN' && doctors.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Select Doctor:</label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:border-teal-600 focus:outline-none shadow-sm"
            >
              <optgroup label="Active Consulting Doctors">
                {doctors
                  .filter((d) => d.status !== 'INACTIVE' && d.status !== 'LEFT_HOSPITAL')
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.name || d.fullName} ({d.specialization || d.departmentName})
                    </option>
                  ))}
              </optgroup>
              {doctors.some((d) => d.status === 'INACTIVE' || d.status === 'LEFT_HOSPITAL') && (
                <optgroup label="Left Hospital / Inactive (Schedule Locked)">
                  {doctors
                    .filter((d) => d.status === 'INACTIVE' || d.status === 'LEFT_HOSPITAL')
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        [Left Hospital] Dr. {d.name || d.fullName} ({d.specialization || d.departmentName})
                      </option>
                    ))}
                </optgroup>
              )}
            </select>
          </div>
        )}
      </div>

      {isDoctorInactive && (
        <div className="flex items-center gap-3 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-800 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <div>
            <span className="font-bold">Dr. {selectedDoctor?.name || selectedDoctor?.fullName} has left the hospital.</span> Shift rostering, slot generation, and leave management are locked for this physician.
          </div>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      {/* Main Grid: Working Hours Card & Leaves Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Shift Timing & Working Days */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-teal-600" />
                Shift Hours &amp; Working Days: Dr. {selectedDoctor?.name || selectedDoctor?.fullName || user?.name}
              </h2>
              <p className="text-xs text-slate-500">
                Department: {selectedDoctor?.departmentName || availability?.departmentName || 'Medical Facility'}
              </p>
            </div>

            {/* Quick Shift Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                disabled={isDoctorInactive}
                onClick={applyMorningPreset}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-all flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                title="08:00 AM - 01:00 PM"
              >
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                Morning Shift
              </button>

              <button
                type="button"
                disabled={isDoctorInactive}
                onClick={applyFullDayPreset}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-all flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                title="09:00 AM - 05:00 PM"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Full Day
              </button>

              <button
                type="button"
                disabled={isDoctorInactive}
                onClick={applyEveningPreset}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 transition-all flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                title="02:00 PM - 08:00 PM"
              >
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                Evening Shift
              </button>
            </div>
          </div>

          {availability && (
            <form onSubmit={handleSaveSchedule} className="space-y-6">
              {/* Working Days Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Weekly Working Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_DAYS.map((day) => {
                    const isSelected = (availability.workingDays || []).some(
                      (d) => d.toLowerCase() === day.toLowerCase()
                    );
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Consultation Shift Timings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    Shift Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={availability.shiftStart || '09:00'}
                    onChange={(e) => setAvailability({ ...availability, shiftStart: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    Shift End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={availability.shiftEnd || '17:00'}
                    onChange={(e) => setAvailability({ ...availability, shiftEnd: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Break Timings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1 flex items-center gap-1.5">
                    <Coffee className="w-3.5 h-3.5 text-amber-600" />
                    Break Start Time
                  </label>
                  <input
                    type="time"
                    value={availability.breakStart || '13:00'}
                    onChange={(e) => setAvailability({ ...availability, breakStart: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1 flex items-center gap-1.5">
                    <Coffee className="w-3.5 h-3.5 text-amber-600" />
                    Break End Time
                  </label>
                  <input
                    type="time"
                    value={availability.breakEnd || '14:00'}
                    onChange={(e) => setAvailability({ ...availability, breakEnd: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Max Capacity per Day */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Max Daily Consultation Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={availability.maxCapacityPerDay || 20}
                    onChange={(e) => setAvailability({ ...availability, maxCapacityPerDay: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Default Slot Duration
                  </label>
                  <div className="px-3 py-2 text-xs rounded-xl bg-slate-100 border border-slate-200 font-semibold text-slate-700">
                    30 Minutes (Auto-calculated by Capacity Engine)
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={saving || isDoctorInactive}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-md shadow-teal-600/30 hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving to Database...' : isDoctorInactive ? 'Schedule Locked (Doctor Inactive)' : 'Save Schedule to Database'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Col: Planned Leaves & Time Off */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CalendarX className="w-5 h-5 text-rose-600" />
                  Doctor Leaves &amp; Time Off
                </h2>
                <p className="text-xs text-slate-500">Scheduled leave will lock patient booking</p>
              </div>
              <button
                type="button"
                disabled={isDoctorInactive}
                onClick={() => setIsLeaveModalOpen(true)}
                className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 disabled:opacity-40 disabled:cursor-not-allowed"
                title={isDoctorInactive ? 'Doctor is inactive' : 'Apply Leave'}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto">
              {!availability?.leaves || availability.leaves.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No active leaves recorded for this doctor.
                </div>
              ) : (
                availability.leaves.map((leave) => (
                  <div
                    key={leave.id}
                    className="p-3 rounded-xl border border-rose-100 bg-rose-50/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{leave.leaveDate}</p>
                      <p className="text-[11px] text-slate-500">{leave.reason}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-rose-200 text-rose-900">
                        {leave.sessionType || 'FULL_DAY'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {leave.status || 'APPROVED'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            When leave is approved, booking slots for that session are automatically disabled for patients.
          </div>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Record Doctor Leave"
        size="sm"
      >
        <form onSubmit={handleAddLeave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Leave Date *
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={leaveDate}
              onChange={(e) => setLeaveDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Session Type *
            </label>
            <select
              value={leaveSession}
              onChange={(e) => setLeaveSession(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-rose-500 focus:outline-none"
            >
              <option value="FULL_DAY">Full Day</option>
              <option value="MORNING">Morning Leave (Before 1:00 PM)</option>
              <option value="AFTERNOON">Afternoon Leave (After 1:00 PM)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Reason *
            </label>
            <input
              type="text"
              required
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              placeholder="e.g. Medical conference, personal leave"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
            >
              Confirm Leave
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Availability;
