import api from './api';

export const patientService = {
  // Real Backend Endpoint: GET /patients?search=...
  getAllPatients: async (search = '') => {
    try {
      const response = await api.get('/patients', { params: search ? { search } : {} });
      return response.data || [];
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load patients from database';
      throw new Error(msg);
    }
  },

  // Real Backend Endpoint: GET /patients/{id}
  getPatientById: async (id) => {
    try {
      const response = await api.get(`/patients/${id}`);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || `Failed to fetch patient #${id}`;
      throw new Error(msg);
    }
  },

  // Real Backend Endpoint: POST /patients
  // Request DTO: { name, age, gender, phone, email, bloodGroup, address, allergies }
  createPatient: async (patientData) => {
    try {
      const response = await api.post('/patients', patientData);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create patient record in database';
      throw new Error(msg);
    }
  },

  // Real Backend Endpoint: PUT /patients/{id}
  updatePatient: async (id, patientData) => {
    try {
      const response = await api.put(`/patients/${id}`, patientData);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || `Failed to update patient #${id}`;
      throw new Error(msg);
    }
  },

  // Real Backend Endpoint: GET /patients/{id}/appointments
  getPatientAppointments: async (id) => {
    try {
      const response = await api.get(`/patients/${id}/appointments`);
      return response.data || [];
    } catch (err) {
      const msg = err.response?.data?.message || err.message || `Failed to fetch appointments for patient #${id}`;
      throw new Error(msg);
    }
  },
};

export default patientService;
