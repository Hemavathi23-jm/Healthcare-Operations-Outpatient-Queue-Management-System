package com.healthcare.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "appointment_number", nullable = false, unique = true, length = 60)
    private String appointmentNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "appointment_type_id", nullable = false)
    private AppointmentType appointmentType;

    @Column(name = "scheduled_start_time", nullable = false)
    private LocalDateTime scheduledStartTime;

    @Column(name = "scheduled_end_time", nullable = false)
    private LocalDateTime scheduledEndTime;

    @Column(nullable = false, length = 30)
    private String status = "CONFIRMED";

    @Column(name = "priority_category", nullable = false, length = 50)
    private String priorityCategory = "SCHEDULED";

    @Column(name = "reason_for_visit", columnDefinition = "TEXT")
    private String reasonForVisit;

    @Column(name = "doctor_notes", columnDefinition = "TEXT")
    private String doctorNotes;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public Appointment() {}

    public Appointment(Long id, String appointmentNumber, Patient patient, Doctor doctor, Department department, AppointmentType appointmentType, LocalDateTime scheduledStartTime, LocalDateTime scheduledEndTime, String status, String priorityCategory, String reasonForVisit, String doctorNotes) {
        this.id = id;
        this.appointmentNumber = appointmentNumber;
        this.patient = patient;
        this.doctor = doctor;
        this.department = department;
        this.appointmentType = appointmentType;
        this.scheduledStartTime = scheduledStartTime;
        this.scheduledEndTime = scheduledEndTime;
        this.status = status != null ? status : "CONFIRMED";
        this.priorityCategory = priorityCategory != null ? priorityCategory : "SCHEDULED";
        this.reasonForVisit = reasonForVisit;
        this.doctorNotes = doctorNotes;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String appointmentNumber;
        private Patient patient;
        private Doctor doctor;
        private Department department;
        private AppointmentType appointmentType;
        private LocalDateTime scheduledStartTime;
        private LocalDateTime scheduledEndTime;
        private String status = "CONFIRMED";
        private String priorityCategory = "SCHEDULED";
        private String reasonForVisit;
        private String doctorNotes;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder appointmentNumber(String appointmentNumber) { this.appointmentNumber = appointmentNumber; return this; }
        public Builder patient(Patient patient) { this.patient = patient; return this; }
        public Builder doctor(Doctor doctor) { this.doctor = doctor; return this; }
        public Builder department(Department department) { this.department = department; return this; }
        public Builder appointmentType(AppointmentType appointmentType) { this.appointmentType = appointmentType; return this; }
        public Builder scheduledStartTime(LocalDateTime scheduledStartTime) { this.scheduledStartTime = scheduledStartTime; return this; }
        public Builder scheduledEndTime(LocalDateTime scheduledEndTime) { this.scheduledEndTime = scheduledEndTime; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder priorityCategory(String priorityCategory) { this.priorityCategory = priorityCategory; return this; }
        public Builder reasonForVisit(String reasonForVisit) { this.reasonForVisit = reasonForVisit; return this; }
        public Builder doctorNotes(String doctorNotes) { this.doctorNotes = doctorNotes; return this; }

        public Appointment build() {
            return new Appointment(id, appointmentNumber, patient, doctor, department, appointmentType, scheduledStartTime, scheduledEndTime, status, priorityCategory, reasonForVisit, doctorNotes);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAppointmentNumber() { return appointmentNumber; }
    public void setAppointmentNumber(String appointmentNumber) { this.appointmentNumber = appointmentNumber; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    public AppointmentType getAppointmentType() { return appointmentType; }
    public void setAppointmentType(AppointmentType appointmentType) { this.appointmentType = appointmentType; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
