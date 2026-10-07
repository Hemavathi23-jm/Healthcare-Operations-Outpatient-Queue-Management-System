package com.healthcare.service;

import com.healthcare.dto.DoctorAvailabilityDto;
import com.healthcare.dto.DoctorDto;
import com.healthcare.dto.DoctorLeaveDto;
import com.healthcare.entity.*;
import com.healthcare.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DoctorManagementService {

    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorLeaveRepository leaveRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final AppointmentRepository appointmentRepository;

    public DoctorManagementService(DoctorRepository doctorRepository,
                                   DoctorAvailabilityRepository availabilityRepository,
                                   DoctorLeaveRepository leaveRepository,
                                   DepartmentRepository departmentRepository,
                                   UserRepository userRepository,
                                   RoleRepository roleRepository,
                                   PasswordEncoder passwordEncoder,
                                   AuditService auditService,
                                   AppointmentRepository appointmentRepository) {
        this.doctorRepository = doctorRepository;
        this.availabilityRepository = availabilityRepository;
        this.leaveRepository = leaveRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
        this.appointmentRepository = appointmentRepository;
    }

    public List<DoctorDto> getAllDoctors(Long departmentId) {
        List<Doctor> doctors = (departmentId != null)
                ? doctorRepository.findByDepartmentId(departmentId)
                : doctorRepository.findAll();
        return doctors.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public DoctorDto getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + id));
    }

    @Transactional
    public DoctorDto createDoctor(DoctorDto dto) {
        String docName = dto.getFullName() != null && !dto.getFullName().isBlank() 
                ? dto.getFullName() 
                : (dto.getName() != null ? dto.getName() : "Dr. Physician");

        // Generate clean username
        String baseName = docName.toLowerCase()
                .replace("dr.", "")
                .replace("dr ", "")
                .replaceAll("[^a-z0-9]", "");
        if (baseName.isBlank()) baseName = "physician";
        String username = "dr." + baseName;
        int suffix = 1;
        while (userRepository.existsByUsername(username)) {
            username = "dr." + baseName + suffix++;
        }

        String email = (dto.getEmail() != null && !dto.getEmail().isBlank())
                ? dto.getEmail()
                : username + "@hospital.org";
        int eSuffix = 1;
        while (userRepository.existsByEmail(email)) {
            email = username + eSuffix++ + "@hospital.org";
        }

        Role doctorRole = roleRepository.findByRoleName("DOCTOR")
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setRoleName("DOCTOR");
                    return roleRepository.save(r);
                });

        User user = User.builder()
                .username(username)
                .passwordHash(passwordEncoder.encode("doctor123"))
                .role(doctorRole)
                .fullName(docName)
                .email(email)
                .phone(dto.getPhone() != null && !dto.getPhone().isBlank() ? dto.getPhone() : "9876543210")
                .isActive(true)
                .build();
        User savedUser = userRepository.save(user);

        Department dept = null;
        if (dto.getDepartmentId() != null) {
            dept = departmentRepository.findById(dto.getDepartmentId()).orElse(null);
        }
        if (dept == null && dto.getDepartmentName() != null) {
            dept = departmentRepository.findByName(dto.getDepartmentName()).orElse(null);
        }
        if (dept == null) {
            dept = departmentRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("No department available"));
        }

        Doctor doctor = Doctor.builder()
                .user(savedUser)
                .department(dept)
                .specialization(dto.getSpecialization() != null && !dto.getSpecialization().isBlank() ? dto.getSpecialization() : "General Medicine")
                .consultationFee(dto.getConsultationFee() != null ? dto.getConsultationFee() : BigDecimal.valueOf(50.00))
                .status("ACTIVE")
                .build();
        Doctor savedDoctor = doctorRepository.save(doctor);

        // Create standard weekday availability
        String[] days = {"MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"};
        int capacity = dto.getMaxPatientsPerDay() != null ? dto.getMaxPatientsPerDay() : 25;
        for (String day : days) {
            DoctorAvailability da = new DoctorAvailability();
            da.setDoctor(savedDoctor);
            da.setDayOfWeek(day);
            da.setStartTime(LocalTime.of(9, 0));
            da.setEndTime(LocalTime.of(17, 0));
            da.setBreakStartTime(LocalTime.of(13, 0));
            da.setBreakEndTime(LocalTime.of(14, 0));
            da.setMaxCapacityPerDay(capacity);
            availabilityRepository.save(da);
        }

        auditService.logAction("CREATE", "Doctor", savedDoctor.getId(), "Added consulting physician: " + docName);
        return mapToDto(savedDoctor);
    }

    @Transactional
    public DoctorDto updateDoctor(Long id, DoctorDto dto) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + id));

        if (dto.getFullName() != null && !dto.getFullName().isBlank()) {
            doctor.getUser().setFullName(dto.getFullName());
        }
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            doctor.getUser().setEmail(dto.getEmail());
        }
        if (dto.getPhone() != null && !dto.getPhone().isBlank()) {
            doctor.getUser().setPhone(dto.getPhone());
        }
        userRepository.save(doctor.getUser());

        if (dto.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(dto.getDepartmentId()).orElse(null);
            if (dept != null) doctor.setDepartment(dept);
        }
        if (dto.getSpecialization() != null && !dto.getSpecialization().isBlank()) {
            doctor.setSpecialization(dto.getSpecialization());
        }
        if (dto.getConsultationFee() != null) {
            doctor.setConsultationFee(dto.getConsultationFee());
        }
        if (dto.getStatus() != null) {
            doctor.setStatus(dto.getStatus());
        }

        Doctor saved = doctorRepository.save(doctor);
        auditService.logAction("UPDATE", "Doctor", saved.getId(), "Updated doctor details: " + saved.getUser().getFullName());
        return mapToDto(saved);
    }

    @Transactional
    public void deleteOrDeactivateDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + id));

        String docName = doctor.getUser().getFullName();

        // Check if doctor has existing appointments
        List<Appointment> existingAppointments = appointmentRepository.findActiveDoctorAppointmentsForDay(
                id, java.time.LocalDateTime.now().minusYears(10), java.time.LocalDateTime.now().plusYears(10));

        if (!existingAppointments.isEmpty()) {
            // Soft delete: deactivate doctor and user account to preserve historical medical records
            doctor.setStatus("INACTIVE");
            doctor.getUser().setIsActive(false);
            userRepository.save(doctor.getUser());
            doctorRepository.save(doctor);
            auditService.logAction("DEACTIVATE", "Doctor", id, "Physician left hospital - deactivated: " + docName);
        } else {
            // No clinical dependencies: drop availability and delete doctor record
            List<DoctorAvailability> avs = availabilityRepository.findByDoctorId(id);
            availabilityRepository.deleteAll(avs);
            List<DoctorLeave> leaves = leaveRepository.findByDoctorId(id);
            leaveRepository.deleteAll(leaves);
            doctorRepository.delete(doctor);
            userRepository.delete(doctor.getUser());
            auditService.logAction("DELETE", "Doctor", id, "Physician dropped from hospital directory: " + docName);
        }
    }

    @Transactional
    public DoctorLeaveDto applyDoctorLeave(DoctorLeaveDto dto) {
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + dto.getDoctorId()));

        DoctorLeave leave = DoctorLeave.builder()
                .doctor(doctor)
                .leaveDate(dto.getLeaveDate())
                .sessionType(dto.getSessionType() != null ? dto.getSessionType() : "FULL_DAY")
                .reason(dto.getReason())
                .status("APPROVED")
                .build();

        DoctorLeave saved = leaveRepository.save(leave);
        auditService.logAction("APPLY_LEAVE", "DoctorLeave", saved.getId(),
                "Doctor " + doctor.getId() + " leave on " + dto.getLeaveDate());

        return DoctorLeaveDto.builder()
                .id(saved.getId())
                .doctorId(doctor.getId())
                .leaveDate(saved.getLeaveDate())
                .sessionType(saved.getSessionType())
                .reason(saved.getReason())
                .status(saved.getStatus())
                .build();
    }

    public List<DoctorLeaveDto> getDoctorLeaves(Long doctorId) {
        return leaveRepository.findByDoctorId(doctorId).stream()
                .map(l -> DoctorLeaveDto.builder()
                        .id(l.getId())
                        .doctorId(l.getDoctor().getId())
                        .leaveDate(l.getLeaveDate())
                        .sessionType(l.getSessionType())
                        .reason(l.getReason())
                        .status(l.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    public List<DoctorAvailabilityDto> getDoctorAvailabilityList(Long doctorId) {
        return availabilityRepository.findByDoctorId(doctorId).stream()
                .map(this::mapAvailabilityToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DoctorAvailabilityDto saveAvailability(DoctorAvailabilityDto dto) {
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found: " + dto.getDoctorId()));

        validateTimes(dto);

        DoctorAvailability availability = availabilityRepository
                .findByDoctorIdAndDayOfWeek(dto.getDoctorId(), dto.getDayOfWeek().toUpperCase())
                .orElse(new DoctorAvailability());

        availability.setDoctor(doctor);
        availability.setDayOfWeek(dto.getDayOfWeek().toUpperCase());
        availability.setStartTime(dto.getStartTime());
        availability.setEndTime(dto.getEndTime());
        availability.setBreakStartTime(dto.getBreakStartTime());
        availability.setBreakEndTime(dto.getBreakEndTime());
        availability.setMaxCapacityPerDay(dto.getMaxCapacityPerDay() != null ? dto.getMaxCapacityPerDay() : 20);

        DoctorAvailability saved = availabilityRepository.save(availability);
        auditService.logAction("AVAILABILITY_SAVED", "DoctorAvailability", saved.getId(),
                "Doctor " + doctor.getId() + " availability set for " + dto.getDayOfWeek());

        return mapAvailabilityToDto(saved);
    }

    @Transactional
    public DoctorAvailabilityDto updateAvailability(Long avId, DoctorAvailabilityDto dto) {
        DoctorAvailability availability = availabilityRepository.findById(avId)
                .orElseThrow(() -> new RuntimeException("Availability record not found: " + avId));

        validateTimes(dto);

        if (dto.getStartTime() != null) availability.setStartTime(dto.getStartTime());
        if (dto.getEndTime() != null) availability.setEndTime(dto.getEndTime());
        availability.setBreakStartTime(dto.getBreakStartTime());
        availability.setBreakEndTime(dto.getBreakEndTime());
        if (dto.getMaxCapacityPerDay() != null) availability.setMaxCapacityPerDay(dto.getMaxCapacityPerDay());

        DoctorAvailability saved = availabilityRepository.save(availability);
        auditService.logAction("AVAILABILITY_UPDATED", "DoctorAvailability", saved.getId(),
                "Availability record " + avId + " updated");

        return mapAvailabilityToDto(saved);
    }

    @Transactional
    public void deleteAvailability(Long avId) {
        availabilityRepository.deleteById(avId);
        auditService.logAction("AVAILABILITY_DELETED", "DoctorAvailability", avId, "Availability removed");
    }

    private void validateTimes(DoctorAvailabilityDto dto) {
        if (dto.getStartTime() != null && dto.getEndTime() != null) {
            if (!dto.getEndTime().isAfter(dto.getStartTime())) {
                throw new RuntimeException("End time must be after start time.");
            }
        }
        if (dto.getBreakStartTime() != null && dto.getBreakEndTime() != null) {
            if (!dto.getBreakEndTime().isAfter(dto.getBreakStartTime())) {
                throw new RuntimeException("Break end time must be after break start time.");
            }
        }
    }

    private DoctorAvailabilityDto mapAvailabilityToDto(DoctorAvailability a) {
        return DoctorAvailabilityDto.builder()
                .id(a.getId())
                .doctorId(a.getDoctor().getId())
                .dayOfWeek(a.getDayOfWeek())
                .startTime(a.getStartTime())
                .endTime(a.getEndTime())
                .breakStartTime(a.getBreakStartTime())
                .breakEndTime(a.getBreakEndTime())
                .maxCapacityPerDay(a.getMaxCapacityPerDay())
                .build();
    }

    public DoctorDto mapToDto(Doctor d) {
        List<DoctorAvailabilityDto> avList = availabilityRepository.findByDoctorId(d.getId())
                .stream()
                .map(this::mapAvailabilityToDto)
                .collect(Collectors.toList());

        DoctorDto dto = DoctorDto.builder()
                .id(d.getId())
                .userId(d.getUser().getId())
                .fullName(d.getUser().getFullName())
                .email(d.getUser().getEmail())
                .phone(d.getUser().getPhone())
                .departmentId(d.getDepartment().getId())
                .departmentName(d.getDepartment().getName())
                .specialization(d.getSpecialization())
                .consultationFee(d.getConsultationFee())
                .status(d.getStatus())
                .roomNumber("OPD-101")
                .slotDurationMinutes(30)
                .maxPatientsPerDay(25)
                .experienceYears(8)
                .rating(4.8)
                .availabilities(avList)
                .build();
        dto.setName(d.getUser().getFullName());
        return dto;
    }
}
