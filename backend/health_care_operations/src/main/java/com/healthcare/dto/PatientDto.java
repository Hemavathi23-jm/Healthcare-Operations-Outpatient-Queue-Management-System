package com.healthcare.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;

public class PatientDto {
    private Long id;
    private String patientCode;
    private String firstName;
    private String lastName;
    private String name;
    private String gender = "MALE";
    private LocalDate dateOfBirth;
    private Integer age;
    private String phone;
    private String email;
    private String bloodGroup = "O+";
    private String address = "";
    private String allergies = "None";
    private String emergencyContact = "";
    private LocalDateTime createdAt;

    public PatientDto() {}

    public PatientDto(Long id, String patientCode, String firstName, String lastName, String gender, LocalDate dateOfBirth, String phone, String email, String bloodGroup, String address, String emergencyContact, LocalDateTime createdAt) {
        this.id = id;
        this.patientCode = patientCode;
        this.firstName = firstName;
        this.lastName = lastName;
        this.gender = gender;
        this.dateOfBirth = dateOfBirth;
        this.phone = phone;
        this.email = email;
        this.bloodGroup = bloodGroup;
        this.address = address;
        this.emergencyContact = emergencyContact;
        this.createdAt = createdAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String patientCode;
        private String firstName;
        private String lastName;
        private String gender = "MALE";
        private LocalDate dateOfBirth;
        private String phone;
        private String email;
        private String bloodGroup = "O+";
        private String address = "";
        private String emergencyContact = "";
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder patientCode(String patientCode) { this.patientCode = patientCode; return this; }
        public Builder firstName(String firstName) { this.firstName = firstName; return this; }
        public Builder lastName(String lastName) { this.lastName = lastName; return this; }
        public Builder gender(String gender) { this.gender = gender; return this; }
        public Builder dateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; return this; }
        public Builder phone(String phone) { this.phone = phone; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder bloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; return this; }
        public Builder address(String address) { this.address = address; return this; }
        public Builder emergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public PatientDto build() { return new PatientDto(id, patientCode, firstName, lastName, gender, dateOfBirth, phone, email, bloodGroup, address, emergencyContact, createdAt); }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPatientCode() { return patientCode; }
    public void setPatientCode(String patientCode) { this.patientCode = patientCode; }
    public String getPatientNumber() { return patientCode; }
    public void setPatientNumber(String patientNumber) { this.patientCode = patientNumber; }

    public String getFirstName() {
        if (firstName != null && !firstName.isBlank()) return firstName;
        if (name != null && !name.isBlank()) {
            return name.trim().split("\\s+")[0];
        }
        return "Patient";
    }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() {
        if (lastName != null && !lastName.isBlank()) return lastName;
        if (name != null && !name.isBlank()) {
            String[] parts = name.trim().split("\\s+", 2);
            return parts.length > 1 ? parts[1] : ".";
        }
        return ".";
    }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getName() {
        if (name != null && !name.isBlank()) return name;
        return (getFirstName() + " " + (getLastName().equals(".") ? "" : getLastName())).trim();
    }
    public void setName(String name) {
        this.name = name;
        if (name != null && !name.isBlank()) {
            String[] parts = name.trim().split("\\s+", 2);
            this.firstName = parts[0];
            this.lastName = parts.length > 1 ? parts[1] : ".";
        }
    }

    public String getGender() { return gender != null ? gender : "MALE"; }
    public void setGender(String gender) { this.gender = gender; }

    public LocalDate getDateOfBirth() {
        if (dateOfBirth != null) return dateOfBirth;
        if (age != null && age > 0) {
            return LocalDate.now().minusYears(age);
        }
        return LocalDate.now().minusYears(30);
    }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public Integer getAge() {
        if (age != null) return age;
        if (dateOfBirth != null) {
            return Period.between(dateOfBirth, LocalDate.now()).getYears();
        }
        return 30;
    }
    public void setAge(Integer age) {
        this.age = age;
        if (age != null && age > 0 && this.dateOfBirth == null) {
            this.dateOfBirth = LocalDate.now().minusYears(age);
        }
    }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getBloodGroup() { return bloodGroup != null ? bloodGroup : "O+"; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }
    public String getAddress() { return address != null ? address : ""; }
    public void setAddress(String address) { this.address = address; }
    public String getAllergies() { return allergies != null ? allergies : "None"; }
    public void setAllergies(String allergies) { this.allergies = allergies; }
    public String getEmergencyContact() { return emergencyContact != null ? emergencyContact : ""; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
