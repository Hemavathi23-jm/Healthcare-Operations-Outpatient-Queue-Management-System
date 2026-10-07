package com.healthcare.service;

import com.healthcare.repository.AnalyticsJdbcRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final AnalyticsJdbcRepository analyticsJdbcRepository;

    public AnalyticsService(AnalyticsJdbcRepository analyticsJdbcRepository) {
        this.analyticsJdbcRepository = analyticsJdbcRepository;
    }

    public List<Map<String, Object>> getDoctorUtilization(LocalDate date) {
        return analyticsJdbcRepository.getDoctorUtilizationMetrics(date != null ? date : LocalDate.now());
    }

    public List<Map<String, Object>> getDailyStatusSummary(LocalDate date) {
        return analyticsJdbcRepository.getDailyAppointmentStatusSummary(date != null ? date : LocalDate.now());
    }

    public Map<String, Object> getLiveQueueSummary() {
        return analyticsJdbcRepository.getLiveQueueSummary();
    }

    public List<Map<String, Object>> getDepartmentLoad(LocalDate date) {
        return analyticsJdbcRepository.getDepartmentLoadSummary(date != null ? date : LocalDate.now());
    }
}
