package com.healthcare.service;

import com.healthcare.dto.PatientDto;
import com.healthcare.entity.Patient;
import com.healthcare.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PatientManagementService {

    private final PatientRepository patientRepository;
    private final AuditService auditService;

    public PatientManagementService(PatientRepository patientRepository, AuditService auditService) {
        this.patientRepository = patientRepository;
        this.auditService = auditService;
    }

    public List<PatientDto> getAllPatients(String query) {
        List<Patient> patients;
        if (query != null && !query.trim().isEmpty()) {
            patients = patientRepository.searchPatients(query.trim());
        } else {
            patients = patientRepository.findAll();
        }
        return patients.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public PatientDto getPatientById(Long id) {
        return patientRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + id));
    }

    @Transactional
    public PatientDto registerPatient(PatientDto dto) {
        if (dto.getPhone() != null && patientRepository.existsByPhone(dto.getPhone())) {
            throw new RuntimeException("A patient with this phone number already exists.");
        }

        String patientCode = dto.getPatientCode();
        if (patientCode == null || patientCode.trim().isEmpty()) {
            patientCode = "PAT-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        }

        Patient patient = Patient.builder()
                .patientCode(patientCode)
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .gender(dto.getGender())
                .dateOfBirth(dto.getDateOfBirth())
                .phone(dto.getPhone() != null ? dto.getPhone() : "9876543210")
                .email(dto.getEmail())
                .bloodGroup(dto.getBloodGroup())
                .address(dto.getAddress())
                .emergencyContact(dto.getEmergencyContact())
                .build();

        Patient saved = patientRepository.save(patient);
        auditService.logAction("CREATE", "Patient", saved.getId(), "Registered patient: " + saved.getFirstName() + " " + saved.getLastName());

        return mapToDto(saved);
    }

    @Transactional
    public PatientDto updatePatient(Long id, PatientDto dto) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + id));

        if (dto.getFirstName() != null && !dto.getFirstName().isBlank()) {
            patient.setFirstName(dto.getFirstName());
        }
        if (dto.getLastName() != null && !dto.getLastName().isBlank()) {
            patient.setLastName(dto.getLastName());
        }
        if (dto.getGender() != null) {
            patient.setGender(dto.getGender());
        }
        if (dto.getDateOfBirth() != null) {
            patient.setDateOfBirth(dto.getDateOfBirth());
        }
        if (dto.getPhone() != null && !dto.getPhone().isBlank()) {
            patient.setPhone(dto.getPhone());
        }
        if (dto.getEmail() != null) {
            patient.setEmail(dto.getEmail());
        }
        if (dto.getBloodGroup() != null) {
            patient.setBloodGroup(dto.getBloodGroup());
        }
        if (dto.getAddress() != null) {
            patient.setAddress(dto.getAddress());
        }
        if (dto.getEmergencyContact() != null) {
            patient.setEmergencyContact(dto.getEmergencyContact());
        }

        Patient saved = patientRepository.save(patient);
        auditService.logAction("UPDATE", "Patient", saved.getId(), "Updated patient: " + saved.getFirstName() + " " + saved.getLastName());
        return mapToDto(saved);
    }

    public PatientDto mapToDto(Patient p) {
        PatientDto dto = PatientDto.builder()
                .id(p.getId())
                .patientCode(p.getPatientCode())
                .firstName(p.getFirstName())
                .lastName(p.getLastName())
                .gender(p.getGender())
                .dateOfBirth(p.getDateOfBirth())
                .phone(p.getPhone())
                .email(p.getEmail())
                .bloodGroup(p.getBloodGroup())
                .address(p.getAddress())
                .emergencyContact(p.getEmergencyContact())
                .createdAt(p.getCreatedAt())
                .build();
        dto.setName(p.getFirstName() + " " + (p.getLastName().equals(".") ? "" : p.getLastName()).trim());
        dto.setPatientNumber(p.getPatientCode());
        if (p.getDateOfBirth() != null) {
            dto.setAge(java.time.Period.between(p.getDateOfBirth(), java.time.LocalDate.now()).getYears());
        } else {
            dto.setAge(30);
        }
        dto.setAllergies("None");
        return dto;
    }
}
