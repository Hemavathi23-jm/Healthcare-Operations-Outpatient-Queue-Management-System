import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit2,
  Calendar,
  Phone,
  Mail,
  AlertCircle,
  FileText,
  UserCheck,
} from 'lucide-react';
import patientService from '../services/patientService';
import auditService from '../services/auditService';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import { Link } from 'react-router-dom';

export const Patients = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Form State
  const initialForm = {
    name: '',
    age: '',
    gender: 'MALE',
    phone: '',
    email: '',
    bloodGroup: 'O+',
    address: '',
    allergies: 'None',
  };
  const [formData, setFormData] = useState(initialForm);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchPatients = async (query = '') => {
    try {
      setLoading(true);
      setError('');
      // Calling real Spring Boot GET /patients?search=...
      const data = await patientService.getAllPatients(query);
      setPatients(data);
    } catch (err) {
      setError(err.message || 'Error loading patient directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(search);
  }, [search]);

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setFormError('Patient Name and Phone number are required.');
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError('');
      // Real Spring Boot POST /patients
      const newPatient = await patientService.createPatient({
        ...formData,
        age: Number(formData.age) || 30,
      });

      // Log in audit log
      auditService.logAction({
        user: `${user?.role?.toLowerCase() || 'staff'} (${user?.name || 'User'})`,
        action: 'REGISTER_PATIENT',
        entity: 'Patient',
        entityId: newPatient.patientNumber || String(newPatient.id),
        details: `Registered patient ${newPatient.name}, age ${newPatient.age}, phone ${newPatient.phone}`,
      });

      setIsAddModalOpen(false);
      setFormData(initialForm);
      fetchPatients(search);
    } catch (err) {
      setFormError(err.message || 'Failed to register patient');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    try {
      setFormSubmitting(true);
      setFormError('');
      // Real Spring Boot PUT /patients/{id}
      await patientService.updatePatient(selectedPatient.id, {
        ...formData,
        age: Number(formData.age),
      });

      // Log audit
      auditService.logAction({
        user: `${user?.role?.toLowerCase() || 'staff'} (${user?.name || 'User'})`,
        action: 'UPDATE_PATIENT',
        entity: 'Patient',
        entityId: selectedPatient.patientNumber,
        details: `Updated details for ${formData.name}`,
      });

      setIsEditModalOpen(false);
      setSelectedPatient(null);
      fetchPatients(search);
    } catch (err) {
      setFormError(err.message || 'Failed to update patient');
    } finally {
      setFormSubmitting(false);
    }
  };

  const openEditModal = (p) => {
    setSelectedPatient(p);
    setFormData({
      name: p.name,
      age: p.age,
      gender: p.gender,
      phone: p.phone,
      email: p.email || '',
      bloodGroup: p.bloodGroup || 'O+',
      address: p.address || '',
      allergies: p.allergies || 'None',
    });
    setIsEditModalOpen(true);
  };

  const openViewModal = (p) => {
    setSelectedPatient(p);
    setIsViewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <Users className="w-3.5 h-3.5" />
            Patient Registry
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Patient Directory</h1>
          <p className="text-sm text-slate-500">
            Registered UHID records, medical history links, and triage profiles
          </p>
        </div>

        <button
          onClick={() => {
            setFormData(initialForm);
            setFormError('');
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Register New Patient
        </button>
      </div>

      <ErrorMessage message={error} onRetry={() => fetchPatients(search)} />

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by UHID, patient name, or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 placeholder:text-slate-400"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
          Showing <span className="font-bold text-slate-800">{patients.length}</span> patients
        </span>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <Loading message="Fetching patient records..." />
        ) : patients.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium">No patient records found</p>
            <p className="text-xs text-slate-400 mt-1">Try a different search query or register a new patient.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">UHID / Number</th>
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">Demographics</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Blood Group</th>
                  <th className="py-3.5 px-4">Allergies</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-teal-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-teal-800">
                      {p.patientNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 text-sm">{p.name}</div>
                      <div className="text-[11px] text-slate-400">Reg: {p.registeredDate || '2026-01-01'}</div>
                    </td>
                    <td className="py-3 px-4">
                      {p.age} yrs &bull; <span className="capitalize">{p.gender?.toLowerCase()}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div>{p.phone}</div>
                      {p.email && <div className="text-[11px] text-slate-400">{p.email}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold border border-slate-200">
                        {p.bloodGroup || 'O+'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={p.allergies && p.allergies !== 'None' ? 'text-rose-600 font-medium' : 'text-slate-400'}>
                        {p.allergies || 'None'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openViewModal(p)}
                          title="View Profile"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          title="Edit Details"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/appointments?patientId=${p.id}&patientName=${encodeURIComponent(p.name)}`}
                          title="Book Appointment"
                          className="p-1.5 rounded-lg text-teal-600 hover:text-teal-800 hover:bg-teal-50 transition-colors"
                        >
                          <Calendar className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Patient"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreatePatient} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Age
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="e.g. 45"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="patient@example.com"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Blood Group
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Known Allergies (if any)
            </label>
            <input
              type="text"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              placeholder="e.g. Penicillin, Aspirin, or None"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Residential Address
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Address details..."
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
            />
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
              {formSubmitting ? 'Registering...' : 'Save & Register'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Patient Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Patient: ${selectedPatient?.patientNumber || ''}`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleUpdatePatient} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Allergies</label>
            <input
              type="text"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl"
            >
              {formSubmitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Patient Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Patient Healthcare Card"
        maxWidth="max-w-md"
      >
        {selectedPatient && (
          <div className="space-y-4">
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-mono font-bold text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200">
                    {selectedPatient.patientNumber}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">{selectedPatient.name}</h3>
                  <p className="text-xs text-slate-600">
                    {selectedPatient.age} yrs &bull; {selectedPatient.gender}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-lg bg-teal-700 text-white font-bold text-xs">
                    {selectedPatient.bloodGroup}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Phone:</span>
                <span className="font-medium">{selectedPatient.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Email:</span>
                <span className="font-medium">{selectedPatient.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Known Allergies:</span>
                <span className="font-semibold text-rose-600">{selectedPatient.allergies || 'None'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Address:</span>
                <span className="font-medium text-right max-w-[200px] truncate">{selectedPatient.address || 'N/A'}</span>
              </div>
            </div>

            <div className="pt-3">
              <Link
                to={`/appointments?patientId=${selectedPatient.id}&patientName=${encodeURIComponent(selectedPatient.name)}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md shadow-teal-600/20"
              >
                <Calendar className="w-4 h-4" />
                Book Consultation for this Patient
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Patients;
