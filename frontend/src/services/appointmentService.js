import api from './api';

export const appointmentService = {
  // Real Backend Endpoint: GET /appointments?doctorId=...&date=...&status=...
  getAllAppointments: async (filters = {}) => {
    try {
      const response = await api.get('/appointments', { params: filters });
      return response.data || [];
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load appointments from database';
      throw new Error(msg);
    }
  },

  // Real Backend Endpoint: GET /appointments/my
  // Returns current authenticated patient's appointments
  getMyAppointments: async () => {
    try {
      const response = await api.get('/appointments/my');
      return response.data || [];
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load your appointments';
      throw new Error(msg);
    }
  },

  // Real Backend Endpoint: GET /appointments/{id}
  getAppointmentById: async (id) => {
    try {
      const response = await api.get(`/appointments/${id}`);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || `Failed to fetch appointment #${id}`;
      throw new Error(msg);
    }
  },

  // Real Backend Endpoint: GET /appointments/available-slots?doctorId=...&date=...
  // Backend returns List<SlotResponseDto> with startTime, endTime, formattedTime, available, reasonIfNotAvailable
  getRecommendedSlots: async (doctorId, date) => {
    try {
      const response = await api.get('/appointments/available-slots', {
        params: { doctorId, date },
      });
      const data = response.data;
      if (Array.isArray(data) && data.length > 0) {
        return data.map((s, idx) => ({
          time: s.formattedTime || (s.startTime ? String(s.startTime).substring(0, 5) : '10:00 AM'),
          durationMinutes: 30,
          status: s.available ? 'AVAILABLE' : 'BOOKED',
          isRecommended: s.available && idx < 2,
          score: s.available ? 95 - idx * 3 : 50,
          tag: idx === 0 ? '? Top Pick' : s.available ? '? Recommended' : 'Booked',
          capacityInfo: s.reasonIfNotAvailable || (s.available ? 'Capacity slot verified by backend' : 'Unavailable'),
        }));
      }
      return data || [];
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load available slots from backend';
      throw new Error(msg);
    }
  },

  // Real Backend Endpoint: POST /appointments
  // Request DTO: { patientId, doctorId, departmentId, appointmentDate, appointmentTime, type, priority, notes }
  createAppointment: async (bookingData) => {
    try {
      const response = await api.post('/appointments', bookingData);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to book appointment in database';
      throw new Error(msg);
    }
  },

  // Real Backend Endpoint: PUT /appointments/{id}/cancel
  // Request DTO: { reason }
  cancelAppointment: async (id, reason = 'Patient request') => {
    try {
      const response = await api.put(`/appointments/${id}/cancel`, { reason });
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || `Failed to cancel appointment #${id}`;
      throw new Error(msg);
    }
  },

  // Real Backend Endpoint: PUT /appointments/{id}/reschedule
  // Request DTO: { newDate, newTime, reason }
  rescheduleAppointment: async (id, rescheduleData) => {
    try {
      const response = await api.put(`/appointments/${id}/reschedule`, rescheduleData);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || `Failed to reschedule appointment #${id}`;
      throw new Error(msg);
    }
  },

  // Real Backend Endpoint: GET /appointments/history
  getAppointmentHistory: async (filters = {}) => {
    try {
      const response = await api.get('/appointments/history', { params: filters });
      return response.data || [];
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load appointment history from database';
      throw new Error(msg);
    }
  },
};

export default appointmentService;
