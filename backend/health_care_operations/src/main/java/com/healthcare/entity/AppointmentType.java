package com.healthcare.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "appointment_types")
public class AppointmentType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "type_name", nullable = false, unique = true, length = 100)
    private String typeName;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes = 30;

    @Column(name = "default_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal defaultFee = BigDecimal.valueOf(50.00);

    public AppointmentType() {}

    public AppointmentType(Long id, String typeName, Integer durationMinutes, BigDecimal defaultFee) {
        this.id = id;
        this.typeName = typeName;
        this.durationMinutes = durationMinutes != null ? durationMinutes : 30;
        this.defaultFee = defaultFee != null ? defaultFee : BigDecimal.valueOf(50.00);
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String typeName;
        private Integer durationMinutes = 30;
        private BigDecimal defaultFee = BigDecimal.valueOf(50.00);

        public Builder id(Long id) { this.id = id; return this; }
        public Builder typeName(String typeName) { this.typeName = typeName; return this; }
        public Builder durationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; return this; }
        public Builder defaultFee(BigDecimal defaultFee) { this.defaultFee = defaultFee; return this; }

        public AppointmentType build() {
            return new AppointmentType(id, typeName, durationMinutes, defaultFee);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTypeName() { return typeName; }
    public void setTypeName(String typeName) { this.typeName = typeName; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public BigDecimal getDefaultFee() { return defaultFee; }
    public void setDefaultFee(BigDecimal defaultFee) { this.defaultFee = defaultFee; }
}
