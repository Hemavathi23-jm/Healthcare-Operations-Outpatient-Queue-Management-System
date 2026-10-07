package com.healthcare.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(nullable = false, length = 150)
    private String specialization;

    @Column(name = "consultation_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal consultationFee = BigDecimal.valueOf(50.00);

    @Column(nullable = false, length = 30)
    private String status = "ACTIVE"; // ACTIVE, ON_LEAVE, INACTIVE

    public Doctor() {}

    public Doctor(Long id, User user, Department department, String specialization, BigDecimal consultationFee, String status) {
        this.id = id;
        this.user = user;
        this.department = department;
        this.specialization = specialization;
        this.consultationFee = consultationFee != null ? consultationFee : BigDecimal.valueOf(50.00);
        this.status = status != null ? status : "ACTIVE";
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private User user;
        private Department department;
        private String specialization;
        private BigDecimal consultationFee = BigDecimal.valueOf(50.00);
        private String status = "ACTIVE";

        public Builder id(Long id) { this.id = id; return this; }
        public Builder user(User user) { this.user = user; return this; }
        public Builder department(Department department) { this.department = department; return this; }
        public Builder specialization(String specialization) { this.specialization = specialization; return this; }
        public Builder consultationFee(BigDecimal consultationFee) { this.consultationFee = consultationFee; return this; }
        public Builder status(String status) { this.status = status; return this; }

        public Doctor build() {
            return new Doctor(id, user, department, specialization, consultationFee, status);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public BigDecimal getConsultationFee() { return consultationFee; }
    public void setConsultationFee(BigDecimal consultationFee) { this.consultationFee = consultationFee; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
