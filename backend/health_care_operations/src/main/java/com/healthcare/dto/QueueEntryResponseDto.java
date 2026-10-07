package com.healthcare.dto;

import java.time.LocalDateTime;

public class QueueEntryResponseDto {
    private Long id;
    private Long appointmentId;
    private String appointmentNumber;
    private Long doctorId;
    private String doctorName;
    private Long patientId;
    private String patientName;
    private String patientCode;
    private String patientPhone;
    private String tokenNumber;
    private Integer queuePosition;
    private String queueStatus;
    private String priorityCategory;
    private Integer priorityWeight;
    private String appointmentTypeName;
    private LocalDateTime scheduledStartTime;
    private LocalDateTime checkedInAt;
    private LocalDateTime consultationStartedAt;
    private LocalDateTime consultationEndedAt;
    private Integer estimatedWaitMinutes;
    private String reasonForVisit;

    public QueueEntryResponseDto() {}

    public QueueEntryResponseDto(Long id, Long appointmentId, String appointmentNumber, Long doctorId, String doctorName, Long patientId, String patientName, String patientCode, String patientPhone, String tokenNumber, Integer queuePosition, String queueStatus, String priorityCategory, Integer priorityWeight, String appointmentTypeName, LocalDateTime scheduledStartTime, LocalDateTime checkedInAt, LocalDateTime consultationStartedAt, LocalDateTime consultationEndedAt, Integer estimatedWaitMinutes, String reasonForVisit) {
        this.id = id;
        this.appointmentId = appointmentId;
        this.appointmentNumber = appointmentNumber;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.patientId = patientId;
        this.patientName = patientName;
        this.patientCode = patientCode;
        this.patientPhone = patientPhone;
        this.tokenNumber = tokenNumber;
        this.queuePosition = queuePosition;
        this.queueStatus = queueStatus;
        this.priorityCategory = priorityCategory;
        this.priorityWeight = priorityWeight;
        this.appointmentTypeName = appointmentTypeName;
        this.scheduledStartTime = scheduledStartTime;
        this.checkedInAt = checkedInAt;
        this.consultationStartedAt = consultationStartedAt;
        this.consultationEndedAt = consultationEndedAt;
        this.estimatedWaitMinutes = estimatedWaitMinutes;
        this.reasonForVisit = reasonForVisit;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Long appointmentId;
        private String appointmentNumber;
        private Long doctorId;
        private String doctorName;
        private Long patientId;
        private String patientName;
        private String patientCode;
        private String patientPhone;
        private String tokenNumber;
        private Integer queuePosition;
        private String queueStatus;
        private String priorityCategory;
        private Integer priorityWeight;
        private String appointmentTypeName;
        private LocalDateTime scheduledStartTime;
        private LocalDateTime checkedInAt;
        private LocalDateTime consultationStartedAt;
        private LocalDateTime consultationEndedAt;
        private Integer estimatedWaitMinutes;
        private String reasonForVisit;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder appointmentId(Long appointmentId) { this.appointmentId = appointmentId; return this; }
        public Builder appointmentNumber(String appointmentNumber) { this.appointmentNumber = appointmentNumber; return this; }
        public Builder doctorId(Long doctorId) { this.doctorId = doctorId; return this; }
        public Builder doctorName(String doctorName) { this.doctorName = doctorName; return this; }
        public Builder patientId(Long patientId) { this.patientId = patientId; return this; }
        public Builder patientName(String patientName) { this.patientName = patientName; return this; }
        public Builder patientCode(String patientCode) { this.patientCode = patientCode; return this; }
        public Builder patientPhone(String patientPhone) { this.patientPhone = patientPhone; return this; }
        public Builder tokenNumber(String tokenNumber) { this.tokenNumber = tokenNumber; return this; }
        public Builder queuePosition(Integer queuePosition) { this.queuePosition = queuePosition; return this; }
        public Builder queueStatus(String queueStatus) { this.queueStatus = queueStatus; return this; }
        public Builder priorityCategory(String priorityCategory) { this.priorityCategory = priorityCategory; return this; }
        public Builder priorityWeight(Integer priorityWeight) { this.priorityWeight = priorityWeight; return this; }
        public Builder appointmentTypeName(String appointmentTypeName) { this.appointmentTypeName = appointmentTypeName; return this; }
        public Builder scheduledStartTime(LocalDateTime scheduledStartTime) { this.scheduledStartTime = scheduledStartTime; return this; }
        public Builder checkedInAt(LocalDateTime checkedInAt) { this.checkedInAt = checkedInAt; return this; }
        public Builder consultationStartedAt(LocalDateTime consultationStartedAt) { this.consultationStartedAt = consultationStartedAt; return this; }
        public Builder consultationEndedAt(LocalDateTime consultationEndedAt) { this.consultationEndedAt = consultationEndedAt; return this; }
        public Builder estimatedWaitMinutes(Integer estimatedWaitMinutes) { this.estimatedWaitMinutes = estimatedWaitMinutes; return this; }
        public Builder reasonForVisit(String reasonForVisit) { this.reasonForVisit = reasonForVisit; return this; }

        public QueueEntryResponseDto build() {
            return new QueueEntryResponseDto(id, appointmentId, appointmentNumber, doctorId, doctorName, patientId, patientName, patientCode, patientPhone, tokenNumber, queuePosition, queueStatus, priorityCategory, priorityWeight, appointmentTypeName, scheduledStartTime, checkedInAt, consultationStartedAt, consultationEndedAt, estimatedWaitMinutes, reasonForVisit);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }

    public String getAppointmentNumber() { return appointmentNumber; }
    public void setAppointmentNumber(String appointmentNumber) { this.appointmentNumber = appointmentNumber; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getPatientCode() { return patientCode; }
    public void setPatientCode(String patientCode) { this.patientCode = patientCode; }

    public String getPatientPhone() { return patientPhone; }
    public void setPatientPhone(String patientPhone) { this.patientPhone = patientPhone; }

    public String getTokenNumber() { return tokenNumber; }
    public void setTokenNumber(String tokenNumber) { this.tokenNumber = tokenNumber; }

    public Integer getQueuePosition() { return queuePosition; }
    public void setQueuePosition(Integer queuePosition) { this.queuePosition = queuePosition; }

    public String getQueueStatus() { return queueStatus; }
    public void setQueueStatus(String queueStatus) { this.queueStatus = queueStatus; }

    public String getPriorityCategory() { return priorityCategory; }
    public void setPriorityCategory(String priorityCategory) { this.priorityCategory = priorityCategory; }

    public Integer getPriorityWeight() { return priorityWeight; }
    public void setPriorityWeight(Integer priorityWeight) { this.priorityWeight = priorityWeight; }

    public String getAppointmentTypeName() { return appointmentTypeName; }
    public void setAppointmentTypeName(String appointmentTypeName) { this.appointmentTypeName = appointmentTypeName; }

    public LocalDateTime getScheduledStartTime() { return scheduledStartTime; }
    public void setScheduledStartTime(LocalDateTime scheduledStartTime) { this.scheduledStartTime = scheduledStartTime; }

    public LocalDateTime getCheckedInAt() { return checkedInAt; }
    public void setCheckedInAt(LocalDateTime checkedInAt) { this.checkedInAt = checkedInAt; }

    public LocalDateTime getConsultationStartedAt() { return consultationStartedAt; }
    public void setConsultationStartedAt(LocalDateTime consultationStartedAt) { this.consultationStartedAt = consultationStartedAt; }

    public LocalDateTime getConsultationEndedAt() { return consultationEndedAt; }
    public void setConsultationEndedAt(LocalDateTime consultationEndedAt) { this.consultationEndedAt = consultationEndedAt; }

    public Integer getEstimatedWaitMinutes() { return estimatedWaitMinutes; }
    public void setEstimatedWaitMinutes(Integer estimatedWaitMinutes) { this.estimatedWaitMinutes = estimatedWaitMinutes; }

    public String getReasonForVisit() { return reasonForVisit; }
    public void setReasonForVisit(String reasonForVisit) { this.reasonForVisit = reasonForVisit; }
}
