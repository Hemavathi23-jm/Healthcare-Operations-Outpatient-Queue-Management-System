import api from './api';

export const reportsService = {
  /**
   * Fetches comprehensive reporting data from real backend endpoints
   * @param {string} filterType - 'CURRENT_MONTH' | 'PREVIOUS_MONTH' | 'TODAY' | 'CUSTOM'
   * @param {string} customStartDate - 'YYYY-MM-DD'
   * @param {string} customEndDate - 'YYYY-MM-DD'
   */
  getReportData: async (filterType = 'CURRENT_MONTH', customStartDate = null, customEndDate = null) => {
    try {
      // 1. Fetch data from real Spring Boot REST APIs
      const [
        apptsRes,
        statusRes,
        queueRes,
        docUtilRes,
        deptLoadRes,
        deptsRes,
        docsRes,
      ] = await Promise.all([
        api.get('/appointments').catch(() => ({ data: [] })),
        api.get('/analytics/status-summary').catch(() => ({ data: [] })),
        api.get('/analytics/live-queue-summary').catch(() => ({ data: {} })),
        api.get('/analytics/doctor-utilization').catch(() => ({ data: [] })),
        api.get('/analytics/department-load').catch(() => ({ data: [] })),
        api.get('/departments').catch(() => ({ data: [] })),
        api.get('/doctors').catch(() => ({ data: [] })),
      ]);

      const allAppointments = Array.isArray(apptsRes.data) ? apptsRes.data : [];
      const queueData = queueRes.data || {};
      const rawDocUtil = Array.isArray(docUtilRes.data) ? docUtilRes.data : [];
      const rawDeptLoad = Array.isArray(deptLoadRes.data) ? deptLoadRes.data : [];
      const departments = Array.isArray(deptsRes.data) ? deptsRes.data : [];
      const doctors = Array.isArray(docsRes.data) ? docsRes.data : [];

      // 2. Date Filtering Logic
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
      const currentYearMonth = `${currentYear}-${currentMonth}`;

      const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevYear = prevDate.getFullYear();
      const prevMonth = String(prevDate.getMonth() + 1).padStart(2, '0');
      const prevYearMonth = `${prevYear}-${prevMonth}`;

      const todayStr = now.toISOString().split('T')[0];

      let filteredAppointments = allAppointments;

      if (filterType === 'CURRENT_MONTH') {
        filteredAppointments = allAppointments.filter((a) => {
          const d = a.appointmentDate || (a.scheduledStartTime ? String(a.scheduledStartTime).substring(0, 10) : '');
          return d.startsWith(currentYearMonth);
        });
      } else if (filterType === 'PREVIOUS_MONTH') {
        filteredAppointments = allAppointments.filter((a) => {
          const d = a.appointmentDate || (a.scheduledStartTime ? String(a.scheduledStartTime).substring(0, 10) : '');
          return d.startsWith(prevYearMonth);
        });
      } else if (filterType === 'TODAY') {
        filteredAppointments = allAppointments.filter((a) => {
          const d = a.appointmentDate || (a.scheduledStartTime ? String(a.scheduledStartTime).substring(0, 10) : '');
          return d === todayStr;
        });
      } else if (filterType === 'CUSTOM' && customStartDate && customEndDate) {
        filteredAppointments = allAppointments.filter((a) => {
          const d = a.appointmentDate || (a.scheduledStartTime ? String(a.scheduledStartTime).substring(0, 10) : '');
          return d >= customStartDate && d <= customEndDate;
        });
      }

      // 3. Status Breakdown
      const statusCounts = {};
      filteredAppointments.forEach((a) => {
        const s = (a.status || 'SCHEDULED').toUpperCase();
        statusCounts[s] = (statusCounts[s] || 0) + 1;
      });

      const totalAppts = filteredAppointments.length;
      const completedCount = statusCounts['COMPLETED'] || 0;
      const cancelledCount = statusCounts['CANCELLED'] || 0;
      const scheduledCount = statusCounts['SCHEDULED'] || 0;
      const inConsultationCount = statusCounts['IN_CONSULTATION'] || 0;

      const STATUS_LABELS = {
        SCHEDULED: 'Scheduled',
        IN_CONSULTATION: 'In Consultation',
        COMPLETED: 'Completed',
        CANCELLED: 'Cancelled',
        RESCHEDULED: 'Rescheduled',
        MISSED: 'Missed / No-show',
      };

      const STATUS_COLORS = {
        SCHEDULED: '#3b82f6',
        IN_CONSULTATION: '#f59e0b',
        COMPLETED: '#10b981',
        CANCELLED: '#ef4444',
        RESCHEDULED: '#8b5cf6',
        MISSED: '#64748b',
      };

      const statusDistribution = Object.keys(statusCounts).map((key) => {
        const cnt = statusCounts[key];
        const pct = totalAppts > 0 ? Math.round((cnt / totalAppts) * 100) : 0;
        return {
          status: key,
          label: STATUS_LABELS[key] || key,
          count: cnt,
          percentage: pct,
          color: STATUS_COLORS[key] || '#94a3b8',
        };
      });

      // 4. Doctor Utilization from roster & filtered appointments
      const docRoster = doctors.length > 0 ? doctors : rawDocUtil.map((d) => ({
        id: d.doctor_id,
        fullName: d.doctor_name,
        departmentName: d.department_name,
        status: d.actual_status || 'ACTIVE',
      }));

      const doctorUtilization = docRoster.map((doc) => {
        const docAppts = filteredAppointments.filter((a) => Number(a.doctorId) === Number(doc.id) && a.status !== 'CANCELLED');
        const cap = 20;
        const booked = docAppts.length;
        const rate = Math.min(100, Math.round((booked / cap) * 100));
        return {
          id: doc.id,
          doctor: doc.fullName || `Dr. Physician`,
          department: doc.departmentName || 'Specialist Care',
          capacity: cap,
          booked: booked,
          utilizationRate: rate,
          status: doc.status || 'ACTIVE',
        };
      });

      // 5. Department Load from departments list & filtered appointments
      const deptList = departments.length > 0 ? departments : rawDeptLoad.map((d) => ({
        id: d.department_id,
        name: d.department_name,
      }));

      const departmentLoad = deptList.map((dept) => {
        const deptAppts = filteredAppointments.filter((a) => Number(a.departmentId) === Number(dept.id) && a.status !== 'CANCELLED');
        const max = 30; // standard department capacity ceiling
        const count = deptAppts.length;
        return {
          id: dept.id,
          department: dept.name,
          activePatients: count,
          maxCapacity: max,
          percentage: Math.min(100, Math.round((count / max) * 100)),
        };
      });

      // 6. Queue Statistics
      const queueStats = {
        totalWaiting: Number(queueData.total_waiting || 0),
        totalInConsultation: Number(queueData.total_in_consultation || inConsultationCount || 0),
        totalCompleted: Number(queueData.total_completed || completedCount || 0),
        totalSkipped: Number(queueData.total_skipped || 0),
        avgWaitMinutes: Math.round(Number(queueData.avg_wait_time_minutes || 0)),
      };

      // 7. Overall Hospital Utilization Rate
      const totalCapacity = doctorUtilization.reduce((sum, d) => sum + d.capacity, 0);
      const totalBooked = doctorUtilization.reduce((sum, d) => sum + d.booked, 0);
      const overallUtilization = totalCapacity > 0 ? Math.min(100, Math.round((totalBooked / totalCapacity) * 100)) : 0;

      // 8. Cancellations list for audit
      const cancellationsList = filteredAppointments
        .filter((a) => (a.status || '').toUpperCase() === 'CANCELLED')
        .map((a) => ({
          id: a.id,
          patientName: a.patientName || 'Patient',
          doctorName: a.doctorName || 'Doctor',
          departmentName: a.departmentName || 'General',
          appointmentDate: a.appointmentDate || (a.scheduledStartTime ? String(a.scheduledStartTime).substring(0, 10) : ''),
          appointmentTime: a.appointmentTime || (a.scheduledStartTime ? String(a.scheduledStartTime).substring(11, 16) : ''),
          reason: a.cancellationReason || a.reason || 'Patient Scheduling Conflict',
        }));

      return {
        filterType,
        periodLabel:
          filterType === 'CURRENT_MONTH'
            ? `Current Month (${currentYearMonth})`
            : filterType === 'PREVIOUS_MONTH'
            ? `Previous Month (${prevYearMonth})`
            : filterType === 'TODAY'
            ? `Today (${todayStr})`
            : `Custom Range (${customStartDate || ''} to ${customEndDate || ''})`,
        summary: {
          totalAppointments: totalAppts,
          completed: completedCount,
          cancelled: cancelledCount,
          scheduled: scheduledCount,
          waiting: queueStats.totalWaiting,
          overallUtilization,
        },
        statusDistribution,
        doctorUtilization,
        departmentLoad,
        queueStats,
        cancellationsList,
        appointments: filteredAppointments,
      };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to compile hospital operations report';
      throw new Error(msg);
    }
  },
};

export default reportsService;
