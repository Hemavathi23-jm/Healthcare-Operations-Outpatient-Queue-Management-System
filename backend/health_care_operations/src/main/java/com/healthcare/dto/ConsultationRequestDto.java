package com.healthcare.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class ConsultationRequestDto {
    private Long appointmentId;
    private String bloodPressure;
    private Integer pulseRate;
    private Double temperature;
    private Integer spo2;
    private Double weightKg;
    private String chiefComplaints;
    private String diagnosis;
    private String clinicalNotes;
    private String labInvestigations;
    private LocalDate followUpDate;
    private List<PrescriptionItemDto> prescriptionItems = new ArrayList<>();

    public ConsultationRequestDto() {}

    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public String getBloodPressure() {
        return bloodPressure;
    }

    public void setBloodPressure(String bloodPressure) {
        this.bloodPressure = bloodPressure;
    }

    public Integer getPulseRate() {
        return pulseRate;
    }

    public void setPulseRate(Integer pulseRate) {
        this.pulseRate = pulseRate;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Integer getSpo2() {
        return spo2;
    }

    public void setSpo2(Integer spo2) {
        this.spo2 = spo2;
    }

    public Double getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(Double weightKg) {
        this.weightKg = weightKg;
    }

    public String getChiefComplaints() {
        return chiefComplaints;
    }

    public void setChiefComplaints(String chiefComplaints) {
        this.chiefComplaints = chiefComplaints;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getClinicalNotes() {
        return clinicalNotes;
    }

    public void setClinicalNotes(String clinicalNotes) {
        this.clinicalNotes = clinicalNotes;
    }

    public String getLabInvestigations() {
        return labInvestigations;
    }

    public void setLabInvestigations(String labInvestigations) {
        this.labInvestigations = labInvestigations;
    }

    public LocalDate getFollowUpDate() {
        return followUpDate;
    }

    public void setFollowUpDate(LocalDate followUpDate) {
        this.followUpDate = followUpDate;
    }

    public List<PrescriptionItemDto> getPrescriptionItems() {
        return prescriptionItems;
    }

    public void setPrescriptionItems(List<PrescriptionItemDto> prescriptionItems) {
        this.prescriptionItems = prescriptionItems;
    }
}
