package com.healthcare.controller;

import com.healthcare.dto.ApiResponse;
import com.healthcare.dto.PatientDto;
import com.healthcare.service.PatientManagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    private final PatientManagementService patientService;

    public PatientController(PatientManagementService patientService) {
        this.patientService = patientService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PatientDto>>> getAllPatients(
            @RequestParam(required = false) String search) {
        List<PatientDto> patients = patientService.getAllPatients(search);
        return ResponseEntity.ok(ApiResponse.success(patients, "Patients retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientDto>> getPatientById(@PathVariable Long id) {
        PatientDto patient = patientService.getPatientById(id);
        return ResponseEntity.ok(ApiResponse.success(patient, "Patient retrieved successfully"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PatientDto>> registerPatient(@RequestBody PatientDto patientDto) {
        PatientDto registered = patientService.registerPatient(patientDto);
        return ResponseEntity.ok(ApiResponse.success(registered, "Patient registered successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientDto>> updatePatient(
            @PathVariable Long id,
            @RequestBody PatientDto patientDto) {
        PatientDto updated = patientService.updatePatient(id, patientDto);
        return ResponseEntity.ok(ApiResponse.success(updated, "Patient updated successfully"));
    }
}
