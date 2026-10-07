import api from './api';

export const auditService = {
  // Real Backend Endpoint: GET /audit-logs
  getAuditLogs: async (filters = {}) => {
    try {
      const response = await api.get('/audit-logs');
      const list = Array.isArray(response.data) ? response.data : [];
      let mapped = list.map((l) => ({
        id: l.id,
        timestamp: l.timestamp ? String(l.timestamp).replace('T', ' ').substring(0, 19) : new Date().toISOString(),
        user: l.user?.fullName || l.user?.username || (l.userId ? `User #${l.userId}` : 'System'),
        action: l.actionType || l.action || 'EVENT',
        entity: l.entityName || 'General',
        entityId: l.entityId || '-',
        details: l.detailsJson || l.details || 'System operation executed',
      }));

      if (filters.action && filters.action !== 'ALL') {
        mapped = mapped.filter((l) => l.action.toLowerCase().includes(filters.action.toLowerCase()));
      }
      if (filters.user) {
        const u = filters.user.toLowerCase();
        mapped = mapped.filter((l) => l.user.toLowerCase().includes(u));
      }
      return mapped;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load audit logs from database';
      throw new Error(msg);
    }
  },

  // Real Backend Endpoint: POST /audit-logs
  logAction: async (actionData) => {
    try {
      const payload = {
        action: actionData.action || 'USER_ACTION',
        entityName: actionData.entity || 'General',
        entityId: actionData.entityId && !isNaN(actionData.entityId) ? Number(actionData.entityId) : null,
        details: actionData.details || '',
      };
      const response = await api.post('/audit-logs', payload);
      return response.data;
    } catch (err) {
      console.warn('[auditService] Audit logging failed silently:', err.message);
      return null;
    }
  },
};

export default auditService;
