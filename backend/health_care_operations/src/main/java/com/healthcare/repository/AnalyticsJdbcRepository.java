package com.healthcare.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Repository
public class AnalyticsJdbcRepository {

    private final JdbcTemplate jdbcTemplate;

    public AnalyticsJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Calculates doctor capacity utilization metrics for a specific date
     */
    public List<Map<String, Object>> getDoctorUtilizationMetrics(LocalDate targetDate) {
        String dayOfWeek = targetDate.getDayOfWeek().name();
        String sql = """
            SELECT 
                d.id AS doctor_id,
                u.full_name AS doctor_name,
                dep.name AS department_name,
                COALESCE(da.max_capacity_per_day, 20) AS max_capacity,
                COUNT(a.id) AS booked_count,
                ROUND((COUNT(a.id) / COALESCE(da.max_capacity_per_day, 20)) * 100, 1) AS utilization_percentage,
                CASE 
                    WHEN dl.id IS NOT NULL THEN 'ON_LEAVE'
                    ELSE d.status
                END AS actual_status
            FROM doctors d
            JOIN users u ON d.user_id = u.id
            JOIN departments dep ON d.department_id = dep.id
            LEFT JOIN doctor_availability da ON d.id = da.doctor_id AND da.day_of_week = ?
            LEFT JOIN doctor_leave dl ON d.id = dl.doctor_id AND dl.leave_date = ? AND dl.status = 'APPROVED'
            LEFT JOIN appointments a ON d.id = a.doctor_id 
                AND DATE(a.scheduled_start_time) = ?
                AND a.status NOT IN ('CANCELLED', 'RESCHEDULED')
            GROUP BY d.id, u.full_name, dep.name, da.max_capacity_per_day, dl.id, d.status
            ORDER BY utilization_percentage DESC;
        """;
        return jdbcTemplate.queryForList(sql, dayOfWeek, targetDate, targetDate);
    }

    /**
     * Aggregates appointment counts grouped by status for a given date
     */
    public List<Map<String, Object>> getDailyAppointmentStatusSummary(LocalDate targetDate) {
        String sql = """
            SELECT 
                status,
                COUNT(*) AS total_count
            FROM appointments
            WHERE DATE(scheduled_start_time) = ?
            GROUP BY status;
        """;
        return jdbcTemplate.queryForList(sql, targetDate);
    }

    /**
     * Aggregates live queue statistics across all doctors
     */
    public Map<String, Object> getLiveQueueSummary() {
        String sql = """
            SELECT 
                COUNT(CASE WHEN queue_status = 'WAITING' THEN 1 END) AS total_waiting,
                COUNT(CASE WHEN queue_status = 'IN_CONSULTATION' THEN 1 END) AS total_in_consultation,
                COUNT(CASE WHEN queue_status = 'COMPLETED' THEN 1 END) AS total_completed,
                COUNT(CASE WHEN queue_status = 'SKIPPED' THEN 1 END) AS total_skipped,
                COALESCE(AVG(CASE WHEN queue_status = 'WAITING' THEN estimated_wait_minutes END), 0) AS avg_wait_time_minutes
            FROM queue_entries
            WHERE DATE(checked_in_at) = CURRENT_DATE();
        """;
        List<Map<String, Object>> results = jdbcTemplate.queryForList(sql);
        return results.isEmpty() ? Map.of() : results.get(0);
    }

    /**
     * Department appointment load summary
     */
    public List<Map<String, Object>> getDepartmentLoadSummary(LocalDate targetDate) {
        String sql = """
            SELECT 
                dep.id AS department_id,
                dep.name AS department_name,
                COUNT(a.id) AS appointment_count
            FROM departments dep
            LEFT JOIN appointments a ON dep.id = a.department_id 
                AND DATE(a.scheduled_start_time) = ?
                AND a.status NOT IN ('CANCELLED', 'RESCHEDULED')
            GROUP BY dep.id, dep.name
            ORDER BY appointment_count DESC;
        """;
        return jdbcTemplate.queryForList(sql, targetDate);
    }
}
