package com.healthcare.controller;

import com.healthcare.dto.*;
import com.healthcare.repository.PatientRepository;
import com.healthcare.repository.UserRepository;
import com.healthcare.service.AppointmentService;
import com.healthcare.service.SlotRecommendationService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final SlotRecommendationService slotService;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;

    public AppointmentController(AppointmentService appointmentService,
                                  SlotRecommendationService slotService,
                                  UserRepository userRepository,
                                  PatientRepository patientRepository) {
        this.appointmentService = appointmentService;
        this.slotService = slotService;
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
    }

    @GetMapping("/available-slots")
    public ResponseEntity<ApiResponse<List<SlotResponseDto>>> getAvailableSlots(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long appointmentTypeId) {
        List<SlotResponseDto> slots = slotService.getAvailableSlots(doctorId, date, appointmentTypeId);
        return ResponseEntity.ok(ApiResponse.success(slots, "Available slots retrieved successfully"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> bookAppointment(
            @RequestBody AppointmentBookingRequest request) {
        // Resolve patientId from authenticated user if not passed (e.g. Patient role)
        if (request.getPatientId() == null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                userRepository.findByUsername(auth.getName())
                        .flatMap(u -> patientRepository.findByUserId(u.getId()))
                        .ifPresent(p -> request.setPatientId(p.getId()));
            }
        }
        if (request.getPatientId() == null) {
            // Default to first patient if staff did not select one
            patientRepository.findAll().stream().findFirst().ifPresent(p -> request.setPatientId(p.getId()));
        }

        AppointmentResponseDto response = appointmentService.bookAppointment(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Appointment booked successfully"));
    }

    @PutMapping("/{id}/reschedule")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> rescheduleAppointment(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentRescheduleRequest request) {
        AppointmentResponseDto response = appointmentService.rescheduleAppointment(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Appointment rescheduled successfully"));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> cancelAppointment(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        AppointmentResponseDto response = appointmentService.cancelAppointment(id, reason);
        return ResponseEntity.ok(ApiResponse.success(response, "Appointment cancelled successfully"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String notes) {
        AppointmentResponseDto response = appointmentService.updateStatus(id, status, notes);
        return ResponseEntity.ok(ApiResponse.success(response, "Appointment status updated"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AppointmentResponseDto>>> getAppointments(
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AppointmentResponseDto> appointments = appointmentService.getAppointments(doctorId, departmentId, status, date);
        return ResponseEntity.ok(ApiResponse.success(appointments, "Appointments retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> getById(@PathVariable Long id) {
        AppointmentResponseDto appt = appointmentService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(appt, "Appointment retrieved successfully"));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<AppointmentResponseDto>>> getHistory(
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) String status) {
        List<AppointmentResponseDto> history = appointmentService.getAppointments(doctorId, null, status, null);
        return ResponseEntity.ok(ApiResponse.success(history, "Appointment history retrieved successfully"));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<AppointmentResponseDto>>> getMyAppointments() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }

        String username = auth.getName();
        return userRepository.findByUsername(username)
                .flatMap(user -> patientRepository.findByUserId(user.getId()))
                .map(patient -> {
                    List<AppointmentResponseDto> myAppts = appointmentService.getAppointmentsByPatientId(patient.getId());
                    return ResponseEntity.ok(ApiResponse.success(myAppts, "Your appointments retrieved successfully"));
                })
                .orElse(ResponseEntity.status(403).body(ApiResponse.error("Patient profile not found for this account")));
    }
}
