package com.healthcare.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "queue_entries")
public class QueueEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "appointment_id", nullable = false, unique = true)
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "token_number", nullable = false, length = 30)
    private String tokenNumber;

    @Column(name = "queue_position", nullable = false)
    private Integer queuePosition = 1;

    @Column(name = "queue_status", nullable = false, length = 30)
    private String queueStatus = "WAITING";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "priority_rule_id")
    private PriorityRule priorityRule;

    @Column(name = "checked_in_at")
    private LocalDateTime checkedInAt;

    @Column(name = "consultation_started_at")
    private LocalDateTime consultationStartedAt;

    @Column(name = "consultation_ended_at")
    private LocalDateTime consultationEndedAt;

    @Column(name = "estimated_wait_minutes")
    private Integer estimatedWaitMinutes = 0;

    public QueueEntry() {}

    public QueueEntry(Long id, Appointment appointment, Doctor doctor, String tokenNumber, Integer queuePosition, String queueStatus, PriorityRule priorityRule, LocalDateTime checkedInAt, LocalDateTime consultationStartedAt, LocalDateTime consultationEndedAt, Integer estimatedWaitMinutes) {
        this.id = id;
        this.appointment = appointment;
        this.doctor = doctor;
        this.tokenNumber = tokenNumber;
        this.queuePosition = queuePosition != null ? queuePosition : 1;
        this.queueStatus = queueStatus != null ? queueStatus : "WAITING";
        this.priorityRule = priorityRule;
        this.checkedInAt = checkedInAt;
        this.consultationStartedAt = consultationStartedAt;
        this.consultationEndedAt = consultationEndedAt;
        this.estimatedWaitMinutes = estimatedWaitMinutes != null ? estimatedWaitMinutes : 0;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Appointment appointment;
        private Doctor doctor;
        private String tokenNumber;
        private Integer queuePosition = 1;
        private String queueStatus = "WAITING";
        private PriorityRule priorityRule;
        private LocalDateTime checkedInAt;
        private LocalDateTime consultationStartedAt;
        private LocalDateTime consultationEndedAt;
        private Integer estimatedWaitMinutes = 0;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder appointment(Appointment appointment) { this.appointment = appointment; return this; }
        public Builder doctor(Doctor doctor) { this.doctor = doctor; return this; }
        public Builder tokenNumber(String tokenNumber) { this.tokenNumber = tokenNumber; return this; }
        public Builder queuePosition(Integer queuePosition) { this.queuePosition = queuePosition; return this; }
        public Builder queueStatus(String queueStatus) { this.queueStatus = queueStatus; return this; }
        public Builder priorityRule(PriorityRule priorityRule) { this.priorityRule = priorityRule; return this; }
        public Builder checkedInAt(LocalDateTime checkedInAt) { this.checkedInAt = checkedInAt; return this; }
        public Builder consultationStartedAt(LocalDateTime consultationStartedAt) { this.consultationStartedAt = consultationStartedAt; return this; }
        public Builder consultationEndedAt(LocalDateTime consultationEndedAt) { this.consultationEndedAt = consultationEndedAt; return this; }
        public Builder estimatedWaitMinutes(Integer estimatedWaitMinutes) { this.estimatedWaitMinutes = estimatedWaitMinutes; return this; }

        public QueueEntry build() {
            return new QueueEntry(id, appointment, doctor, tokenNumber, queuePosition, queueStatus, priorityRule, checkedInAt, consultationStartedAt, consultationEndedAt, estimatedWaitMinutes);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Appointment getAppointment() { return appointment; }
    public void setAppointment(Appointment appointment) { this.appointment = appointment; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }

    public String getTokenNumber() { return tokenNumber; }
    public void setTokenNumber(String tokenNumber) { this.tokenNumber = tokenNumber; }

    public Integer getQueuePosition() { return queuePosition; }
    public void setQueuePosition(Integer queuePosition) { this.queuePosition = queuePosition; }

    public String getQueueStatus() { return queueStatus; }
    public void setQueueStatus(String queueStatus) { this.queueStatus = queueStatus; }

    public PriorityRule getPriorityRule() { return priorityRule; }
    public void setPriorityRule(PriorityRule priorityRule) { this.priorityRule = priorityRule; }

    public LocalDateTime getCheckedInAt() { return checkedInAt; }
    public void setCheckedInAt(LocalDateTime checkedInAt) { this.checkedInAt = checkedInAt; }

    public LocalDateTime getConsultationStartedAt() { return consultationStartedAt; }
    public void setConsultationStartedAt(LocalDateTime consultationStartedAt) { this.consultationStartedAt = consultationStartedAt; }

    public LocalDateTime getConsultationEndedAt() { return consultationEndedAt; }
    public void setConsultationEndedAt(LocalDateTime consultationEndedAt) { this.consultationEndedAt = consultationEndedAt; }

    public Integer getEstimatedWaitMinutes() { return estimatedWaitMinutes; }
    public void setEstimatedWaitMinutes(Integer estimatedWaitMinutes) { this.estimatedWaitMinutes = estimatedWaitMinutes; }
}
