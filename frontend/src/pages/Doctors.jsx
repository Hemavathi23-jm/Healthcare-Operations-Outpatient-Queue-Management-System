import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Search,
  Plus,
  Building,
  Clock,
  Star,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import doctorService from '../services/doctorService';
import departmentService from '../services/departmentService';
import auditService from '../services/auditService';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import { Link } from 'react-router-dom';

export const Doctors = () => {
  const { user, role } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDropModalOpen, setIsDropModalOpen] = useState(false);
  const [doctorToDrop, setDoctorToDrop] = useState(null);
  const [dropLoading, setDropLoading] = useState(false);
  const [dropError, setDropError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'
  const [actionSuccess, setActionSuccess] = useState('');

  const initialForm = {
    name: '',
    email: '',
    phone: '',
    departmentId: '',
    specialization: '',
    roomNumber: 'OPD-101',
    maxPatientsPerDay: 25,
    slotDurationMinutes: 30,
    experienceYears: 8,
  };
  const [formData, setFormData] = useState(initialForm);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [docData, deptData] = await Promise.all([
        doctorService.getAllDoctors(selectedDept || null),
        departmentService.getAllDepartments(),
      ]);
      setDoctors(docData);
      setDepartments(deptData);
      if (deptData.length > 0 && !formData.departmentId) {
        setFormData((prev) => ({ ...prev, departmentId: deptData[0].id }));
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch doctor roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDept]);

  const handleDropDoctor = async () => {
    if (!doctorToDrop) return;
    try {
      setDropLoading(true);
      setDropError('');
      await doctorService.deleteDoctor(doctorToDrop.id);
      
      auditService.logAction({
        user: `${user?.role?.toLowerCase() || 'admin'} (${user?.name || 'User'})`,
        action: 'DOCTOR_LEFT_HOSPITAL',
        entity: 'Doctor',
        entityId: String(doctorToDrop.id),
        details: `Doctor ${doctorToDrop.name || doctorToDrop.fullName} marked as left hospital / removed from active schedule`,
      });

      setActionSuccess(`Dr. ${doctorToDrop.name || doctorToDrop.fullName} has been removed/deactivated from active hospital schedule.`);
      setIsDropModalOpen(false);
      setDoctorToDrop(null);
      fetchData();
      setTimeout(() => setActionSuccess(''), 6000);
    } catch (err) {
      setDropError(err.message || 'Failed to remove physician');
    } finally {
      setDropLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.departmentId) {
      setFormError('Doctor name and department are required.');
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError('');
      const selectedDeptObj = departments.find((d) => d.id === Number(formData.departmentId));
      // Calling real Spring Boot POST /doctors
      const newDoc = await doctorService.createDoctor({
        ...formData,
        departmentName: selectedDeptObj?.name || 'General Medicine',
        maxPatientsPerDay: Number(formData.maxPatientsPerDay) || 25,
        slotDurationMinutes: Number(formData.slotDurationMinutes) || 30,
      });

      auditService.logAction({
        user: `${user?.role?.toLowerCase() || 'admin'} (${user?.name || 'User'})`,
        action: 'ADD_DOCTOR',
        entity: 'Doctor',
        entityId: String(newDoc.id),
        details: `Added ${newDoc.name} (${newDoc.specialization}) to ${newDoc.departmentName}`,
      });

      setIsAddModalOpen(false);
      setFormData(initialForm);
      fetchData();
    } catch (err) {
      setFormError(err.message || 'Failed to add doctor');
    } finally {
      setFormSubmitting(false);
    }
  };

  const filteredDoctors = doctors.filter((d) => {
    const matchesSearch =
      (d.name || d.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.specialization || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.departmentName || '').toLowerCase().includes(search.toLowerCase());

    const isInactive = d.status === 'INACTIVE' || d.status === 'LEFT_HOSPITAL';
    if (statusFilter === 'ACTIVE' && isInactive) return false;
    if (statusFilter === 'INACTIVE' && !isInactive) return false;

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <UserCheck className="w-3.5 h-3.5" />
            Medical Staff Directory
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Consulting Physicians</h1>
          <p className="text-sm text-slate-500">
            Physician specializations, OPD allocations, staff replacement, and active status
          </p>
        </div>

        {role === 'ADMIN' && (
          <button
            onClick={() => {
              setFormError('');
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add New Physician
          </button>
        )}
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs font-semibold text-emerald-800 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      <ErrorMessage message={error} onRetry={fetchData} />

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by doctor name or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Left Hospital / Inactive</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loading message="Loading doctor roster..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDoctors.map((doc) => {
            const isInactive = doc.status === 'INACTIVE' || doc.status === 'LEFT_HOSPITAL';
            return (
              <div
                key={doc.id}
                className={`bg-white rounded-2xl p-5 border shadow-sm transition-all flex flex-col justify-between ${
                  isInactive
                    ? 'border-slate-300/80 bg-slate-50/50 opacity-80'
                    : 'border-slate-200/80 hover:border-teal-300 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold text-base border ${
                          isInactive
                            ? 'bg-slate-200 text-slate-600 border-slate-300'
                            : 'bg-teal-100 text-teal-800 border-teal-200'
                        }`}
                      >
                        {(doc.name || doc.fullName || 'Doctor').replace('Dr. ', '').charAt(0) || 'D'}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">
                          {doc.name || doc.fullName || 'Doctor'}
                        </h3>
                        <p className="text-xs text-teal-700 font-medium">{doc.departmentName || 'General Medicine'}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                        {doc.rating || 4.8}
                      </span>
                      {isInactive ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                          Left Hospital
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 font-medium">{doc.specialization || 'General Consultation'}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Consultation Room:</span>
                      <span className="font-semibold text-slate-800">{doc.roomNumber || 'OPD-101'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Slot Duration:</span>
                      <span className="font-semibold text-slate-800">{doc.slotDurationMinutes || 30} mins/patient</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Daily Capacity:</span>
                      <span className="font-bold text-teal-700">{doc.maxPatientsPerDay || 25} max/day</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isInactive ? (
                      <span
                        title="Doctor has left hospital. Schedule is locked and inactive."
                        className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg cursor-not-allowed flex items-center gap-1.5 border border-slate-200"
                      >
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Schedule Inactive
                      </span>
                    ) : (
                      <Link
                        to={`/availability?doctorId=${doc.id}`}
                        className="text-xs font-semibold text-slate-600 hover:text-teal-700 flex items-center gap-1"
                      >
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        Schedule
                      </Link>
                    )}

                    {role === 'ADMIN' && !isInactive && (
                      <button
                        onClick={() => {
                          setDropError('');
                          setDoctorToDrop(doc);
                          setIsDropModalOpen(true);
                        }}
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:underline px-1.5 py-0.5"
                      >
                        Doctor Left? Drop
                      </button>
                    )}
                  </div>

                  {!isInactive && (
                    <Link
                      to={`/appointments?doctorId=${doc.id}&departmentId=${doc.departmentId}`}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
                    >
                      Book Slot
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Doctor Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Consulting Physician"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Doctor Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. S. Kulkarni"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department *
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specialization / Sub-specialty
              </label>
              <input
                type="text"
                required
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g. Pediatric Neurologist"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                OPD Room Number
              </label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                placeholder="OPD-201"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Max Consultations/Day
              </label>
              <input
                type="number"
                min="5"
                max="80"
                value={formData.maxPatientsPerDay}
                onChange={(e) => setFormData({ ...formData, maxPatientsPerDay: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Consultation Slot Duration (Minutes)
              </label>
              <select
                value={formData.slotDurationMinutes}
                onChange={(e) => setFormData({ ...formData, slotDurationMinutes: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200"
              >
                <option value={15}>15 Minutes</option>
                <option value={20}>20 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 00000"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="doctor@hospital.org"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20"
            >
              {formSubmitting ? 'Saving...' : 'Add Physician'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Drop / Doctor Left Hospital Confirmation Modal */}
      <Modal
        isOpen={isDropModalOpen}
        onClose={() => {
          if (!dropLoading) {
            setIsDropModalOpen(false);
            setDoctorToDrop(null);
          }
        }}
        title="Physician Left Hospital / Drop Name"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          {dropError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              {dropError}
            </div>
          )}

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <p className="font-bold text-amber-950 mb-1">
                Confirm Departure of {doctorToDrop?.name || doctorToDrop?.fullName}?
              </p>
              <p>
                When a doctor leaves the hospital, their name will be dropped from active booking rosters and OPD schedules.
              </p>
              <p className="mt-2 text-[11px] text-amber-800">
                • If the doctor has past consultation and appointment history, their account is deactivated as <span className="font-semibold">INACTIVE</span> to preserve clinical and legal records.
                <br />
                • If no clinical history exists, their profile and schedules are cleanly deleted.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={dropLoading}
              onClick={() => {
                setIsDropModalOpen(false);
                setDoctorToDrop(null);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={dropLoading}
              onClick={handleDropDoctor}
              className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20"
            >
              {dropLoading ? 'Processing...' : 'Confirm Doctor Left'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Doctors;
