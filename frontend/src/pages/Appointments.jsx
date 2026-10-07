import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  User,
  Building,
  Tag,
  FileText,
  AlertTriangle,
  Bell,
  Sun,
  Moon,
  Stethoscope,
  Ticket,
} from 'lucide-react';
import appointmentService from '../services/appointmentService';
import patientService from '../services/patientService';
import doctorService from '../services/doctorService';
import departmentService from '../services/departmentService';
import queueService from '../services/queueService';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import ConsultationModal from '../components/ConsultationModal';

export const Appointments = () => {
  const { user, role } = useAuth();
  const [searchParams] = useSearchParams();

  // Appointments List State
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Dropdown Metadata State
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Filter State
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  
  const [bookingForm, setBookingForm] = useState({
    patientId: '',
    departmentId: '',
    doctorId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '',
    type: 'GENERAL',
    priority: 'NORMAL',
    notes: '',
  });

  // Slot recommendations from backend
  const [recommendedSlots, setRecommendedSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Reschedule & Cancel Modal States
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    id: null,
    doctorId: null,
    newDate: new Date().toISOString().split('T')[0],
    newTime: '',
    reason: '',
  });
  const [rescheduleSlots, setRescheduleSlots] = useState([]);

  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelData, setCancelData] = useState({ id: null, reason: '' });

  // Consultation & Prescription Modal State
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [selectedConsultationAppt, setSelectedConsultationAppt] = useState(null);

  // Today's reminder for patients
  const [todayReminder, setTodayReminder] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      let list = [];

      if (role === 'PATIENT') {
        list = await appointmentService.getMyAppointments();
        const todayStr = new Date().toISOString().split('T')[0];
        const matchToday = list.find(
          (a) => a.appointmentDate === todayStr && a.status !== 'CANCELLED' && a.status !== 'NO_SHOW'
        );
        setTodayReminder(matchToday || null);
      } else {
        const filters = {};
        if (selectedDoctorFilter) filters.doctorId = selectedDoctorFilter;
        if (selectedDeptFilter) filters.departmentId = selectedDeptFilter;
        if (selectedStatusFilter) filters.status = selectedStatusFilter;
        list = await appointmentService.getAllAppointments(filters);
      }

      setAppointments(list);
    } catch (err) {
      setError(err.message || 'Failed to load appointments from database');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (appt) => {
    try {
      setError('');
      setSuccessMessage('');
      const token = await queueService.generateToken(appt);
      setSuccessMessage(`Patient ${appt.patientName} checked in! Live Token generated: ${token?.tokenNumber || 'Token'}`);
      fetchAppointments();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to check in patient');
    }
  };

  const loadMetadata = async () => {
    try {
      const [docs, depts] = await Promise.all([
        doctorService.getAllDoctors(),
        departmentService.getAllDepartments(),
      ]);
      setDoctors(docs);
      setDepartments(depts);

      if (role !== 'PATIENT') {
        const pats = await patientService.getAllPatients();
        setPatients(pats);
      }
    } catch (err) {
      console.error('Failed to load doctors or departments:', err);
    }
  };

  useEffect(() => {
    loadMetadata();
    const docParam = searchParams.get('doctorId');
    if (docParam) {
      setSelectedDoctorFilter(docParam);
      setBookingForm((prev) => ({ ...prev, doctorId: docParam }));
      setIsBookingOpen(true);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [role, selectedDoctorFilter, selectedDeptFilter, selectedStatusFilter]);

  // Fetch Recommended Slots when Doctor + Date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!bookingForm.doctorId || !bookingForm.appointmentDate) {
        setRecommendedSlots([]);
        return;
      }
      try {
        setSlotsLoading(true);
        const slots = await appointmentService.getRecommendedSlots(
          bookingForm.doctorId,
          bookingForm.appointmentDate
        );
        setRecommendedSlots(slots);
      } catch (err) {
        console.error('Error fetching slots:', err);
        setRecommendedSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    if (isBookingOpen) {
      fetchSlots();
    }
  }, [bookingForm.doctorId, bookingForm.appointmentDate, isBookingOpen]);

  // Fetch slots for reschedule
  useEffect(() => {
    const fetchRescheduleSlots = async () => {
      if (!rescheduleData.doctorId || !rescheduleData.newDate) return;
      try {
        const slots = await appointmentService.getRecommendedSlots(
          rescheduleData.doctorId,
          rescheduleData.newDate
        );
        setRescheduleSlots(slots);
      } catch (err) {
        console.error('Error fetching reschedule slots:', err);
      }
    };
    if (isRescheduleOpen) {
      fetchRescheduleSlots();
    }
  }, [rescheduleData.doctorId, rescheduleData.newDate, isRescheduleOpen]);

  const handleOpenBooking = () => {
    setBookingError('');
    setBookingForm({
      patientId: role === 'PATIENT' ? String(user?.patientId || '') : '',
      departmentId: departments[0]?.id ? String(departments[0].id) : '',
      doctorId: doctors[0]?.id ? String(doctors[0].id) : '',
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '',
      type: 'GENERAL',
      priority: 'NORMAL',
      notes: '',
    });
    setIsBookingOpen(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const effectivePatientId = role === 'PATIENT' ? user?.patientId : bookingForm.patientId;

    if (!effectivePatientId) {
      setBookingError('Patient profile not linked. Please select or log in as a registered patient.');
      return;
    }
    if (!bookingForm.doctorId) {
      setBookingError('Please select a doctor');
      return;
    }
    if (!bookingForm.appointmentTime) {
      setBookingError('Please select an available consultation time slot');
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError('');

      let timeFormatted = bookingForm.appointmentTime.trim();
      if (timeFormatted.includes(' - ')) {
        timeFormatted = timeFormatted.split(' - ')[0].trim();
      }
      if (timeFormatted.includes(' ')) {
        const parts = timeFormatted.split(' ');
        const timePart = parts[0];
        const modifier = parts[1];
        let [hours, minutes] = timePart.split(':');
        if (modifier.toLowerCase() === 'pm' && hours !== '12') hours = String(Number(hours) + 12);
        if (modifier.toLowerCase() === 'am' && hours === '12') hours = '00';
        timeFormatted = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
      } else if (timeFormatted.length === 5) {
        timeFormatted += ':00';
      }

      const selectedDoc = doctors.find(d => d.id === Number(bookingForm.doctorId));
      const targetDeptId = bookingForm.departmentId ? Number(bookingForm.departmentId) : (selectedDoc?.departmentId || 1);

      const payload = {
        patientId: Number(effectivePatientId),
        doctorId: Number(bookingForm.doctorId),
        departmentId: targetDeptId,
        appointmentTypeId: 1,
        scheduledStartTime: `${bookingForm.appointmentDate}T${timeFormatted}`,
        appointmentDate: bookingForm.appointmentDate,
        appointmentTime: timeFormatted,
        priorityCategory: bookingForm.priority || 'SCHEDULED_STANDARD',
        reasonForVisit: bookingForm.notes || 'Consultation booking',
        type: bookingForm.type || 'GENERAL',
        priority: bookingForm.priority || 'NORMAL',
        notes: bookingForm.notes || 'Consultation booking',
      };

      const result = await appointmentService.createAppointment(payload);
      setIsBookingOpen(false);
      setSuccessMessage(`Appointment confirmed! Token #${result.tokenNumber || 'Assigned'}`);
      setTimeout(() => setSuccessMessage(''), 6000);
      fetchAppointments();
    } catch (err) {
      setBookingError(err.message || 'Failed to book appointment in database');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleData.newDate || !rescheduleData.newTime) {
      alert('Please choose new date and time');
      return;
    }
    try {
      await appointmentService.rescheduleAppointment(rescheduleData.id, {
        newDate: rescheduleData.newDate,
        newTime: rescheduleData.newTime.length === 5 ? `${rescheduleData.newTime}:00` : rescheduleData.newTime,
        reason: rescheduleData.reason || 'Rescheduled by patient',
      });
      setIsRescheduleOpen(false);
      setSuccessMessage('Appointment rescheduled successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
      fetchAppointments();
    } catch (err) {
      alert(err.message || 'Failed to reschedule');
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    try {
      await appointmentService.cancelAppointment(cancelData.id, cancelData.reason || 'Cancelled');
      setIsCancelOpen(false);
      setSuccessMessage('Appointment has been cancelled');
      setTimeout(() => setSuccessMessage(''), 5000);
      fetchAppointments();
    } catch (err) {
      alert(err.message || 'Failed to cancel appointment');
    }
  };

  // Filtered List
  const filteredAppointments = appointments.filter((appt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (appt.patientName && appt.patientName.toLowerCase().includes(q)) ||
      (appt.doctorName && appt.doctorName.toLowerCase().includes(q)) ||
      (appt.tokenNumber && String(appt.tokenNumber).toLowerCase().includes(q)) ||
      (appt.departmentName && appt.departmentName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {role === 'PATIENT' ? 'My Appointments & Consultations' : 'Appointment Operations & Capacity Booking'}
          </h1>
          <p className="text-xs text-slate-500">
            {role === 'PATIENT'
              ? 'Book doctor visits, view real-time time slots, and track tokens'
              : 'Real-time capacity scheduling, slot recommendations, and queue triage'}
          </p>
        </div>

        <button
          onClick={handleOpenBooking}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-600/30 hover:bg-teal-700 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {role === 'PATIENT' ? 'Book New Appointment' : 'Book Patient Appointment'}
        </button>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && <ErrorMessage message={error} />}

      {/* Today's Reminder Banner for Patient */}
      {role === 'PATIENT' && todayReminder && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 shadow-sm flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500 text-white flex-shrink-0 mt-0.5">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200 text-amber-900">
              Appointment Today &bull; Token #{todayReminder.tokenNumber || 'T-01'}
            </span>
            <p className="text-sm font-bold text-amber-950 mt-1">
              You have an appointment today with Dr. {todayReminder.doctorName} ({todayReminder.departmentName}) at {todayReminder.scheduledTime || 'Scheduled Time'}.
            </p>
            <p className="text-xs text-amber-800 mt-0.5">
              Please check in with reception or proceed to the consultation room 15 minutes before your time.
            </p>
          </div>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by token, doctor, patient..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 focus:outline-none"
          />
        </div>

        {role !== 'PATIENT' && (
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <select
              value={selectedDoctorFilter}
              onChange={(e) => setSelectedDoctorFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:outline-none"
            >
              <option value="">All Doctors</option>
              <optgroup label="Active Doctors">
                {doctors
                  .filter((d) => d.status !== 'INACTIVE' && d.status !== 'LEFT_HOSPITAL')
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.name || d.fullName}
                    </option>
                  ))}
              </optgroup>
              {doctors.some((d) => d.status === 'INACTIVE' || d.status === 'LEFT_HOSPITAL') && (
                <optgroup label="Past / Inactive Doctors">
                  {doctors
                    .filter((d) => d.status === 'INACTIVE' || d.status === 'LEFT_HOSPITAL')
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        [Inactive] Dr. {d.name || d.fullName}
                      </option>
                    ))}
                </optgroup>
              )}
            </select>

            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:outline-none"
            >
              <option value="">All Departments</option>
              {departments.map((dep) => (
                <option key={dep.id} value={dep.id}>
                  {dep.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_QUEUE">In Queue</option>
              <option value="IN_CONSULTATION">In Consultation</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        )}
      </div>

      {/* Appointments List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12">
            <Loading message="Fetching appointment records from Spring Boot backend..." />
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No appointments found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or book a new appointment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Token / ID</th>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Doctor &amp; Dept</th>
                  <th className="py-3.5 px-4">Schedule Date &amp; Time</th>
                  <th className="py-3.5 px-4">Type &amp; Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-900">
                      #{appt.tokenNumber || appt.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{appt.patientName || 'Patient'}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{appt.patientCode || ''}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">Dr. {appt.doctorName || 'Doctor'}</p>
                      <p className="text-[11px] text-slate-500">{appt.departmentName || 'General'}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-semibold">{appt.appointmentDate}</div>
                      <div className="text-[11px] text-slate-500">{appt.scheduledTime || '10:00 AM'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {appt.type || 'GENERAL'}
                        </span>
                        <StatusBadge status={appt.priority || 'NORMAL'} type="priority" />
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={appt.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Check-In Button for Confirmed / Scheduled appointments */}
                        {(appt.status === 'CONFIRMED' || appt.status === 'SCHEDULED') && (
                          <button
                            onClick={() => handleCheckIn(appt)}
                            className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5"
                            title="Check-In Patient to Live Queue"
                          >
                            <Ticket className="w-3.5 h-3.5" />
                            <span>Check-In</span>
                          </button>
                        )}

                        {/* Consultation / Rx button */}
                        {(appt.status === 'COMPLETED' || appt.status === 'IN_PROGRESS' || role === 'DOCTOR' || role === 'ADMIN') && (
                          <button
                            onClick={() => {
                              setSelectedConsultationAppt({
                                id: appt.id,
                                appointmentNumber: appt.tokenNumber || appt.id,
                                patientName: appt.patientName,
                                patientCode: appt.patientCode,
                                patientPhone: appt.patientPhone,
                                doctorName: appt.doctorName,
                                appointmentTypeName: appt.type || 'General Consultation',
                                reasonForVisit: appt.notes || appt.reasonForVisit || '',
                              });
                              setIsConsultationOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-indigo-200 text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100 transition-all flex items-center gap-1 text-[11px] font-semibold"
                            title={appt.status === 'COMPLETED' ? 'View / Print Prescription PDF' : 'Consultation & Prescriptions'}
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Rx</span>
                          </button>
                        )}

                        {appt.status !== 'COMPLETED' && appt.status !== 'CANCELLED' && (
                          <>
                            <button
                              onClick={() => {
                                setRescheduleData({
                                  id: appt.id,
                                  doctorId: appt.doctorId,
                                  newDate: appt.appointmentDate,
                                  newTime: appt.scheduledTime || '10:00:00',
                                  reason: '',
                                });
                                setIsRescheduleOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-teal-700 transition-all"
                              title="Reschedule"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setCancelData({ id: appt.id, reason: '' });
                                setIsCancelOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all"
                              title="Cancel"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
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

      {/* Booking Modal */}
      <Modal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        title={role === 'PATIENT' ? 'Book Your Appointment' : 'Book Patient Consultation Slot'}
        size="lg"
      >
        {bookingError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{bookingError}</span>
          </div>
        )}

        <form onSubmit={handleBookingSubmit} className="space-y-4">
          {/* Patient Selection (Staff only; locked for logged-in Patient) */}
          {role !== 'PATIENT' ? (
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                Select Patient *
              </label>
              <select
                required
                value={bookingForm.patientId}
                onChange={(e) => setBookingForm({ ...bookingForm, patientId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:outline-none"
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} ({p.patientCode || p.phone})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between text-xs text-teal-950">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Patient Profile</span>
                <p className="font-bold text-sm">{user?.name || user?.username}</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-teal-200 text-teal-900 font-mono text-xs font-bold">
                PATIENT PORTAL
              </span>
            </div>
          )}

          {/* Department & Doctor Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                Department
              </label>
              <select
                value={bookingForm.departmentId}
                onChange={(e) => {
                  const deptId = e.target.value;
                  setBookingForm({
                    ...bookingForm,
                    departmentId: deptId,
                    doctorId: doctors.find((d) => !deptId || String(d.departmentId) === deptId)?.id || '',
                  });
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:outline-none"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                Doctor *
              </label>
              <select
                required
                value={bookingForm.doctorId}
                onChange={(e) => setBookingForm({ ...bookingForm, doctorId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:outline-none"
              >
                <option value="">-- Choose Doctor --</option>
                {doctors
                  .filter(
                    (d) =>
                      (!bookingForm.departmentId || String(d.departmentId) === String(bookingForm.departmentId)) &&
                      d.status !== 'INACTIVE' &&
                      d.status !== 'LEFT_HOSPITAL'
                  )
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.name || d.fullName} ({d.specialization || d.departmentName})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Appointment Date *
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={bookingForm.appointmentDate}
              onChange={(e) => setBookingForm({ ...bookingForm, appointmentDate: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:outline-none"
            />
          </div>

          {/* Real Backend Available Slots */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase text-slate-700">
                Available Consultation Slots *
              </label>
              <span className="text-[10px] text-teal-700 font-semibold">
                Live capacity verification
              </span>
            </div>

            {slotsLoading ? (
              <div className="py-4 text-center text-xs text-slate-500">Checking doctor availability...</div>
            ) : recommendedSlots.length === 0 ? (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                No slots available on this date. Doctor may not be scheduled or is on leave.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                {recommendedSlots.map((s, idx) => {
                  const isAvail = s.status === 'AVAILABLE' || s.available;
                  const isSelected = bookingForm.appointmentTime === s.time || bookingForm.appointmentTime === s.formattedTime;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!isAvail}
                      onClick={() => setBookingForm({ ...bookingForm, appointmentTime: s.formattedTime || s.time })}
                      className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : isAvail
                          ? 'bg-white hover:border-teal-500 border-slate-200 text-slate-800'
                          : 'bg-slate-50 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{s.formattedTime || s.time}</span>
                        {isAvail ? (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded ${isSelected ? 'bg-teal-700 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
                            Avail
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Booked</span>
                        )}
                      </div>
                      <span className={`text-[10px] mt-1 truncate ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                        {s.capacityInfo || (isAvail ? 'Slot verified' : 'Unavailable')}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Consultation Type & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                Consultation Type
              </label>
              <select
                value={bookingForm.type}
                onChange={(e) => setBookingForm({ ...bookingForm, type: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:outline-none"
              >
                <option value="GENERAL">General Checkup</option>
                <option value="FOLLOW_UP">Follow-up Consultation</option>
                <option value="SPECIALIST">Specialist Review</option>
                <option value="EMERGENCY">Emergency Triage</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                Reason / Symptoms
              </label>
              <input
                type="text"
                value={bookingForm.notes}
                onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                placeholder="e.g. Fever, routine follow-up"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsBookingOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={bookingLoading}
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/30 transition-all disabled:opacity-50"
            >
              {bookingLoading ? 'Processing Booking...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        title="Reschedule Appointment"
        size="md"
      >
        <form onSubmit={handleRescheduleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Select New Date
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={rescheduleData.newDate}
              onChange={(e) => setRescheduleData({ ...rescheduleData, newDate: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Available Slots for New Date
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
              {rescheduleSlots.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={!s.available && s.status !== 'AVAILABLE'}
                  onClick={() => setRescheduleData({ ...rescheduleData, newTime: s.formattedTime || s.time })}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                    rescheduleData.newTime === s.formattedTime || rescheduleData.newTime === s.time
                      ? 'bg-teal-600 text-white border-teal-600'
                      : s.available || s.status === 'AVAILABLE'
                      ? 'bg-white border-slate-200 text-slate-700 hover:border-teal-500'
                      : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  {s.formattedTime || s.time}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Reason for Reschedule
            </label>
            <input
              type="text"
              value={rescheduleData.reason}
              onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
              placeholder="e.g. Schedule conflict"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-teal-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRescheduleOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md"
            >
              Confirm Reschedule
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        title="Cancel Appointment"
        size="sm"
      >
        <form onSubmit={handleCancelSubmit} className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to cancel this appointment? The capacity slot will be released back to the hospital pool.
          </p>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Cancellation Reason
            </label>
            <input
              type="text"
              required
              value={cancelData.reason}
              onChange={(e) => setCancelData({ ...cancelData, reason: e.target.value })}
              placeholder="e.g. Patient recovery, personal emergency"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCancelOpen(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Keep
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
            >
              Confirm Cancellation
            </button>
          </div>
        </form>
      </Modal>

      {/* Consultation & Digital Prescription Modal */}
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
        appointment={selectedConsultationAppt}
        onConsultationSaved={() => {
          fetchAppointments();
        }}
      />
    </div>
  );
};

export default Appointments;
