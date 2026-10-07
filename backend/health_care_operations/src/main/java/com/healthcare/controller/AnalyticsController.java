package com.healthcare.controller;

import com.healthcare.dto.ApiResponse;
import com.healthcare.service.AnalyticsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/doctor-utilization")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDoctorUtilization(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Map<String, Object>> metrics = analyticsService.getDoctorUtilization(date);
        return ResponseEntity.ok(ApiResponse.success(metrics, "Doctor utilization metrics retrieved"));
    }

    @GetMapping("/status-summary")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getStatusSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Map<String, Object>> summary = analyticsService.getDailyStatusSummary(date);
        return ResponseEntity.ok(ApiResponse.success(summary, "Appointment status summary retrieved"));
    }

    @GetMapping("/live-queue-summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLiveQueueSummary() {
        Map<String, Object> summary = analyticsService.getLiveQueueSummary();
        return ResponseEntity.ok(ApiResponse.success(summary, "Live queue summary retrieved"));
    }

    @GetMapping("/department-load")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDepartmentLoad(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Map<String, Object>> load = analyticsService.getDepartmentLoad(date);
        return ResponseEntity.ok(ApiResponse.success(load, "Department load metrics retrieved"));
    }
}
