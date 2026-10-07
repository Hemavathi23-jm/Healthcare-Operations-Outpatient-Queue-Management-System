package com.healthcare.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class DoctorLeaveDto {
    private Long id;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotNull(message = "Leave date is required")
    private LocalDate leaveDate;

    private String sessionType;
    private String reason;
    private String status;

    public DoctorLeaveDto() {}

    public DoctorLeaveDto(Long id, Long doctorId, LocalDate leaveDate, String sessionType, String reason, String status) {
        this.id = id;
        this.doctorId = doctorId;
        this.leaveDate = leaveDate;
        this.sessionType = sessionType;
        this.reason = reason;
        this.status = status;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Long doctorId;
        private LocalDate leaveDate;
        private String sessionType;
        private String reason;
        private String status;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder doctorId(Long doctorId) { this.doctorId = doctorId; return this; }
        public Builder leaveDate(LocalDate leaveDate) { this.leaveDate = leaveDate; return this; }
        public Builder sessionType(String sessionType) { this.sessionType = sessionType; return this; }
        public Builder reason(String reason) { this.reason = reason; return this; }
        public Builder status(String status) { this.status = status; return this; }

        public DoctorLeaveDto build() { return new DoctorLeaveDto(id, doctorId, leaveDate, sessionType, reason, status); }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public LocalDate getLeaveDate() { return leaveDate; }
    public void setLeaveDate(LocalDate leaveDate) { this.leaveDate = leaveDate; }
    public String getSessionType() { return sessionType; }
    public void setSessionType(String sessionType) { this.sessionType = sessionType; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
