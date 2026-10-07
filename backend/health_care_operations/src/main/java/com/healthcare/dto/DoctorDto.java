package com.healthcare.dto;

import java.math.BigDecimal;
import java.util.List;

public class DoctorDto {
    private Long id;
    private Long userId;
    private String fullName;
    private String name;
    private String email;
    private String phone;
    private Long departmentId;
    private String departmentName;
    private String specialization;
    private BigDecimal consultationFee = BigDecimal.valueOf(50.00);
    private String status = "ACTIVE";
    private String roomNumber = "OPD-101";
    private Integer slotDurationMinutes = 30;
    private Integer maxPatientsPerDay = 25;
    private Integer experienceYears = 8;
    private Double rating = 4.8;
    private List<DoctorAvailabilityDto> availabilities;

    public DoctorDto() {}

    public DoctorDto(Long id, Long userId, String fullName, String email, String phone, Long departmentId, String departmentName, String specialization, BigDecimal consultationFee, String status, List<DoctorAvailabilityDto> availabilities) {
        this.id = id;
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.specialization = specialization;
        this.consultationFee = consultationFee != null ? consultationFee : BigDecimal.valueOf(50.00);
        this.status = status != null ? status : "ACTIVE";
        this.availabilities = availabilities;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Long userId;
        private String fullName;
        private String email;
        private String phone;
        private Long departmentId;
        private String departmentName;
        private String specialization;
        private BigDecimal consultationFee = BigDecimal.valueOf(50.00);
        private String status = "ACTIVE";
        private String roomNumber = "OPD-101";
        private Integer slotDurationMinutes = 30;
        private Integer maxPatientsPerDay = 25;
        private Integer experienceYears = 8;
        private Double rating = 4.8;
        private List<DoctorAvailabilityDto> availabilities;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder userId(Long userId) { this.userId = userId; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder phone(String phone) { this.phone = phone; return this; }
        public Builder departmentId(Long departmentId) { this.departmentId = departmentId; return this; }
        public Builder departmentName(String departmentName) { this.departmentName = departmentName; return this; }
        public Builder specialization(String specialization) { this.specialization = specialization; return this; }
        public Builder consultationFee(BigDecimal consultationFee) { this.consultationFee = consultationFee; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder roomNumber(String roomNumber) { this.roomNumber = roomNumber; return this; }
        public Builder slotDurationMinutes(Integer slotDurationMinutes) { this.slotDurationMinutes = slotDurationMinutes; return this; }
        public Builder maxPatientsPerDay(Integer maxPatientsPerDay) { this.maxPatientsPerDay = maxPatientsPerDay; return this; }
        public Builder experienceYears(Integer experienceYears) { this.experienceYears = experienceYears; return this; }
        public Builder rating(Double rating) { this.rating = rating; return this; }
        public Builder availabilities(List<DoctorAvailabilityDto> availabilities) { this.availabilities = availabilities; return this; }

        public DoctorDto build() {
            DoctorDto d = new DoctorDto(id, userId, fullName, email, phone, departmentId, departmentName, specialization, consultationFee, status, availabilities);
            if (roomNumber != null) d.setRoomNumber(roomNumber);
            if (slotDurationMinutes != null) d.setSlotDurationMinutes(slotDurationMinutes);
            if (maxPatientsPerDay != null) d.setMaxPatientsPerDay(maxPatientsPerDay);
            if (experienceYears != null) d.setExperienceYears(experienceYears);
            if (rating != null) d.setRating(rating);
            return d;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getName() { return fullName; }
    public void setName(String name) { this.fullName = name; }
    public String getFullName() { return fullName != null ? fullName : (name != null ? name : "Doctor"); }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public BigDecimal getConsultationFee() { return consultationFee; }
    public void setConsultationFee(BigDecimal consultationFee) { this.consultationFee = consultationFee; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRoomNumber() { return roomNumber != null ? roomNumber : "OPD-101"; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public Integer getSlotDurationMinutes() { return slotDurationMinutes != null ? slotDurationMinutes : 30; }
    public void setSlotDurationMinutes(Integer slotDurationMinutes) { this.slotDurationMinutes = slotDurationMinutes; }
    public Integer getMaxPatientsPerDay() { return maxPatientsPerDay != null ? maxPatientsPerDay : 25; }
    public void setMaxPatientsPerDay(Integer maxPatientsPerDay) { this.maxPatientsPerDay = maxPatientsPerDay; }
    public Integer getExperienceYears() { return experienceYears != null ? experienceYears : 8; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }
    public Double getRating() { return rating != null ? rating : 4.8; }
    public void setRating(Double rating) { this.rating = rating; }
    public List<DoctorAvailabilityDto> getAvailabilities() { return availabilities; }
    public void setAvailabilities(List<DoctorAvailabilityDto> availabilities) { this.availabilities = availabilities; }
}
