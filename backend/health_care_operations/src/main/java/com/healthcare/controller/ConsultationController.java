package com.healthcare.controller;

import com.healthcare.dto.ApiResponse;
import com.healthcare.dto.ConsultationRequestDto;
import com.healthcare.dto.ConsultationResponseDto;
import com.healthcare.service.ConsultationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/consultations")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ConsultationController {

    private final ConsultationService consultationService;

    public ConsultationController(ConsultationService consultationService) {
        this.consultationService = consultationService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<ConsultationResponseDto>> saveConsultation(@RequestBody ConsultationRequestDto request) {
        ConsultationResponseDto result = consultationService.saveConsultation(request);
        return ResponseEntity.ok(ApiResponse.success(result, "Consultation saved and prescription generated"));
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<ApiResponse<ConsultationResponseDto>> getConsultationByAppointment(@PathVariable Long appointmentId) {
        return consultationService.getConsultationByAppointmentId(appointmentId)
                .map(dto -> ResponseEntity.ok(ApiResponse.success(dto, "Consultation found")))
                .orElseGet(() -> ResponseEntity.ok(ApiResponse.error("No consultation recorded for this appointment")));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<ConsultationResponseDto>>> getConsultationsByPatient(@PathVariable Long patientId) {
        List<ConsultationResponseDto> list = consultationService.getConsultationsByPatientId(patientId);
        return ResponseEntity.ok(ApiResponse.success(list, "Patient consultations retrieved"));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<ConsultationResponseDto>>> getConsultationsByDoctor(@PathVariable Long doctorId) {
        List<ConsultationResponseDto> list = consultationService.getConsultationsByDoctorId(doctorId);
        return ResponseEntity.ok(ApiResponse.success(list, "Doctor consultations retrieved"));
    }
}
