package com.healthcare.controller;

import com.healthcare.dto.ApiResponse;
import com.healthcare.dto.DoctorAvailabilityDto;
import com.healthcare.dto.DoctorDto;
import com.healthcare.dto.DoctorLeaveDto;
import com.healthcare.service.DoctorManagementService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doctors")
@CrossOrigin(origins = "*")
public class DoctorController {

    private final DoctorManagementService doctorService;

    public DoctorController(DoctorManagementService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorDto>>> getAllDoctors(
            @RequestParam(required = false) Long departmentId) {
        List<DoctorDto> doctors = doctorService.getAllDoctors(departmentId);
        return ResponseEntity.ok(ApiResponse.success(doctors, "Doctors retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorDto>> getDoctorById(@PathVariable Long id) {
        DoctorDto doctor = doctorService.getDoctorById(id);
        return ResponseEntity.ok(ApiResponse.success(doctor, "Doctor details retrieved successfully"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DoctorDto>> createDoctor(@RequestBody DoctorDto doctorDto) {
        DoctorDto created = doctorService.createDoctor(doctorDto);
        return ResponseEntity.ok(ApiResponse.success(created, "Physician registered successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorDto>> updateDoctor(@PathVariable Long id, @RequestBody DoctorDto doctorDto) {
        DoctorDto updated = doctorService.updateDoctor(id, doctorDto);
        return ResponseEntity.ok(ApiResponse.success(updated, "Doctor updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOrDeactivateDoctor(@PathVariable Long id) {
        doctorService.deleteOrDeactivateDoctor(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Doctor removed or marked as inactive successfully"));
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateDoctor(@PathVariable Long id) {
        doctorService.deleteOrDeactivateDoctor(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Doctor marked as inactive successfully"));
    }

    @GetMapping("/department/{deptId}")
    public ResponseEntity<ApiResponse<List<DoctorDto>>> getDoctorsByDepartment(@PathVariable Long deptId) {
        List<DoctorDto> doctors = doctorService.getAllDoctors(deptId);
        return ResponseEntity.ok(ApiResponse.success(doctors, "Doctors by department retrieved successfully"));
    }

    @PostMapping("/leave")
    public ResponseEntity<ApiResponse<DoctorLeaveDto>> applyLeave(@Valid @RequestBody DoctorLeaveDto leaveDto) {
        DoctorLeaveDto saved = doctorService.applyDoctorLeave(leaveDto);
        return ResponseEntity.ok(ApiResponse.success(saved, "Doctor leave registered successfully"));
    }

    @GetMapping("/{id}/leaves")
    public ResponseEntity<ApiResponse<List<DoctorLeaveDto>>> getDoctorLeaves(@PathVariable Long id) {
        List<DoctorLeaveDto> leaves = doctorService.getDoctorLeaves(id);
        return ResponseEntity.ok(ApiResponse.success(leaves, "Doctor leaves retrieved successfully"));
    }

    @PostMapping("/{id}/availability")
    public ResponseEntity<ApiResponse<DoctorAvailabilityDto>> saveAvailability(
            @PathVariable Long id,
            @RequestBody DoctorAvailabilityDto dto) {
        dto.setDoctorId(id);
        DoctorAvailabilityDto saved = doctorService.saveAvailability(dto);
        return ResponseEntity.ok(ApiResponse.success(saved, "Availability saved successfully"));
    }

    @PutMapping("/{id}/availability/{avId}")
    public ResponseEntity<ApiResponse<DoctorAvailabilityDto>> updateAvailability(
            @PathVariable Long id,
            @PathVariable Long avId,
            @RequestBody DoctorAvailabilityDto dto) {
        dto.setDoctorId(id);
        dto.setId(avId);
        DoctorAvailabilityDto updated = doctorService.updateAvailability(avId, dto);
        return ResponseEntity.ok(ApiResponse.success(updated, "Availability updated successfully"));
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<ApiResponse<List<DoctorAvailabilityDto>>> getDoctorAvailability(@PathVariable Long id) {
        List<DoctorAvailabilityDto> av = doctorService.getDoctorAvailabilityList(id);
        return ResponseEntity.ok(ApiResponse.success(av, "Doctor availability retrieved successfully"));
    }

    @DeleteMapping("/{id}/availability/{avId}")
    public ResponseEntity<ApiResponse<Void>> deleteAvailability(
            @PathVariable Long id,
            @PathVariable Long avId) {
        doctorService.deleteAvailability(avId);
        return ResponseEntity.ok(ApiResponse.success(null, "Availability removed"));
    }
}
