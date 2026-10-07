package com.healthcare.service;

import com.healthcare.dto.AppointmentBookingRequest;
import com.healthcare.dto.AppointmentRescheduleRequest;
import com.healthcare.dto.AppointmentResponseDto;
import com.healthcare.entity.*;
import com.healthcare.repository.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final AppointmentTypeRepository appointmentTypeRepository;
    private final AppointmentHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final QueueEntryRepository queueEntryRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              PatientRepository patientRepository,
                              DoctorRepository doctorRepository,
                              DepartmentRepository departmentRepository,
                              AppointmentTypeRepository appointmentTypeRepository,
                              AppointmentHistoryRepository historyRepository,
                              UserRepository userRepository,
                              AuditService auditService,
                              QueueEntryRepository queueEntryRepository) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.departmentRepository = departmentRepository;
        this.appointmentTypeRepository = appointmentTypeRepository;
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.queueEntryRepository = queueEntryRepository;
    }

    @Transactional
    public AppointmentResponseDto bookAppointment(AppointmentBookingRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        AppointmentType appointmentType = appointmentTypeRepository.findById(request.getAppointmentTypeId())
                .orElseThrow(() -> new RuntimeException("Appointment type not found"));

        LocalDateTime startTime = request.getScheduledStartTime();
        LocalDateTime endTime = startTime.plusMinutes(appointmentType.getDurationMinutes());

        // Check for double booking / collision
        if (appointmentRepository.hasDoctorTimeCollision(doctor.getId(), startTime, endTime)) {
            throw new RuntimeException("The selected slot is no longer available. Doctor is already booked at this time.");
        }

        String appointmentNumber;
        do {
            appointmentNumber = "APT-" + UUID.randomUUID().toString().replace("-", "").substring(0, 5).toUpperCase();
        } while (appointmentRepository.findByAppointmentNumber(appointmentNumber).isPresent());

        Appointment appointment = Appointment.builder()
                .appointmentNumber(appointmentNumber)
                .patient(patient)
                .doctor(doctor)
                .department(department)
                .appointmentType(appointmentType)
                .scheduledStartTime(startTime)
                .scheduledEndTime(endTime)
                .status("CONFIRMED")
                .priorityCategory(request.getPriorityCategory() != null ? request.getPriorityCategory() : "SCHEDULED_STANDARD")
                .reasonForVisit(request.getReasonForVisit())
                .build();

        Appointment saved = appointmentRepository.save(appointment);

        // Record history
        recordHistory(saved, null, "CONFIRMED", "Initial Booking");

        // Audit Log
        auditService.logAction("CREATE", "Appointment", saved.getId(), "Booked appointment " + appointmentNumber);

        return mapToDto(saved);
    }

    @Transactional
    public AppointmentResponseDto rescheduleAppointment(Long appointmentId, AppointmentRescheduleRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + appointmentId));

        if ("CANCELLED".equalsIgnoreCase(appointment.getStatus()) || "COMPLETED".equalsIgnoreCase(appointment.getStatus())) {
            throw new RuntimeException("Cannot reschedule a " + appointment.getStatus() + " appointment.");
        }

        Doctor doctor = (request.getNewDoctorId() != null)
                ? doctorRepository.findById(request.getNewDoctorId()).orElse(appointment.getDoctor())
                : appointment.getDoctor();

        LocalDateTime newStart = request.getNewScheduledStartTime();
        LocalDateTime newEnd = newStart.plusMinutes(appointment.getAppointmentType().getDurationMinutes());

        if (appointmentRepository.hasDoctorTimeCollisionExcluding(doctor.getId(), newStart, newEnd, appointment.getId())) {
            throw new RuntimeException("Doctor has a conflicting appointment at the requested reschedule time.");
        }

        String prevStatus = appointment.getStatus();
        appointment.setDoctor(doctor);
        appointment.setScheduledStartTime(newStart);
        appointment.setScheduledEndTime(newEnd);
        appointment.setStatus("CONFIRMED");

        Appointment updated = appointmentRepository.save(appointment);

        recordHistory(updated, prevStatus, "RESCHEDULED", request.getReason() != null ? request.getReason() : "Rescheduled by user");
        auditService.logAction("RESCHEDULE", "Appointment", updated.getId(), "Rescheduled appointment to " + newStart);

        return mapToDto(updated);
    }

    @Transactional
    public AppointmentResponseDto cancelAppointment(Long appointmentId, String reason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + appointmentId));

        String prevStatus = appointment.getStatus();
        appointment.setStatus("CANCELLED");
        Appointment updated = appointmentRepository.save(appointment);

        recordHistory(updated, prevStatus, "CANCELLED", reason != null ? reason : "Cancelled");
        auditService.logAction("CANCEL", "Appointment", updated.getId(), "Cancelled appointment: " + reason);

        return mapToDto(updated);
    }

    @Transactional
    public AppointmentResponseDto updateStatus(Long appointmentId, String newStatus, String notes) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + appointmentId));

        String prevStatus = appointment.getStatus();
        appointment.setStatus(newStatus);
        if (notes != null) {
            appointment.setDoctorNotes(notes);
        }

        Appointment updated = appointmentRepository.save(appointment);
        recordHistory(updated, prevStatus, newStatus, "Status changed to " + newStatus);

        return mapToDto(updated);
    }

    public List<AppointmentResponseDto> getAppointments(Long doctorId, Long departmentId, String status, LocalDate date) {
        LocalDateTime start = (date != null) ? date.atStartOfDay() : LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime end = (date != null) ? date.plusDays(1).atStartOfDay() : LocalDate.now().plusDays(30).atStartOfDay();

        return appointmentRepository.filterAppointments(doctorId, departmentId, status, start, end)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public AppointmentResponseDto getById(Long id) {
        return appointmentRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));
    }

    public List<AppointmentResponseDto> getAppointmentsByPatientId(Long patientId) {
        return appointmentRepository.findByPatientId(patientId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private void recordHistory(Appointment appointment, String prevStatus, String newStatus, String reason) {
        User currentUser = null;
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            currentUser = userRepository.findByUsername(username).orElse(null);
        } catch (Exception ignored) {}

        AppointmentHistory history = AppointmentHistory.builder()
                .appointment(appointment)
                .previousStatus(prevStatus)
                .newStatus(newStatus)
                .changedByUser(currentUser)
                .reason(reason)
                .build();

        historyRepository.save(history);
    }

    public AppointmentResponseDto mapToDto(Appointment a) {
        String tokenNumber = null;
        String queueStatus = null;
        Integer estimatedWaitMinutes = null;
        String effectiveStatus = a.getStatus();

        if (queueEntryRepository != null) {
            Optional<QueueEntry> qEntry = queueEntryRepository.findByAppointmentId(a.getId());
            if (qEntry.isPresent()) {
                QueueEntry qe = qEntry.get();
                tokenNumber = qe.getTokenNumber();
                queueStatus = qe.getQueueStatus();
                estimatedWaitMinutes = qe.getEstimatedWaitMinutes();
                if ("WAITING".equalsIgnoreCase(queueStatus)) {
                    effectiveStatus = "IN_QUEUE";
                } else if ("IN_CONSULTATION".equalsIgnoreCase(queueStatus)) {
                    effectiveStatus = "IN_CONSULTATION";
                } else if ("COMPLETED".equalsIgnoreCase(queueStatus)) {
                    effectiveStatus = "COMPLETED";
                }
            }
        }

        return AppointmentResponseDto.builder()
                .id(a.getId())
                .appointmentNumber(a.getAppointmentNumber())
                .patientId(a.getPatient().getId())
                .patientCode(a.getPatient().getPatientCode())
                .patientName(a.getPatient().getFirstName() + " " + a.getPatient().getLastName())
                .patientPhone(a.getPatient().getPhone())
                .patientGender(a.getPatient().getGender())
                .doctorId(a.getDoctor().getId())
                .doctorName(a.getDoctor().getUser().getFullName())
                .specialization(a.getDoctor().getSpecialization())
                .departmentId(a.getDepartment().getId())
                .departmentName(a.getDepartment().getName())
                .appointmentTypeId(a.getAppointmentType().getId())
                .appointmentTypeName(a.getAppointmentType().getTypeName())
                .durationMinutes(a.getAppointmentType().getDurationMinutes())
                .fee(a.getAppointmentType().getDefaultFee())
                .scheduledStartTime(a.getScheduledStartTime())
                .scheduledEndTime(a.getScheduledEndTime())
                .status(effectiveStatus)
                .priorityCategory(a.getPriorityCategory())
                .reasonForVisit(a.getReasonForVisit())
                .doctorNotes(a.getDoctorNotes())
                .tokenNumber(tokenNumber)
                .queueStatus(queueStatus)
                .estimatedWaitMinutes(estimatedWaitMinutes)
                .createdAt(a.getCreatedAt())
                .build();
    }
}

