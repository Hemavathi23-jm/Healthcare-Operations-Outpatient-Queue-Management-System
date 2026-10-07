import api from './api';

const normalizeQueueItem = (item) => ({
  id: item.id,
  appointmentId: item.appointmentId,
  appointmentNumber: item.appointmentNumber,
  tokenNumber: item.tokenNumber || `T-${item.id}`,
  patientName: item.patientName || 'Patient',
  patientNumber: item.patientCode || 'MED-PAT',
  doctorName: item.doctorName || 'Doctor',
  doctorId: item.doctorId,
  position: item.queuePosition || 1,
  status: item.queueStatus || 'WAITING',
  priority: item.priorityCategory || 'NORMAL',
  priorityReason: item.reasonForVisit || `${item.priorityCategory || 'NORMAL'} priority`,
  estimatedWaitMinutes: item.estimatedWaitMinutes || 15,
  patientsAhead: Math.max(0, (item.queuePosition || 1) - 1),
  checkedInTime: item.checkedInAt
    ? new Date(item.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Just now',
});

export const queueService = {
  // Real Backend Endpoint: GET /queue/doctor/{doctorId}
  getQueue: async (filters = {}) => {
    try {
      let list = [];
      if (filters.doctorId) {
        const response = await api.get(`/queue/doctor/${filters.doctorId}`);
        list = Array.isArray(response.data) ? response.data : [];
      } else {
        const response = await api.get('/queue');
        list = Array.isArray(response.data) ? response.data : [];
      }

      const combined = list.map(normalizeQueueItem);

      if (filters.status && filters.status !== 'ALL') {
        return combined.filter((q) => q.status === filters.status);
      }
      return combined;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch queue from database';
      throw new Error(msg);
    }
  },

  // Real Backend Endpoint: PUT /queue/{id}/call OR POST /queue/doctor/{doctorId}/call-next
  callNext: async (queueId, doctorId) => {
    try {
      if (queueId) {
        const response = await api.put(`/queue/${queueId}/call`);
        return response.data ? normalizeQueueItem(response.data) : null;
      } else if (doctorId) {
        const response = await api.post(`/queue/doctor/${doctorId}/call-next`);
        return response.data ? normalizeQueueItem(response.data) : null;
      }
      const response = await api.post('/queue/doctor/1/call-next');
      return response.data ? normalizeQueueItem(response.data) : null;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to call patient';
      throw new Error(msg);
    }
  },

  // Real Backend Endpoint: PUT /queue/{id}/complete
  completeConsultation: async (queueId, notes = '') => {
    try {
      const params = notes ? { notes } : {};
      const response = await api.put(`/queue/${queueId}/complete`, null, { params });
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || `Failed to complete consultation for queue #${queueId}`;
      throw new Error(msg);
    }
  },

  // Real Backend Endpoint: PUT /queue/{id}/skip
  skipPatient: async (queueId, reason = '') => {
    try {
      const params = reason ? { reason } : {};
      const response = await api.put(`/queue/${queueId}/skip`, null, { params });
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || `Failed to skip patient #${queueId}`;
      throw new Error(msg);
    }
  },

  // Real Backend Endpoint: POST /queue/check-in
  generateToken: async (appointment) => {
    try {
      const response = await api.post('/queue/check-in', {
        appointmentId: appointment.id,
        priorityCategory: appointment.priority || 'NORMAL',
      });
      return response.data ? normalizeQueueItem(response.data) : null;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to check in patient and generate token';
      throw new Error(msg);
    }
  },
};

export default queueService;
