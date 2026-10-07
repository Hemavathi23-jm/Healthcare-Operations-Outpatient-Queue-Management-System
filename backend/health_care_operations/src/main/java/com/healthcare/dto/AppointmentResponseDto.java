package com.healthcare.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AppointmentResponseDto {
    private Long id;
    private String appointmentNumber;
    
    // Patient Info
    private Long patientId;
    private String patientCode;
    private String patientName;
    private String patientPhone;
    private String patientGender;
    
    // Doctor Info
    private Long doctorId;
    private String doctorName;
    private String specialization;
    
    // Department Info
    private Long departmentId;
    private String departmentName;
    
    // Appointment Type Info
    private Long appointmentTypeId;
    private String appointmentTypeName;
    private Integer durationMinutes;
    private BigDecimal fee;
    
    private LocalDateTime scheduledStartTime;
    private LocalDateTime scheduledEndTime;
    private String status;
    private String priorityCategory;
    private String reasonForVisit;
    private String doctorNotes;
    
    private String tokenNumber;
    private String queueStatus;
    private Integer estimatedWaitMinutes;
    private LocalDateTime createdAt;

    public AppointmentResponseDto() {}

    public AppointmentResponseDto(Long id, String appointmentNumber, Long patientId, String patientCode, String patientName, String patientPhone, String patientGender, Long doctorId, String doctorName, String specialization, Long departmentId, String departmentName, Long appointmentTypeId, String appointmentTypeName, Integer durationMinutes, BigDecimal fee, LocalDateTime scheduledStartTime, LocalDateTime scheduledEndTime, String status, String priorityCategory, String reasonForVisit, String doctorNotes, String tokenNumber, String queueStatus, Integer estimatedWaitMinutes, LocalDateTime createdAt) {
        this.id = id;
        this.appointmentNumber = appointmentNumber;
        this.patientId = patientId;
        this.patientCode = patientCode;
        this.patientName = patientName;
        this.patientPhone = patientPhone;
        this.patientGender = patientGender;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.specialization = specialization;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.appointmentTypeId = appointmentTypeId;
        this.appointmentTypeName = appointmentTypeName;
        this.durationMinutes = durationMinutes;
        this.fee = fee;
        this.scheduledStartTime = scheduledStartTime;
        this.scheduledEndTime = scheduledEndTime;
        this.status = status;
        this.priorityCategory = priorityCategory;
        this.reasonForVisit = reasonForVisit;
        this.doctorNotes = doctorNotes;
        this.tokenNumber = tokenNumber;
        this.queueStatus = queueStatus;
        this.estimatedWaitMinutes = estimatedWaitMinutes;
        this.createdAt = createdAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String appointmentNumber;
        private Long patientId;
        private String patientCode;
        private String patientName;
        private String patientPhone;
        private String patientGender;
        private Long doctorId;
        private String doctorName;
        private String specialization;
        private Long departmentId;
        private String departmentName;
        private Long appointmentTypeId;
        private String appointmentTypeName;
        private Integer durationMinutes;
        private BigDecimal fee;
        private LocalDateTime scheduledStartTime;
        private LocalDateTime scheduledEndTime;
        private String status;
        private String priorityCategory;
        private String reasonForVisit;
        private String doctorNotes;
        private String tokenNumber;
        private String queueStatus;
        private Integer estimatedWaitMinutes;
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder appointmentNumber(String appointmentNumber) { this.appointmentNumber = appointmentNumber; return this; }
        public Builder patientId(Long patientId) { this.patientId = patientId; return this; }
        public Builder patientCode(String patientCode) { this.patientCode = patientCode; return this; }
        public Builder patientName(String patientName) { this.patientName = patientName; return this; }
        public Builder patientPhone(String patientPhone) { this.patientPhone = patientPhone; return this; }
        public Builder patientGender(String patientGender) { this.patientGender = patientGender; return this; }
        public Builder doctorId(Long doctorId) { this.doctorId = doctorId; return this; }
        public Builder doctorName(String doctorName) { this.doctorName = doctorName; return this; }
        public Builder specialization(String specialization) { this.specialization = specialization; return this; }
        public Builder departmentId(Long departmentId) { this.departmentId = departmentId; return this; }
        public Builder departmentName(String departmentName) { this.departmentName = departmentName; return this; }
        public Builder appointmentTypeId(Long appointmentTypeId) { this.appointmentTypeId = appointmentTypeId; return this; }
        public Builder appointmentTypeName(String appointmentTypeName) { this.appointmentTypeName = appointmentTypeName; return this; }
        public Builder durationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; return this; }
        public Builder fee(BigDecimal fee) { this.fee = fee; return this; }
        public Builder scheduledStartTime(LocalDateTime scheduledStartTime) { this.scheduledStartTime = scheduledStartTime; return this; }
        public Builder scheduledEndTime(LocalDateTime scheduledEndTime) { this.scheduledEndTime = scheduledEndTime; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder priorityCategory(String priorityCategory) { this.priorityCategory = priorityCategory; return this; }
        public Builder reasonForVisit(String reasonForVisit) { this.reasonForVisit = reasonForVisit; return this; }
        public Builder doctorNotes(String doctorNotes) { this.doctorNotes = doctorNotes; return this; }
        public Builder tokenNumber(String tokenNumber) { this.tokenNumber = tokenNumber; return this; }
        public Builder queueStatus(String queueStatus) { this.queueStatus = queueStatus; return this; }
        public Builder estimatedWaitMinutes(Integer estimatedWaitMinutes) { this.estimatedWaitMinutes = estimatedWaitMinutes; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public AppointmentResponseDto build() {
            return new AppointmentResponseDto(id, appointmentNumber, patientId, patientCode, patientName, patientPhone, patientGender, doctorId, doctorName, specialization, departmentId, departmentName, appointmentTypeId, appointmentTypeName, durationMinutes, fee, scheduledStartTime, scheduledEndTime, status, priorityCategory, reasonForVisit, doctorNotes, tokenNumber, queueStatus, estimatedWaitMinutes, createdAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAppointmentNumber() { return appointmentNumber; }
    public void setAppointmentNumber(String appointmentNumber) { this.appointmentNumber = appointmentNumber; }

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public String getPatientCode() { return patientCode; }
    public void setPatientCode(String patientCode) { this.patientCode = patientCode; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getPatientPhone() { return patientPhone; }
    public void setPatientPhone(String patientPhone) { this.patientPhone = patientPhone; }

    public String getPatientGender() { return patientGender; }
    public void setPatientGender(String patientGender) { this.patientGender = patientGender; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public Long getAppointmentTypeId() { return appointmentTypeId; }
    public void setAppointmentTypeId(Long appointmentTypeId) { this.appointmentTypeId = appointmentTypeId; }

    public String getAppointmentTypeName() { return appointmentTypeName; }
    public void setAppointmentTypeName(String appointmentTypeName) { this.appointmentTypeName = appointmentTypeName; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public BigDecimal getFee() { return fee; }
    public void setFee(BigDecimal fee) { this.fee = fee; }

    public LocalDateTime getScheduledStartTime() { return scheduledStartTime; }
    public void setScheduledStartTime(LocalDateTime scheduledStartTime) { this.scheduledStartTime = scheduledStartTime; }

    public LocalDateTime getScheduledEndTime() { return scheduledEndTime; }
    public void setScheduledEndTime(LocalDateTime scheduledEndTime) { this.scheduledEndTime = scheduledEndTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriorityCategory() { return priorityCategory; }
    public void setPriorityCategory(String priorityCategory) { this.priorityCategory = priorityCategory; }

    public String getReasonForVisit() { return reasonForVisit; }
    public void setReasonForVisit(String reasonForVisit) { this.reasonForVisit = reasonForVisit; }

    public String getDoctorNotes() { return doctorNotes; }
    public void setDoctorNotes(String doctorNotes) { this.doctorNotes = doctorNotes; }

    public String getTokenNumber() { return tokenNumber; }
    public void setTokenNumber(String tokenNumber) { this.tokenNumber = tokenNumber; }

    public String getQueueStatus() { return queueStatus; }
    public void setQueueStatus(String queueStatus) { this.queueStatus = queueStatus; }

    public Integer getEstimatedWaitMinutes() { return estimatedWaitMinutes; }
    public void setEstimatedWaitMinutes(Integer estimatedWaitMinutes) { this.estimatedWaitMinutes = estimatedWaitMinutes; }

    
    public String getAppointmentDate() {
        return scheduledStartTime != null ? scheduledStartTime.toLocalDate().toString() : "";
    }

    public String getAppointmentTime() {
        return scheduledStartTime != null ? scheduledStartTime.toLocalTime().toString().substring(0, 5) : "";
    }

    public String getType() {
        return appointmentTypeName != null ? appointmentTypeName : "CONSULTATION";
    }

    public String getPriority() {
        return priorityCategory != null ? priorityCategory : "NORMAL";
    }

    public String getNotes() {
        return reasonForVisit != null ? reasonForVisit : doctorNotes;
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
