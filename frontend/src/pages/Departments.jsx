import React, { useState, useEffect } from 'react';
import { Building2, Plus, Users, Activity, CheckCircle, AlertCircle } from 'lucide-react';
import departmentService from '../services/departmentService';
import auditService from '../services/auditService';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';

export const Departments = () => {
  const { user, role } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    headDoctor: '',
    dailyCapacity: 40,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError('');
      // Calling real Spring Boot GET /departments
      const data = await departmentService.getAllDepartments();
      setDepartments(data);
    } catch (err) {
      setError(err.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      setFormError('Department Code and Name are required.');
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError('');
      // Real Spring Boot POST /departments
      const newDept = await departmentService.createDepartment({
        ...formData,
        dailyCapacity: Number(formData.dailyCapacity) || 40,
      });

      auditService.logAction({
        user: `${user?.role?.toLowerCase() || 'admin'} (${user?.name || 'User'})`,
        action: 'CREATE_DEPARTMENT',
        entity: 'Department',
        entityId: newDept.code,
        details: `Created department ${newDept.name} with capacity ${newDept.dailyCapacity}`,
      });

      setIsAddModalOpen(false);
      setFormData({ code: '', name: '', description: '', headDoctor: '', dailyCapacity: 40 });
      fetchDepartments();
    } catch (err) {
      setFormError(err.message || 'Error creating department');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <Building2 className="w-3.5 h-3.5" />
            Hospital Wings & Specialties
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Medical Departments</h1>
          <p className="text-sm text-slate-500">
            Outpatient department capacity limits and active physician allocation
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
            Add Department
          </button>
        )}
      </div>

      <ErrorMessage message={error} onRetry={fetchDepartments} />

      {loading ? (
        <Loading message="Loading departments..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 border border-teal-100 text-teal-700">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 uppercase">
                        {dept.code}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">{dept.name}</h3>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2">
                  {dept.description || 'Specialized clinical care wing and outpatient diagnostic services.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Head of Dept:</span>
                    <span className="font-semibold text-slate-800">{dept.headDoctor || 'Dr. Consultant'}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Active Doctors:</span>
                    <span className="font-bold text-teal-700">{dept.activeDoctors || 3} Practitioners</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Daily Capacity Limit:</span>
                    <span className="font-semibold text-slate-800">{dept.dailyCapacity || 50} Patients/day</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Operational
                </span>
                <span>REST: /departments/{dept.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Department Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Department"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department Code * (e.g. ONCO, ENT)
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. CARD"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Oncology & Cancer Care"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Head Doctor / Lead Clinician
            </label>
            <input
              type="text"
              value={formData.headDoctor}
              onChange={(e) => setFormData({ ...formData, headDoctor: e.target.value })}
              placeholder="e.g. Dr. Rajesh Nair"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Daily Patient Capacity Limit
            </label>
            <input
              type="number"
              min="5"
              max="200"
              value={formData.dailyCapacity}
              onChange={(e) => setFormData({ ...formData, dailyCapacity: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Department specialty and scope..."
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200"
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
              {formSubmitting ? 'Creating...' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Departments;
