package com.healthcare.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class AppointmentBookingRequest {

    private Long patientId;
    private Long doctorId;
    private Long departmentId;
    private Long appointmentTypeId = 1L;
    private LocalDateTime scheduledStartTime;

    private String appointmentDate;
    private String appointmentTime;
    private String type;
    private String priorityCategory;
    private String priority;
    private String reasonForVisit;
    private String notes;

    public AppointmentBookingRequest() {}

    public AppointmentBookingRequest(Long patientId, Long doctorId, Long departmentId, Long appointmentTypeId, LocalDateTime scheduledStartTime, String priorityCategory, String reasonForVisit) {
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.departmentId = departmentId;
        this.appointmentTypeId = appointmentTypeId != null ? appointmentTypeId : 1L;
        this.scheduledStartTime = scheduledStartTime;
        this.priorityCategory = priorityCategory;
        this.reasonForVisit = reasonForVisit;
    }

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public Long getAppointmentTypeId() {
        if (appointmentTypeId != null) {
            return appointmentTypeId;
        }
        return 1L;
    }
    public void setAppointmentTypeId(Long appointmentTypeId) { this.appointmentTypeId = appointmentTypeId; }

    public LocalDateTime getScheduledStartTime() {
        if (scheduledStartTime != null) {
            return scheduledStartTime;
        }
        if (appointmentDate != null && appointmentTime != null) {
            try {
                LocalDate date = LocalDate.parse(appointmentDate);
                String tStr = appointmentTime.trim();
                if (tStr.length() == 5) {
                    tStr += ":00";
                } else if (tStr.contains(" ")) {
                    tStr = tStr.split(" ")[0];
                    if (tStr.length() == 5) tStr += ":00";
                }
                LocalTime time = LocalTime.parse(tStr);
                return LocalDateTime.of(date, time);
            } catch (Exception ignored) {
            }
        }
        return LocalDateTime.now().plusDays(1).withHour(10).withMinute(0);
    }
    public void setScheduledStartTime(LocalDateTime scheduledStartTime) { this.scheduledStartTime = scheduledStartTime; }

    public String getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(String appointmentDate) { this.appointmentDate = appointmentDate; }

    public String getAppointmentTime() { return appointmentTime; }
    public void setAppointmentTime(String appointmentTime) { this.appointmentTime = appointmentTime; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getPriorityCategory() {
        if (priorityCategory != null) return priorityCategory;
        if (priority != null) return priority;
        return "SCHEDULED_STANDARD";
    }
    public void setPriorityCategory(String priorityCategory) { this.priorityCategory = priorityCategory; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) {
        this.priority = priority;
        if (this.priorityCategory == null) this.priorityCategory = priority;
    }

    public String getReasonForVisit() {
        if (reasonForVisit != null) return reasonForVisit;
        if (notes != null) return notes;
        return "Consultation booking";
    }
    public void setReasonForVisit(String reasonForVisit) { this.reasonForVisit = reasonForVisit; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) {
        this.notes = notes;
        if (this.reasonForVisit == null) this.reasonForVisit = notes;
    }
}
