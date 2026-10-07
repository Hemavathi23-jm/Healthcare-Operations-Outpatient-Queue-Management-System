package com.healthcare.dto;

import jakarta.validation.constraints.NotNull;

public class QueueCheckInRequest {

    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    private String priorityCategory;

    public QueueCheckInRequest() {}

    public QueueCheckInRequest(Long appointmentId, String priorityCategory) {
        this.appointmentId = appointmentId;
        this.priorityCategory = priorityCategory;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long appointmentId;
        private String priorityCategory;

        public Builder appointmentId(Long appointmentId) { this.appointmentId = appointmentId; return this; }
        public Builder priorityCategory(String priorityCategory) { this.priorityCategory = priorityCategory; return this; }

        public QueueCheckInRequest build() { return new QueueCheckInRequest(appointmentId, priorityCategory); }
    }

    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }

    public String getPriorityCategory() { return priorityCategory; }
    public void setPriorityCategory(String priorityCategory) { this.priorityCategory = priorityCategory; }
}
