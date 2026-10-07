package com.healthcare.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctor_leave")
public class DoctorLeave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "leave_date", nullable = false)
    private LocalDate leaveDate;

    @Column(name = "session_type", nullable = false, length = 30)
    private String sessionType = "FULL_DAY";

    @Column(length = 255)
    private String reason;

    @Column(nullable = false, length = 30)
    private String status = "APPROVED";

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public DoctorLeave() {}

    public DoctorLeave(Long id, Doctor doctor, LocalDate leaveDate, String sessionType, String reason, String status) {
        this.id = id;
        this.doctor = doctor;
        this.leaveDate = leaveDate;
        this.sessionType = sessionType != null ? sessionType : "FULL_DAY";
        this.reason = reason;
        this.status = status != null ? status : "APPROVED";
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Doctor doctor;
        private LocalDate leaveDate;
        private String sessionType = "FULL_DAY";
        private String reason;
        private String status = "APPROVED";

        public Builder id(Long id) { this.id = id; return this; }
        public Builder doctor(Doctor doctor) { this.doctor = doctor; return this; }
        public Builder leaveDate(LocalDate leaveDate) { this.leaveDate = leaveDate; return this; }
        public Builder sessionType(String sessionType) { this.sessionType = sessionType; return this; }
        public Builder reason(String reason) { this.reason = reason; return this; }
        public Builder status(String status) { this.status = status; return this; }

        public DoctorLeave build() {
            return new DoctorLeave(id, doctor, leaveDate, sessionType, reason, status);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }

    public LocalDate getLeaveDate() { return leaveDate; }
    public void setLeaveDate(LocalDate leaveDate) { this.leaveDate = leaveDate; }

    public String getSessionType() { return sessionType; }
    public void setSessionType(String sessionType) { this.sessionType = sessionType; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
