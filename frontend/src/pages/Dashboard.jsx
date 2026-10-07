import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  Clock,
  Activity,
  AlertTriangle,
  Building,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  TrendingUp,
  HeartPulse,
  Bell,
  Calendar,
  Sparkles,
  UserCheck,
  ChevronRight,
  PlusCircle,
  Inbox,
  ShieldAlert,
  Radio,
  Stethoscope,
  PhoneCall,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import dashboardService from '../services/dashboardService';
import appointmentService from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import ConsultationModal from '../components/ConsultationModal';
import useQueueWebSocket from '../hooks/useQueueWebSocket';

// Custom Tooltip for Doctor Utilisation Horizontal Chart
const DoctorUtilTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[210px]">
        <p className="font-bold text-teal-300 border-b border-slate-800 pb-1">{data.doctor}</p>
        <p className="text-slate-300 flex justify-between">
          <span>Department:</span> <span className="font-medium text-white">{data.department}</span>
        </p>
        <p className="text-slate-300 flex justify-between">
          <span>Booked Appointments:</span>{' '}
          <span className="font-bold text-teal-400">{data.booked}</span>
        </p>
        <p className="text-slate-300 flex justify-between">
          <span>Daily Capacity:</span> <span className="font-bold text-slate-200">{data.capacity}</span>
        </p>
        <p className="text-slate-300 flex justify-between pt-1 border-t border-slate-800">
          <span>Utilisation Rate:</span>{' '}
          <span className="font-bold text-emerald-400">{data.utilizationRate || Math.round((data.booked / Math.max(1, data.capacity)) * 100)}%</span>
        </p>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Department Workload Horizontal Chart
const DeptWorkloadTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[210px]">
        <p className="font-bold text-teal-300 border-b border-slate-800 pb-1">{data.department}</p>
        <p className="text-slate-300 flex justify-between">
          <span>Active Appointments:</span>{' '}
          <span className="font-bold text-teal-400">{data.activePatients}</span>
        </p>
        <p className="text-slate-300 flex justify-between">
          <span>Capacity Ceiling:</span> <span className="font-bold text-slate-200">{data.maxCapacity}</span>
        </p>
        <p className="text-slate-300 flex justify-between pt-1 border-t border-slate-800">
          <span>Load Level:</span> <span className="font-bold text-emerald-400">{data.percentage}%</span>
        </p>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Status Donut
const StatusTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    return (
      <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl border border-slate-700 text-xs">
        <p className="font-semibold text-slate-300">{entry.name}</p>
        <p className="font-bold text-white text-sm">
          {entry.value} <span className="text-xs text-slate-400 font-normal">appointments</span>
        </p>
      </div>
    );
  }
  return null;
};

export const Dashboard = () => {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Staff Dashboard Data
  const [stats, setStats] = useState(null);
  const [doctorUtil, setDoctorUtil] = useState([]);
  const [deptWorkload, setDeptWorkload] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState({});
  const [liveQueue, setLiveQueue] = useState([]);

  // Patient Dashboard Data
  const [myAppointments, setMyAppointments] = useState([]);
  const [todayAppointment, setTodayAppointment] = useState(null);

  // Consultation Modal
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [activeConsultationAppt, setActiveConsultationAppt] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setError('');

      if (role === 'PATIENT') {
        const appts = await appointmentService.getMyAppointments();
        setMyAppointments(appts || []);

        const todayStr = new Date().toISOString().split('T')[0];
        const todayMatch = (appts || []).find(
          (a) =>
            a.appointmentDate === todayStr &&
            a.status !== 'CANCELLED' &&
            a.status !== 'NO_SHOW'
        );
        setTodayAppointment(todayMatch || null);
      } else {
        const [statsData, utilData, deptData, statusData, queueData] = await Promise.all([
          dashboardService.getCapacityMetrics(),
          dashboardService.getDoctorUtilization(),
          dashboardService.getDepartmentWorkload(),
          dashboardService.getAppointmentStatusBreakdown(),
          dashboardService.getLiveQueueMonitor(),
        ]);

        setStats(statsData);
        setDoctorUtil(utilData || []);
        setDeptWorkload(deptData || []);
        setStatusBreakdown(statusData || {});
        setLiveQueue(queueData || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to backend operational services');
    } finally {
      setLoading(false);
    }
  }, [role]);

  // Real-time WebSocket listener
  const handleWsEvent = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const { isConnected } = useQueueWebSocket(handleWsEvent);

  useEffect(() => {
    setLoading(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) return <Loading message="Loading real-time operational analytics..." />;

  // ----------------------------------------------------
  // PATIENT PORTAL DASHBOARD VIEW
  // ----------------------------------------------------
  if (role === 'PATIENT') {
    const upcoming = myAppointments.filter(
      (a) => a.status === 'SCHEDULED' || a.status === 'IN_QUEUE' || a.status === 'IN_CONSULTATION' || a.status === 'CONFIRMED'
    );
    const completed = myAppointments.filter((a) => a.status === 'COMPLETED');

    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 rounded-2xl text-white shadow-lg shadow-teal-950/20">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Patient Health Portal
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, {user?.fullName || user?.name || user?.username || 'Patient'}!
            </h1>
            <p className="text-xs text-teal-100/80 mt-1">
              Manage your healthcare appointments, live queue status, and doctor consultations.
            </p>
          </div>

          <Link
            to="/appointments"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md shadow-teal-500/30 transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" /> Book New Consultation
          </Link>
        </div>

        {/* Dynamic Today's Appointment Reminder Alert */}
        {todayAppointment ? (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-teal-500/10 border-2 border-amber-500/40 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-700 flex-shrink-0 mt-0.5 sm:mt-0">
                  <Bell className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500 text-white uppercase tracking-wider">
                      Appointment Today
                    </span>
                    <span className="text-xs font-medium text-slate-600">
                      Token #{todayAppointment.tokenNumber || todayAppointment.id}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    Dr. {todayAppointment.doctorName} &bull; {todayAppointment.departmentName}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Scheduled Time: <strong className="text-slate-900">{todayAppointment.appointmentTime || 'Scheduled Time'}</strong> | Status:{' '}
                    <span className="font-semibold text-teal-800">{todayAppointment.status}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Link
                  to="/appointments"
                  className="flex-1 sm:flex-initial text-center px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-sm"
                >
                  View Instructions
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-500">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">No Appointments Scheduled For Today</p>
                <p className="text-[11px] text-slate-500">You are all caught up. Need to see a physician? Book a slot anytime.</p>
              </div>
            </div>
            <Link
              to="/appointments"
              className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              Book Now <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Active Bookings</p>
              <h3 className="text-2xl font-bold text-slate-900">{upcoming.length}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Completed Visits</p>
              <h3 className="text-2xl font-bold text-slate-900">{completed.length}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Registered Phone</p>
              <h3 className="text-sm font-bold text-slate-800 mt-1">{user?.phone || 'Verified Profile'}</h3>
            </div>
          </div>
        </div>

        {/* My Appointments Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">My Appointments</h2>
              <p className="text-xs text-slate-500">View and track all your hospital bookings</p>
            </div>
            <Link
              to="/appointments"
              className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              Full Appointment Manager <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {myAppointments.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CalendarCheck className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No appointments booked yet</p>
              <p className="text-xs text-slate-500 mt-1">Book your first consultation with our certified doctors.</p>
              <Link
                to="/appointments"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-md hover:bg-teal-700 transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Book Appointment
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3 px-3">Token</th>
                    <th className="pb-3 px-3">Doctor</th>
                    <th className="pb-3 px-3">Department</th>
                    <th className="pb-3 px-3">Date &amp; Time</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myAppointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-teal-900">
                        #{appt.tokenNumber || appt.id}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        Dr. {appt.doctorName || 'Physician'}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {appt.departmentName || 'Outpatient'}
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {appt.appointmentDate} &bull; {appt.appointmentTime || appt.scheduledTime || '10:00 AM'}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={appt.status} />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          to="/appointments"
                          className="text-xs font-semibold text-teal-700 hover:text-teal-900"
                        >
                          Manage
                        </Link>
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
  }

  // ----------------------------------------------------
  // STAFF DASHBOARD VIEW (Admin, Doctor, Receptionist, Manager)
  // ----------------------------------------------------
  const STATUS_CONFIG = {
    CONFIRMED: { name: 'Confirmed', color: '#0d9488' },
    SCHEDULED: { name: 'Scheduled', color: '#0284c7' },
    COMPLETED: { name: 'Completed', color: '#10b981' },
    IN_QUEUE: { name: 'In Queue', color: '#3b82f6' },
    IN_CONSULTATION: { name: 'In Consultation', color: '#8b5cf6' },
    CANCELLED: { name: 'Cancelled', color: '#ef4444' },
    NO_SHOW: { name: 'No Show', color: '#64748b' },
  };

  const statusPieData = Object.entries(statusBreakdown || {})
    .filter(([_, val]) => Number(val) > 0)
    .map(([statusKey, val]) => {
      const cfg = STATUS_CONFIG[statusKey] || {
        name: statusKey.replace(/_/g, ' '),
        color: '#0d9488',
      };
      return {
        key: statusKey,
        name: cfg.name,
        value: Number(val),
        color: cfg.color,
      };
    });

  const totalTodayAppointments = statusPieData.reduce((acc, curr) => acc + curr.value, 0);

  // Check for emergency triage patients in queue
  const emergencyPatient = liveQueue.find((q) => q.priority === 'EMERGENCY' && q.status === 'WAITING');

  // Find active patient in room for logged-in doctor
  const inConsultationPatient = liveQueue.find((q) => q.status === 'IN_CONSULTATION');

  const doctorChartHeight = Math.max(280, (doctorUtil.length || 1) * 75 + 60);
  const deptChartHeight = Math.max(280, (deptWorkload.length || 1) * 55 + 60);

  const handleLaunchConsultation = (item) => {
    const appointmentObj = {
      id: item.appointmentId || item.id,
      appointmentNumber: item.appointmentNumber || item.tokenNumber,
      patientName: item.patientName,
      patientCode: item.patientCode || item.patientNumber,
      patientPhone: item.patientPhone,
      doctorName: item.doctorName,
      appointmentTypeName: item.appointmentTypeName || 'Consultation',
      reasonForVisit: item.reasonForVisit || '',
    };
    setActiveConsultationAppt(appointmentObj);
    setIsConsultationModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Mode Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Capacity &amp; Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Real-time appointment capacity, doctor utilisation, and queue triage
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            isConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
            {isConnected ? 'Real-Time WebSocket Sync Active' : 'Connecting WebSocket...'}
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Emergency Triage Priority Alert Banner */}
      {emergencyPatient && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-900 flex items-center justify-between shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-200/80 rounded-xl text-rose-700">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-600 text-white uppercase tracking-wider">
                  Emergency Triage P1
                </span>
                <span className="font-mono font-bold text-rose-900">
                  Token {emergencyPatient.tokenNumber} &bull; {emergencyPatient.patientName}
                </span>
              </div>
              <p className="text-xs text-rose-700 mt-0.5">
                Immediate attention required for Dr. {emergencyPatient.doctorName} ({emergencyPatient.departmentName})
              </p>
            </div>
          </div>
          <Link
            to="/queue"
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow transition-all"
          >
            Go to Queue Board &rarr;
          </Link>
        </div>
      )}

      {/* Doctor Active Station Quick-Action Card (if patient is in consultation) */}
      {inConsultationPatient && (role === 'DOCTOR' || role === 'ADMIN') && (
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 p-5 rounded-2xl text-white shadow-xl border border-teal-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-teal-500/20 border border-teal-400/30 rounded-xl text-teal-300">
              <Stethoscope className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider">
                Current Patient In Room
              </span>
              <h3 className="text-xl font-extrabold font-mono text-white mt-0.5">
                Token {inConsultationPatient.tokenNumber} &mdash; {inConsultationPatient.patientName}
              </h3>
              <p className="text-xs text-teal-100/80">
                Attending: Dr. {inConsultationPatient.doctorName} &bull; {inConsultationPatient.departmentName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => handleLaunchConsultation(inConsultationPatient)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-teal-500/30 transition-all"
            >
              <FileText className="w-4 h-4" />
              Open Consultation &amp; Prescribe (Rx)
            </button>
          </div>
        </div>
      )}

      {/* Row 1: Top 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Appointments
            </span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">{stats?.totalAppointmentsToday || 0}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Recorded bookings today</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active In Queue
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">{stats?.activeInQueue || 0}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Patients in waiting triage</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Completed Visits
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">{stats?.completedConsultations || 0}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Consultations completed</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Overall Capacity
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">{stats?.overallCapacityUtilization || 85}%</h3>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, stats?.overallCapacityUtilization || 85)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Doctor Utilisation & Today's Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Doctor Utilisation Rate */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Doctor Utilisation Rate</h2>
                <p className="text-xs text-slate-500">Booked consultations vs Maximum daily capacity</p>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
                OPD Physicians
              </span>
            </div>

            {doctorUtil.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <UserCheck className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No doctor utilisation data available</p>
                <p className="text-xs text-slate-400 mt-1">Doctor rosters and capacity will appear once active.</p>
              </div>
            ) : (
              <div className="w-full" style={{ height: doctorChartHeight, minHeight: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={doctorUtil}
                    margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis
                      type="number"
                      stroke="#94a3b8"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="doctor"
                      width={185}
                      stroke="#94a3b8"
                      tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 500 }}
                    />
                    <Tooltip content={<DoctorUtilTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }}
                    />
                    <Bar
                      dataKey="capacity"
                      name="Daily Capacity"
                      fill="#cbd5e1"
                      radius={[0, 4, 4, 0]}
                      barSize={14}
                    />
                    <Bar
                      dataKey="booked"
                      name="Booked Appointments"
                      fill="#0d9488"
                      radius={[0, 4, 4, 0]}
                      barSize={14}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Dynamic capacity ceiling enforcement</span>
            <span className="font-medium text-teal-700">Capacity limits active</span>
          </div>
        </div>

        {/* Today's Appointment Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Today's Appointment Status</h2>
                <p className="text-xs text-slate-500">Distribution of current day bookings across workflow</p>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                Daily Breakdown
              </span>
            </div>

            {totalTodayAppointments === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="p-3 bg-slate-50 text-slate-400 rounded-full border border-slate-200 mb-3 shadow-inner">
                  <CalendarCheck className="w-8 h-8" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No appointments scheduled for today</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Today's appointment status will appear here when bookings are available.
                </p>
              </div>
            ) : (
              <div>
                <div className="h-56 w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<StatusTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-slate-800 leading-none">{totalTodayAppointments}</span>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 mt-0.5">Total Today</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-4 border-t border-slate-100">
                  {statusPieData.map((item) => {
                    const pct = Math.round((item.value / totalTodayAppointments) * 100);
                    return (
                      <div
                        key={item.name}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 border border-slate-100 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-slate-600 font-medium truncate">{item.name}</span>
                        </div>
                        <span className="font-bold text-slate-900 ml-1">
                          {item.value} <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Workflow stages: Scheduled &rarr; In Queue &rarr; Completed</span>
            <span className="font-medium text-teal-700">Real-time sync</span>
          </div>
        </div>
      </div>

      {/* Row 3: Department Workload & Live Active Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Department Workload */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Department Workload vs Limit</h2>
                <p className="text-xs text-slate-500">Active appointments vs Department capacity ceiling</p>
              </div>
              <Building className="w-4 h-4 text-slate-400" />
            </div>

            {deptWorkload.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Building className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No department workload data available</p>
                <p className="text-xs text-slate-400 mt-1">Department metrics will populate with clinic activity.</p>
              </div>
            ) : (
              <div className="w-full" style={{ height: deptChartHeight, minHeight: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={deptWorkload}
                    margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis
                      type="number"
                      stroke="#94a3b8"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="department"
                      width={130}
                      stroke="#94a3b8"
                      tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 500 }}
                    />
                    <Tooltip content={<DeptWorkloadTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }}
                    />
                    <Bar
                      dataKey="maxCapacity"
                      name="Capacity Ceiling"
                      fill="#cbd5e1"
                      radius={[0, 4, 4, 0]}
                      barSize={12}
                    />
                    <Bar
                      dataKey="activePatients"
                      name="Active Appointments"
                      fill="#0f766e"
                      radius={[0, 4, 4, 0]}
                      barSize={12}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Wing allocations monitored by Spring Boot</span>
            <span className="font-medium text-teal-700">Ceilings enforced</span>
          </div>
        </div>

        {/* Live Active Queue Monitor with Prescribe Action */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Live Active Queue</h2>
                <p className="text-xs text-slate-500">Real-time token calls and triage priorities</p>
              </div>
              <Link
                to="/queue"
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
              >
                Full Queue <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {liveQueue.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">Queue is currently clear</p>
                <p className="text-xs text-slate-400 mt-1">No patients are waiting in triage. All consultations up to date.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
                {liveQueue.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-teal-900 bg-teal-50 px-2 py-1 rounded-lg border border-teal-200">
                        {item.tokenNumber}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-800">{item.patientName}</p>
                        <p className="text-slate-500 text-[11px]">{item.doctorName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={item.priority} type="priority" />
                      <StatusBadge status={item.status} />
                      {(item.status === 'IN_CONSULTATION' || role === 'DOCTOR' || role === 'ADMIN') && (
                        <button
                          type="button"
                          onClick={() => handleLaunchConsultation(item)}
                          className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Open Consultation & Prescription (Rx)"
                        >
                          <Stethoscope className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Automatic Priority: Emergency &bull; Senior Citizen</span>
            <span className="font-medium text-teal-700">Estimated Wait Times Active</span>
          </div>
        </div>
      </div>

      {/* Doctor Consultation Modal */}
      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        appointment={activeConsultationAppt}
        onConsultationSaved={() => {
          fetchDashboardData();
        }}
      />
    </div>
  );
};

export default Dashboard;
