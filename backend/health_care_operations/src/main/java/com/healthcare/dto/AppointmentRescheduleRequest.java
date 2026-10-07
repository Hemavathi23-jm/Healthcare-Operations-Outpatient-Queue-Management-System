package com.healthcare.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class AppointmentRescheduleRequest {

    @NotNull(message = "New scheduled start time is required")
    private LocalDateTime newScheduledStartTime;

    private Long newDoctorId;
    private String reason;

    public AppointmentRescheduleRequest() {}

    public AppointmentRescheduleRequest(LocalDateTime newScheduledStartTime, Long newDoctorId, String reason) {
        this.newScheduledStartTime = newScheduledStartTime;
        this.newDoctorId = newDoctorId;
        this.reason = reason;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private LocalDateTime newScheduledStartTime;
        private Long newDoctorId;
        private String reason;

        public Builder newScheduledStartTime(LocalDateTime newScheduledStartTime) { this.newScheduledStartTime = newScheduledStartTime; return this; }
        public Builder newDoctorId(Long newDoctorId) { this.newDoctorId = newDoctorId; return this; }
        public Builder reason(String reason) { this.reason = reason; return this; }

        public AppointmentRescheduleRequest build() {
            return new AppointmentRescheduleRequest(newScheduledStartTime, newDoctorId, reason);
        }
    }

    public LocalDateTime getNewScheduledStartTime() { return newScheduledStartTime; }
    public void setNewScheduledStartTime(LocalDateTime newScheduledStartTime) { this.newScheduledStartTime = newScheduledStartTime; }

    public Long getNewDoctorId() { return newDoctorId; }
    public void setNewDoctorId(Long newDoctorId) { this.newDoctorId = newDoctorId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
