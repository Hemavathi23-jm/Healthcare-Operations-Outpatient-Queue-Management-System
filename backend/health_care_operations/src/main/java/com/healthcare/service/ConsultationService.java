package com.healthcare.service;

import com.healthcare.dto.ConsultationRequestDto;
import com.healthcare.dto.ConsultationResponseDto;
import com.healthcare.dto.PrescriptionItemDto;
import com.healthcare.dto.QueueBroadcastMessage;
import com.healthcare.entity.*;
import com.healthcare.repository.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final AppointmentRepository appointmentRepository;
    private final QueueEntryRepository queueEntryRepository;
    private final AuditService auditService;
    private final SimpMessagingTemplate messagingTemplate;

    public ConsultationService(ConsultationRepository consultationRepository,
                               AppointmentRepository appointmentRepository,
                               QueueEntryRepository queueEntryRepository,
                               AuditService auditService,
                               SimpMessagingTemplate messagingTemplate) {
        this.consultationRepository = consultationRepository;
        this.appointmentRepository = appointmentRepository;
        this.queueEntryRepository = queueEntryRepository;
        this.auditService = auditService;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public ConsultationResponseDto saveConsultation(ConsultationRequestDto request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + request.getAppointmentId()));

        Doctor doctor = appointment.getDoctor();
        Patient patient = appointment.getPatient();

        Consultation consultation = consultationRepository.findByAppointmentId(appointment.getId())
                .orElse(new Consultation());

        consultation.setAppointment(appointment);
        consultation.setDoctor(doctor);
        consultation.setPatient(patient);
        consultation.setBloodPressure(request.getBloodPressure());
        consultation.setPulseRate(request.getPulseRate());
        consultation.setTemperature(request.getTemperature());
        consultation.setSpo2(request.getSpo2());
        consultation.setWeightKg(request.getWeightKg());
        consultation.setChiefComplaints(request.getChiefComplaints());
        consultation.setDiagnosis(request.getDiagnosis());
        consultation.setClinicalNotes(request.getClinicalNotes());
        consultation.setLabInvestigations(request.getLabInvestigations());
        consultation.setFollowUpDate(request.getFollowUpDate());

        // Clear existing prescription items if updating
        consultation.getPrescriptionItems().clear();

        if (request.getPrescriptionItems() != null) {
            for (PrescriptionItemDto itemDto : request.getPrescriptionItems()) {
                if (itemDto.getMedicineName() != null && !itemDto.getMedicineName().isBlank()) {
                    PrescriptionItem item = new PrescriptionItem();
                    item.setMedicineName(itemDto.getMedicineName().trim());
                    item.setDosage(itemDto.getDosage());
                    item.setFrequency(itemDto.getFrequency());
                    item.setDuration(itemDto.getDuration());
                    item.setInstructions(itemDto.getInstructions());
                    consultation.addPrescriptionItem(item);
                }
            }
        }

        Consultation saved = consultationRepository.save(consultation);

        // Update appointment status to COMPLETED
        appointment.setStatus("COMPLETED");
        if (request.getDiagnosis() != null) {
            appointment.setDoctorNotes("Diagnosis: " + request.getDiagnosis() + 
                    (request.getClinicalNotes() != null ? " | Notes: " + request.getClinicalNotes() : ""));
        }
        appointmentRepository.save(appointment);

        // Update queue entry if present
        Optional<QueueEntry> queueEntryOpt = queueEntryRepository.findByAppointmentId(appointment.getId());
        if (queueEntryOpt.isPresent()) {
            QueueEntry queueEntry = queueEntryOpt.get();
            queueEntry.setQueueStatus("COMPLETED");
            queueEntry.setConsultationEndedAt(LocalDateTime.now());
            queueEntryRepository.save(queueEntry);

            // Broadcast real-time WebSocket update
            QueueBroadcastMessage message = new QueueBroadcastMessage(
                    "COMPLETE",
                    doctor.getId(),
                    queueEntry.getId(),
                    queueEntry.getTokenNumber(),
                    "COMPLETED",
                    patient.getFirstName() + " " + patient.getLastName(),
                    "Consultation completed and prescription generated for token " + queueEntry.getTokenNumber()
            );
            messagingTemplate.convertAndSend("/topic/queue", message);
            messagingTemplate.convertAndSend("/topic/queue/doctor/" + doctor.getId(), message);
        }

        auditService.logAction("CONSULTATION_SAVED", "Consultation", saved.getId(),
                "Recorded consultation and prescription for appointment " + appointment.getAppointmentNumber());

        return mapToDto(saved);
    }

    public Optional<ConsultationResponseDto> getConsultationByAppointmentId(Long appointmentId) {
        return consultationRepository.findByAppointmentId(appointmentId)
                .map(this::mapToDto);
    }

    public List<ConsultationResponseDto> getConsultationsByPatientId(Long patientId) {
        return consultationRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ConsultationResponseDto> getConsultationsByDoctorId(Long doctorId) {
        return consultationRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ConsultationResponseDto mapToDto(Consultation c) {
        ConsultationResponseDto dto = new ConsultationResponseDto();
        dto.setId(c.getId());
        dto.setAppointmentId(c.getAppointment().getId());
        dto.setAppointmentNumber(c.getAppointment().getAppointmentNumber());
        dto.setDoctorId(c.getDoctor().getId());
        dto.setDoctorName(c.getDoctor().getUser().getFullName());
        dto.setDoctorSpecialization(c.getDoctor().getSpecialization());
        dto.setDepartmentName(c.getDoctor().getDepartment().getName());
        dto.setPatientId(c.getPatient().getId());
        dto.setPatientName(c.getPatient().getFirstName() + " " + c.getPatient().getLastName());
        dto.setPatientCode(c.getPatient().getPatientCode());
        dto.setPatientGender(c.getPatient().getGender());
        dto.setPatientDob(c.getPatient().getDateOfBirth());
        dto.setPatientPhone(c.getPatient().getPhone());
        dto.setPatientBloodGroup(c.getPatient().getBloodGroup());
        dto.setBloodPressure(c.getBloodPressure());
        dto.setPulseRate(c.getPulseRate());
        dto.setTemperature(c.getTemperature());
        dto.setSpo2(c.getSpo2());
        dto.setWeightKg(c.getWeightKg());
        dto.setChiefComplaints(c.getChiefComplaints());
        dto.setDiagnosis(c.getDiagnosis());
        dto.setClinicalNotes(c.getClinicalNotes());
        dto.setLabInvestigations(c.getLabInvestigations());
        dto.setFollowUpDate(c.getFollowUpDate());
        dto.setCreatedAt(c.getCreatedAt());

        if (c.getPrescriptionItems() != null) {
            List<PrescriptionItemDto> items = c.getPrescriptionItems().stream()
                    .map(item -> new PrescriptionItemDto(
                            item.getId(),
                            item.getMedicineName(),
                            item.getDosage(),
                            item.getFrequency(),
                            item.getDuration(),
                            item.getInstructions()
                    ))
                    .collect(Collectors.toList());
            dto.setPrescriptionItems(items);
        }

        return dto;
    }
}
