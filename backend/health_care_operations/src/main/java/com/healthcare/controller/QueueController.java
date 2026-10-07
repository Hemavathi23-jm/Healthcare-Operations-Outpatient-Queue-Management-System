package com.healthcare.controller;

import com.healthcare.dto.ApiResponse;
import com.healthcare.dto.QueueCheckInRequest;
import com.healthcare.dto.QueueEntryResponseDto;
import com.healthcare.service.QueueAndPriorityService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/queue", "/queues"})
@CrossOrigin(origins = "*")
public class QueueController {

    private final QueueAndPriorityService queueService;

    public QueueController(QueueAndPriorityService queueService) {
        this.queueService = queueService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<QueueEntryResponseDto>>> getAllQueues() {
        List<QueueEntryResponseDto> all = queueService.getAllActiveQueues();
        return ResponseEntity.ok(ApiResponse.success(all, "Active queues retrieved successfully"));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<QueueEntryResponseDto>>> getActiveQueues() {
        List<QueueEntryResponseDto> all = queueService.getAllActiveQueues();
        return ResponseEntity.ok(ApiResponse.success(all, "Active queues retrieved successfully"));
    }

    @PostMapping("/check-in")
    public ResponseEntity<ApiResponse<QueueEntryResponseDto>> checkIn(
            @Valid @RequestBody QueueCheckInRequest request) {
        QueueEntryResponseDto entry = queueService.checkIn(request);
        return ResponseEntity.ok(ApiResponse.success(entry, "Patient checked in successfully. Token generated."));
    }

    @PostMapping("/doctor/{doctorId}/call-next")
    public ResponseEntity<ApiResponse<QueueEntryResponseDto>> callNext(@PathVariable Long doctorId) {
        QueueEntryResponseDto next = queueService.callNext(doctorId);
        if (next == null) {
            return ResponseEntity.ok(ApiResponse.success(null, "No patients waiting in queue"));
        }
        return ResponseEntity.ok(ApiResponse.success(next, "Next patient called into consultation"));
    }

    @PutMapping("/{id}/call")
    public ResponseEntity<ApiResponse<QueueEntryResponseDto>> callPatientById(@PathVariable Long id) {
        QueueEntryResponseDto called = queueService.callPatientById(id);
        return ResponseEntity.ok(ApiResponse.success(called, "Patient called into consultation"));
    }

    @PostMapping("/{id}/call")
    public ResponseEntity<ApiResponse<QueueEntryResponseDto>> callPatientByIdPost(@PathVariable Long id) {
        QueueEntryResponseDto called = queueService.callPatientById(id);
        return ResponseEntity.ok(ApiResponse.success(called, "Patient called into consultation"));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<QueueEntryResponseDto>> completeConsultation(
            @PathVariable Long id,
            @RequestParam(required = false) String notes) {
        QueueEntryResponseDto completed = queueService.completeConsultation(id, notes);
        return ResponseEntity.ok(ApiResponse.success(completed, "Consultation completed successfully"));
    }

    @PutMapping("/{id}/skip")
    public ResponseEntity<ApiResponse<QueueEntryResponseDto>> skipPatient(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        QueueEntryResponseDto skipped = queueService.skipPatient(id, reason);
        return ResponseEntity.ok(ApiResponse.success(skipped, "Patient skipped in queue"));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<QueueEntryResponseDto>>> getDoctorQueue(@PathVariable Long doctorId) {
        List<QueueEntryResponseDto> queue = queueService.getLiveQueueForDoctor(doctorId);
        return ResponseEntity.ok(ApiResponse.success(queue, "Live queue retrieved successfully"));
    }
}
