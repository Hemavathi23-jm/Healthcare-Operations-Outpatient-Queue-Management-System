import api from './api';

export const departmentService = {
  // Real Backend Endpoint: GET /departments
  getAllDepartments: async () => {
    try {
      const response = await api.get('/departments');
      return response.data || [];
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load hospital departments from database';
      throw new Error(msg);
    }
  },

  // Real Backend Endpoint: GET /departments/{id}
  getDepartmentById: async (id) => {
    try {
      const response = await api.get(`/departments/${id}`);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || `Failed to fetch department #${id}`;
      throw new Error(msg);
    }
  },

  // Real Backend Endpoint: POST /departments
  createDepartment: async (deptData) => {
    try {
      const response = await api.post('/departments', deptData);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create department in database';
      throw new Error(msg);
    }
  },
};

export default departmentService;
