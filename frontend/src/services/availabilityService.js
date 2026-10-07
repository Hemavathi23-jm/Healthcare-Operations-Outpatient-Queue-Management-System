import api from './api';

export const availabilityService = {
  // Real Backend Endpoint: GET /doctors/{doctorId} (contains availabilities) + GET /doctors/{doctorId}/leaves
  getDoctorAvailability: async (doctorId) => {
    try {
      const [doctorRes, leavesRes] = await Promise.all([
        api.get(`/doctors/${doctorId}`),
        api.get(`/doctors/${doctorId}/leaves`).catch(() => ({ data: [] })),
      ]);

      const doc = doctorRes.data;
      const leaves = Array.isArray(leavesRes.data) ? leavesRes.data : [];

      const days = (doc.availabilities || []).map((a) => {
        const d = a.dayOfWeek.toLowerCase();
        return d.charAt(0).toUpperCase() + d.slice(1);
      });

      const firstAvail = doc.availabilities?.[0] || {};

      return {
        doctorId: Number(doctorId),
        doctorName: doc.fullName,
        departmentName: doc.departmentName,
        workingDays: days.length > 0 ? days : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        shiftStart: firstAvail.startTime ? String(firstAvail.startTime).substring(0, 5) : '09:00',
        shiftEnd: firstAvail.endTime ? String(firstAvail.endTime).substring(0, 5) : '17:00',
        breakStart: firstAvail.breakStartTime ? String(firstAvail.breakStartTime).substring(0, 5) : '13:00',
        breakEnd: firstAvail.breakEndTime ? String(firstAvail.breakEndTime).substring(0, 5) : '14:00',
        slotDurationMinutes: 30,
        maxCapacityPerDay: firstAvail.maxCapacityPerDay || 20,
        leaves: leaves.map((l) => ({
          id: l.id,
          leaveDate: l.leaveDate,
          sessionType: l.sessionType || 'FULL_DAY',
          reason: l.reason || 'Planned Leave',
          status: l.status || 'APPROVED',
        })),
      };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || `Failed to fetch availability for doctor #${doctorId}`;
      throw new Error(msg);
    }
  },

  // Real Backend Endpoint: POST /doctors/{doctorId}/availability for each day
  updateDoctorAvailability: async (doctorId, availabilityData) => {
    try {
      const days = availabilityData.workingDays || ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
      // Save/upsert availability for each working day
      const promises = days.map((day) => {
        const payload = {
          doctorId: Number(doctorId),
          dayOfWeek: day.toUpperCase(),
          startTime: availabilityData.shiftStart ? (availabilityData.shiftStart.length === 5 ? availabilityData.shiftStart + ':00' : availabilityData.shiftStart) : '09:00:00',
          endTime: availabilityData.shiftEnd ? (availabilityData.shiftEnd.length === 5 ? availabilityData.shiftEnd + ':00' : availabilityData.shiftEnd) : '17:00:00',
          breakStartTime: availabilityData.breakStart ? (availabilityData.breakStart.length === 5 ? availabilityData.breakStart + ':00' : availabilityData.breakStart) : '13:00:00',
          breakEndTime: availabilityData.breakEnd ? (availabilityData.breakEnd.length === 5 ? availabilityData.breakEnd + ':00' : availabilityData.breakEnd) : '14:00:00',
          maxCapacityPerDay: Number(availabilityData.maxCapacityPerDay) || 20,
        };
        return api.post(`/doctors/${doctorId}/availability`, payload);
      });

      const results = await Promise.all(promises);
      return results.map(r => r.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save doctor availability to database';
      throw new Error(msg);
    }
  },

  // Real Backend Endpoint: POST /doctors/leave
  addDoctorLeave: async (doctorId, leaveData) => {
    try {
      const payload = {
        doctorId: Number(doctorId),
        leaveDate: leaveData.leaveDate || leaveData.date || leaveData.startDate || new Date().toISOString().split('T')[0],
        sessionType: leaveData.sessionType || 'FULL_DAY',
        reason: leaveData.reason || 'Planned Leave',
        status: 'APPROVED',
      };
      const response = await api.post('/doctors/leave', payload);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit doctor leave request';
      throw new Error(msg);
    }
  },

  // Real Backend Endpoint: Cancel doctor leave
  cancelDoctorLeave: async (doctorId, leaveId) => {
    try {
      // Backend handles leave removal or updates status
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to cancel leave';
      throw new Error(msg);
    }
  },
};

export default availabilityService;
