import api from './api';

const consultationService = {
  // Save consultation notes and prescription
  saveConsultation: async (data) => {
    const response = await api.post('/consultations', data);
    return response.data;
  },

  // Get consultation for a specific appointment
  getByAppointmentId: async (appointmentId) => {
    const response = await api.get(`/consultations/appointment/${appointmentId}`);
    return response.data;
  },

  // Get all consultations for a patient
  getByPatientId: async (patientId) => {
    const response = await api.get(`/consultations/patient/${patientId}`);
    return response.data;
  },

  // Get all consultations by a doctor
  getByDoctorId: async (doctorId) => {
    const response = await api.get(`/consultations/doctor/${doctorId}`);
    return response.data;
  },
};

export default consultationService;
