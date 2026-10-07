package com.healthcare.service;

import com.healthcare.dto.QueueBroadcastMessage;
import com.healthcare.dto.QueueCheckInRequest;
import com.healthcare.dto.QueueEntryResponseDto;
import com.healthcare.entity.*;
import com.healthcare.repository.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class QueueAndPriorityService {

    private final QueueEntryRepository queueEntryRepository;
    private final AppointmentRepository appointmentRepository;
    private final PriorityRuleRepository priorityRuleRepository;
    private final AuditService auditService;
    private final SimpMessagingTemplate messagingTemplate;

    public QueueAndPriorityService(QueueEntryRepository queueEntryRepository,
                                  AppointmentRepository appointmentRepository,
                                  PriorityRuleRepository priorityRuleRepository,
                                  AuditService auditService,
                                  SimpMessagingTemplate messagingTemplate) {
        this.queueEntryRepository = queueEntryRepository;
        this.appointmentRepository = appointmentRepository;
        this.priorityRuleRepository = priorityRuleRepository;
        this.auditService = auditService;
        this.messagingTemplate = messagingTemplate;
    }

    private void broadcastQueueEvent(String eventType, Long doctorId, Long queueEntryId, String tokenNumber, String queueStatus, String patientName, String message) {
        try {
            QueueBroadcastMessage payload = new QueueBroadcastMessage(
                    eventType, doctorId, queueEntryId, tokenNumber, queueStatus, patientName, message
            );
            messagingTemplate.convertAndSend("/topic/queue", payload);
            if (doctorId != null) {
                messagingTemplate.convertAndSend("/topic/queue/doctor/" + doctorId, payload);
            }
        } catch (Exception e) {
            // Log non-fatal websocket error
            System.err.println("WebSocket broadcast error: " + e.getMessage());
        }
    }

    @Transactional
    public QueueEntryResponseDto checkIn(QueueCheckInRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + request.getAppointmentId()));

        Optional<QueueEntry> existing = queueEntryRepository.findByAppointmentId(appointment.getId());
        if (existing.isPresent()) {
            return mapToDto(existing.get());
        }

        Doctor doctor = appointment.getDoctor();
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        long countToday = queueEntryRepository.countTodayTokensForDoctor(doctor.getId(), todayStart);
        String tokenNumber = String.format("D%d-%03d", doctor.getId(), countToday + 1);

        String category = request.getPriorityCategory() != null ? request.getPriorityCategory() : appointment.getPriorityCategory();
        PriorityRule priorityRule = priorityRuleRepository.findByCategoryName(category)
                .orElseGet(() -> priorityRuleRepository.findByCategoryName("SCHEDULED_STANDARD").orElse(null));

        QueueEntry queueEntry = QueueEntry.builder()
                .appointment(appointment)
                .doctor(doctor)
                .tokenNumber(tokenNumber)
                .queueStatus("WAITING")
                .priorityRule(priorityRule)
                .checkedInAt(LocalDateTime.now())
                .estimatedWaitMinutes(0)
                .build();

        appointment.setStatus("IN_QUEUE");
        appointmentRepository.save(appointment);

        QueueEntry saved = queueEntryRepository.save(queueEntry);
        auditService.logAction("CHECK_IN", "QueueEntry", saved.getId(), "Checked in token " + tokenNumber);

        recalculateQueue(doctor.getId());

        Patient patient = appointment.getPatient();
        broadcastQueueEvent(
                "CHECK_IN",
                doctor.getId(),
                saved.getId(),
                tokenNumber,
                "WAITING",
                patient.getFirstName() + " " + patient.getLastName(),
                "Token " + tokenNumber + " (" + patient.getFirstName() + " " + patient.getLastName() + ") checked in"
        );

        return mapToDto(queueEntryRepository.findById(saved.getId()).orElse(saved));
    }

    @Transactional
    public QueueEntryResponseDto callPatientById(Long queueEntryId) {
        QueueEntry targetEntry = queueEntryRepository.findById(queueEntryId)
                .orElseThrow(() -> new RuntimeException("Queue entry not found with ID: " + queueEntryId));

        Doctor doctor = targetEntry.getDoctor();
        Long doctorId = doctor.getId();

        // Mark any existing in-consultation patient for this doctor as completed
        List<QueueEntry> inConsultation = queueEntryRepository.findByDoctorIdAndQueueStatus(doctorId, "IN_CONSULTATION");
        for (QueueEntry entry : inConsultation) {
            if (!entry.getId().equals(targetEntry.getId())) {
                entry.setQueueStatus("COMPLETED");
                entry.setConsultationEndedAt(LocalDateTime.now());
                if (entry.getAppointment() != null) {
                    entry.getAppointment().setStatus("COMPLETED");
                    appointmentRepository.save(entry.getAppointment());
                }
                queueEntryRepository.save(entry);
            }
        }

        targetEntry.setQueueStatus("IN_CONSULTATION");
        targetEntry.setConsultationStartedAt(LocalDateTime.now());
        if (targetEntry.getAppointment() != null) {
            targetEntry.getAppointment().setStatus("IN_CONSULTATION");
            appointmentRepository.save(targetEntry.getAppointment());
        }
        QueueEntry saved = queueEntryRepository.save(targetEntry);

        auditService.logAction("CALL_PATIENT", "QueueEntry", saved.getId(), "Called patient token " + saved.getTokenNumber());
        recalculateQueue(doctorId);

        Patient patient = saved.getAppointment() != null ? saved.getAppointment().getPatient() : null;
        String patientName = patient != null ? (patient.getFirstName() + " " + patient.getLastName()) : "Patient";

        broadcastQueueEvent(
                "CALL_NEXT",
                doctorId,
                saved.getId(),
                saved.getTokenNumber(),
                "IN_CONSULTATION",
                patientName,
                "Token " + saved.getTokenNumber() + " called into consultation room"
        );

        return mapToDto(saved);
    }

    @Transactional
    public QueueEntryResponseDto callNext(Long doctorId) {
        List<QueueEntry> inConsultation = queueEntryRepository.findByDoctorIdAndQueueStatus(doctorId, "IN_CONSULTATION");
        for (QueueEntry entry : inConsultation) {
            entry.setQueueStatus("COMPLETED");
            entry.setConsultationEndedAt(LocalDateTime.now());
            if (entry.getAppointment() != null) {
                entry.getAppointment().setStatus("COMPLETED");
                appointmentRepository.save(entry.getAppointment());
            }
            queueEntryRepository.save(entry);
        }

        List<QueueEntry> waiting = queueEntryRepository.findWaitingQueueForDoctor(doctorId);
        if (waiting.isEmpty()) {
            return null;
        }

        QueueEntry nextPatient = waiting.get(0);
        nextPatient.setQueueStatus("IN_CONSULTATION");
        nextPatient.setConsultationStartedAt(LocalDateTime.now());
        if (nextPatient.getAppointment() != null) {
            nextPatient.getAppointment().setStatus("IN_CONSULTATION");
            appointmentRepository.save(nextPatient.getAppointment());
        }
        QueueEntry saved = queueEntryRepository.save(nextPatient);

        auditService.logAction("CALL_PATIENT", "QueueEntry", saved.getId(), "Called patient token " + saved.getTokenNumber());
        recalculateQueue(doctorId);

        Patient patient = saved.getAppointment().getPatient();
        broadcastQueueEvent(
                "CALL_NEXT",
                doctorId,
                saved.getId(),
                saved.getTokenNumber(),
                "IN_CONSULTATION",
                patient.getFirstName() + " " + patient.getLastName(),
                "Token " + saved.getTokenNumber() + " called into consultation room"
        );

        return mapToDto(saved);
    }

    @Transactional
    public QueueEntryResponseDto completeConsultation(Long queueEntryId, String doctorNotes) {
        QueueEntry entry = queueEntryRepository.findById(queueEntryId)
                .orElseThrow(() -> new RuntimeException("Queue entry not found with ID: " + queueEntryId));

        entry.setQueueStatus("COMPLETED");
        entry.setConsultationEndedAt(LocalDateTime.now());
        entry.getAppointment().setStatus("COMPLETED");
        if (doctorNotes != null) {
            entry.getAppointment().setDoctorNotes(doctorNotes);
        }
        QueueEntry saved = queueEntryRepository.save(entry);

        auditService.logAction("COMPLETE_VISIT", "QueueEntry", saved.getId(), "Completed consultation for token " + saved.getTokenNumber());
        recalculateQueue(entry.getDoctor().getId());

        Patient patient = saved.getAppointment().getPatient();
        broadcastQueueEvent(
                "COMPLETE",
                entry.getDoctor().getId(),
                saved.getId(),
                saved.getTokenNumber(),
                "COMPLETED",
                patient.getFirstName() + " " + patient.getLastName(),
                "Token " + saved.getTokenNumber() + " consultation marked complete"
        );

        return mapToDto(saved);
    }

    @Transactional
    public QueueEntryResponseDto skipPatient(Long queueEntryId, String reason) {
        QueueEntry entry = queueEntryRepository.findById(queueEntryId)
                .orElseThrow(() -> new RuntimeException("Queue entry not found with ID: " + queueEntryId));

        entry.setQueueStatus("SKIPPED");
        entry.getAppointment().setStatus("MISSED");
        QueueEntry saved = queueEntryRepository.save(entry);

        auditService.logAction("SKIP_PATIENT", "QueueEntry", saved.getId(), "Skipped token " + saved.getTokenNumber() + ". Reason: " + reason);
        recalculateQueue(entry.getDoctor().getId());

        Patient patient = saved.getAppointment().getPatient();
        broadcastQueueEvent(
                "SKIP",
                entry.getDoctor().getId(),
                saved.getId(),
                saved.getTokenNumber(),
                "SKIPPED",
                patient.getFirstName() + " " + patient.getLastName(),
                "Token " + saved.getTokenNumber() + " was skipped"
        );

        return mapToDto(saved);
    }

    public List<QueueEntryResponseDto> getLiveQueueForDoctor(Long doctorId) {
        return queueEntryRepository.findActiveQueueForDoctor(doctorId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<QueueEntryResponseDto> getAllActiveQueues() {
        return queueEntryRepository.findAllActiveQueues()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void recalculateQueue(Long doctorId) {
        List<QueueEntry> entries = queueEntryRepository.findActiveQueueForDoctor(doctorId);
        int runningWaitMinutes = 0;
        int position = 1;

        for (QueueEntry entry : entries) {
            entry.setQueuePosition(position++);
            if ("IN_CONSULTATION".equalsIgnoreCase(entry.getQueueStatus())) {
                entry.setEstimatedWaitMinutes(0);
                runningWaitMinutes += entry.getAppointment().getAppointmentType().getDurationMinutes() / 2;
            } else if ("WAITING".equalsIgnoreCase(entry.getQueueStatus())) {
                entry.setEstimatedWaitMinutes(runningWaitMinutes);
                runningWaitMinutes += entry.getAppointment().getAppointmentType().getDurationMinutes();
            }
            queueEntryRepository.save(entry);
        }
    }

    public QueueEntryResponseDto mapToDto(QueueEntry q) {
        return QueueEntryResponseDto.builder()
                .id(q.getId())
                .appointmentId(q.getAppointment().getId())
                .appointmentNumber(q.getAppointment().getAppointmentNumber())
                .doctorId(q.getDoctor().getId())
                .doctorName(q.getDoctor().getUser().getFullName())
                .patientId(q.getAppointment().getPatient().getId())
                .patientName(q.getAppointment().getPatient().getFirstName() + " " + q.getAppointment().getPatient().getLastName())
                .patientCode(q.getAppointment().getPatient().getPatientCode())
                .patientPhone(q.getAppointment().getPatient().getPhone())
                .tokenNumber(q.getTokenNumber())
                .queuePosition(q.getQueuePosition())
                .queueStatus(q.getQueueStatus())
                .priorityCategory(q.getPriorityRule() != null ? q.getPriorityRule().getCategoryName() : "SCHEDULED_STANDARD")
                .priorityWeight(q.getPriorityRule() != null ? q.getPriorityRule().getPriorityWeight() : 10)
                .appointmentTypeName(q.getAppointment().getAppointmentType().getTypeName())
                .scheduledStartTime(q.getAppointment().getScheduledStartTime())
                .checkedInAt(q.getCheckedInAt())
                .consultationStartedAt(q.getConsultationStartedAt())
                .consultationEndedAt(q.getConsultationEndedAt())
                .estimatedWaitMinutes(q.getEstimatedWaitMinutes())
                .reasonForVisit(q.getAppointment().getReasonForVisit())
                .build();
    }
}
