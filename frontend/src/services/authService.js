import api from './api';

export const authService = {
  // Real Backend Endpoint: POST /api/v1/auth/login
  // Request DTO: { username, password }
  // Response DTO: { token, type, userId, username, fullName, email, role, doctorId, patientId }
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const raw = response.data;
      
      // Normalize authenticated user details from real backend response
      const normalizedUser = {
        id: raw.userId || raw.user?.id || raw.id || 1,
        name: raw.fullName || raw.user?.name || raw.name || raw.username || username,
        username: raw.username || username,
        email: raw.email || raw.user?.email || `${username}@hospital.org`,
        role: (raw.role || raw.user?.role || 'USER').toUpperCase(),
        department: raw.department || raw.user?.department || 'Healthcare Facility',
        doctorId: raw.doctorId || raw.user?.doctorId || null,
        patientId: raw.patientId || raw.user?.patientId || null,
      };

      return {
        token: raw.token,
        user: normalizedUser,
      };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.response?.status === 401 ? 'Invalid username or password' : null) ||
        err.message ||
        'Unable to connect to authentication service';
      throw new Error(errorMsg);
    }
  },

  // Real Backend Endpoint: POST /api/v1/auth/register
  register: async (regData) => {
    try {
      const response = await api.post('/auth/register', regData);
      const raw = response.data;
      
      const normalizedUser = {
        id: raw.userId || raw.user?.id || raw.id,
        name: raw.fullName || `${regData.firstName} ${regData.lastName}`,
        username: raw.username || regData.username,
        email: raw.email || regData.email,
        role: (raw.role || 'PATIENT').toUpperCase(),
        department: 'Patient Portal',
        doctorId: null,
        patientId: raw.patientId || raw.user?.patientId || null,
      };

      return {
        token: raw.token,
        user: normalizedUser,
      };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Registration failed. Please verify your details.';
      throw new Error(errorMsg);
    }
  },

  getCurrentUser: () => {
    const raw = localStorage.getItem('medqueue_user');
    return raw ? JSON.parse(raw) : null;
  },

  logout: () => {
    localStorage.removeItem('medqueue_token');
    localStorage.removeItem('medqueue_user');
  },
};

export default authService;
