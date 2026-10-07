import React, { useState, useEffect } from 'react';
import {
  X,
  Stethoscope,
  Plus,
  Trash2,
  FileText,
  Printer,
  CheckCircle2,
  AlertCircle,
  Activity,
  Heart,
  Thermometer,
  Wind,
  Weight,
  Calendar,
  Pill,
  Sparkles,
} from 'lucide-react';
import consultationService from '../services/consultationService';
import { generatePrescriptionPdf } from '../utils/prescriptionPdf';

const ConsultationModal = ({ isOpen, onClose, appointment, onConsultationSaved }) => {
  const [loading, setLoading] = useState(false);
  const [fetchingExisting, setFetchingExisting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [existingConsultation, setExistingConsultation] = useState(null);

  // Form State
  const [vitals, setVitals] = useState({
    bloodPressure: '120/80',
    pulseRate: '72',
    temperature: '98.6',
    spo2: '99',
    weightKg: '68',
  });

  const [chiefComplaints, setChiefComplaints] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [labInvestigations, setLabInvestigations] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  const [prescriptionItems, setPrescriptionItems] = useState([
    { medicineName: '', dosage: '500 mg', frequency: '1-0-1', duration: '5 Days', instructions: 'After meals' },
  ]);

  // Load existing consultation if appointment was already completed
  useEffect(() => {
    if (isOpen && appointment?.id) {
      setError('');
      setSuccessMsg('');
      setFetchingExisting(true);

      // Pre-fill reason for visit
      if (appointment.reasonForVisit) {
        setChiefComplaints(appointment.reasonForVisit);
      }

      consultationService.getByAppointmentId(appointment.id)
        .then((data) => {
          if (data && data.id) {
            setExistingConsultation(data);
            setVitals({
              bloodPressure: data.bloodPressure || '',
              pulseRate: data.pulseRate ? String(data.pulseRate) : '',
              temperature: data.temperature ? String(data.temperature) : '',
              spo2: data.spo2 ? String(data.spo2) : '',
              weightKg: data.weightKg ? String(data.weightKg) : '',
            });
            setChiefComplaints(data.chiefComplaints || appointment.reasonForVisit || '');
            setDiagnosis(data.diagnosis || '');
            setClinicalNotes(data.clinicalNotes || '');
            setLabInvestigations(data.labInvestigations || '');
            setFollowUpDate(data.followUpDate || '');
            if (data.prescriptionItems && data.prescriptionItems.length > 0) {
              setPrescriptionItems(data.prescriptionItems);
            }
          }
        })
        .catch(() => {
          // No previous consultation
        })
        .finally(() => {
          setFetchingExisting(false);
        });
    }
  }, [isOpen, appointment]);

  if (!isOpen || !appointment) return null;

  const handleAddMedicine = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      { medicineName: '', dosage: '500 mg', frequency: '1-0-1', duration: '5 Days', instructions: 'After meals' },
    ]);
  };

  const handleRemoveMedicine = (index) => {
    if (prescriptionItems.length === 1) return;
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...prescriptionItems];
    updated[index][field] = value;
    setPrescriptionItems(updated);
  };

  const handleSave = async (autoDownloadPdf = true) => {
    if (!diagnosis.trim()) {
      setError('Please provide a clinical diagnosis before saving the consultation.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    const payload = {
      appointmentId: appointment.id,
      bloodPressure: vitals.bloodPressure,
      pulseRate: vitals.pulseRate ? parseInt(vitals.pulseRate, 10) : null,
      temperature: vitals.temperature ? parseFloat(vitals.temperature) : null,
      spo2: vitals.spo2 ? parseInt(vitals.spo2, 10) : null,
      weightKg: vitals.weightKg ? parseFloat(vitals.weightKg) : null,
      chiefComplaints,
      diagnosis,
      clinicalNotes,
      labInvestigations,
      followUpDate: followUpDate || null,
      prescriptionItems: prescriptionItems.filter((item) => item.medicineName.trim() !== ''),
    };

    try {
      const response = await consultationService.saveConsultation(payload);
      setSuccessMsg('Consultation recorded successfully!');
      setExistingConsultation(response);

      if (autoDownloadPdf && response) {
        generatePrescriptionPdf(response);
      }

      if (onConsultationSaved) {
        onConsultationSaved(response);
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save consultation');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectDownloadPdf = () => {
    if (existingConsultation) {
      generatePrescriptionPdf(existingConsultation);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-4">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <Stethoscope className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                Doctor Consultation & Prescription
                {existingConsultation && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                    Completed
                  </span>
                )}
              </h2>
              <p className="text-xs text-teal-100/80">
                Appointment Ref: #{appointment.appointmentNumber || appointment.id} • {appointment.appointmentTypeName || 'Consultation'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {existingConsultation && (
              <button
                type="button"
                onClick={handleDirectDownloadPdf}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-100 bg-white/10 hover:bg-white/20 rounded-lg transition-all border border-white/20"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Download Rx
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Patient Demographic Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-slate-500">Patient:</span>{' '}
              <strong className="text-slate-900 font-semibold">{appointment.patientName}</strong>
            </div>
            <div>
              <span className="text-slate-500">Code:</span>{' '}
              <span className="font-mono bg-slate-200/70 text-slate-800 px-1.5 py-0.5 rounded">
                {appointment.patientCode || 'PAT-N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Phone:</span>{' '}
              <span className="text-slate-700">{appointment.patientPhone || 'N/A'}</span>
            </div>
          </div>
          <div>
            <span className="text-slate-500">Doctor:</span>{' '}
            <strong className="text-teal-700">{appointment.doctorName}</strong>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. Vital Signs Section */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-600" />
              Patient Vital Signs
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1 flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-500" /> Blood Pressure
                </label>
                <input
                  type="text"
                  placeholder="120/80"
                  value={vitals.bloodPressure}
                  onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-500" /> Pulse (bpm)
                </label>
                <input
                  type="number"
                  placeholder="72"
                  value={vitals.pulseRate}
                  onChange={(e) => setVitals({ ...vitals, pulseRate: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1 flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-amber-500" /> Temp (°F)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="98.6"
                  value={vitals.temperature}
                  onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1 flex items-center gap-1">
                  <Wind className="w-3 h-3 text-sky-500" /> SpO2 (%)
                </label>
                <input
                  type="number"
                  placeholder="99"
                  value={vitals.spo2}
                  onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1 flex items-center gap-1">
                  <Weight className="w-3 h-3 text-indigo-500" /> Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="68"
                  value={vitals.weightKg}
                  onChange={(e) => setVitals({ ...vitals, weightKg: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* 2. Clinical Evaluation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Chief Complaints & Symptoms
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Mild fever, dry cough for 3 days, headaches..."
                value={chiefComplaints}
                onChange={(e) => setChiefComplaints(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-teal-800 uppercase tracking-wider mb-1.5">
                Clinical Diagnosis <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Acute Viral Upper Respiratory Tract Infection (URTI)"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-teal-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-medium text-slate-900"
              />
            </div>
          </div>

          {/* 3. Prescription Medications (Rx) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-teal-600" />
                Rx - Prescribed Medications
              </h3>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors border border-teal-200"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Drug
              </button>
            </div>

            <div className="space-y-2.5">
              {prescriptionItems.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 items-center bg-slate-50/90 p-2.5 rounded-xl border border-slate-200 text-xs"
                >
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="Medicine Name (e.g. Paracetamol / Amoxicillin)"
                      value={item.medicineName}
                      onChange={(e) => handleMedicineChange(index, 'medicineName', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-xs font-medium"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Dosage (500mg)"
                      value={item.dosage}
                      onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Freq (1-0-1)"
                      value={item.frequency}
                      onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Duration (5 Days)"
                      value={item.duration}
                      onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-xs"
                    />
                  </div>
                  <div className="col-span-2 flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="After food"
                      value={item.instructions}
                      onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-xs"
                    />
                    {prescriptionItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(index)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Diagnostics & Follow-up */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Lab Investigations / Diagnostic Orders
              </label>
              <input
                type="text"
                placeholder="e.g. Complete Blood Count (CBC), Serum Electrolytes, Chest X-Ray PA view"
                value={labInvestigations}
                onChange={(e) => setLabInvestigations(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-600" /> Follow-up Date
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* 5. Doctor Advice / General Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Doctor Advice & Dietary Guidelines
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Adequate oral hydration, rest for 48 hours, avoid cold beverages. Return immediately if high fever persists."
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSave(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 rounded-xl transition-all"
            >
              Save Consultation
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSave(true)}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-md hover:shadow-lg disabled:opacity-50 rounded-xl transition-all"
            >
              <FileText className="w-4 h-4" />
              {loading ? 'Saving & Generating...' : 'Save & Download Prescription PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationModal;
