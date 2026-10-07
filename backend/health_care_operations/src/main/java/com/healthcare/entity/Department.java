package com.healthcare.entity;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "departments")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "operating_hours_start", nullable = false)
    private LocalTime operatingHoursStart = LocalTime.of(8, 0);

    @Column(name = "operating_hours_end", nullable = false)
    private LocalTime operatingHoursEnd = LocalTime.of(20, 0);

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    public Department() {}

    public Department(Long id, String name, String description, LocalTime operatingHoursStart, LocalTime operatingHoursEnd, Boolean isActive) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.operatingHoursStart = operatingHoursStart != null ? operatingHoursStart : LocalTime.of(8, 0);
        this.operatingHoursEnd = operatingHoursEnd != null ? operatingHoursEnd : LocalTime.of(20, 0);
        this.isActive = isActive != null ? isActive : true;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String name;
        private String description;
        private LocalTime operatingHoursStart = LocalTime.of(8, 0);
        private LocalTime operatingHoursEnd = LocalTime.of(20, 0);
        private Boolean isActive = true;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder operatingHoursStart(LocalTime operatingHoursStart) { this.operatingHoursStart = operatingHoursStart; return this; }
        public Builder operatingHoursEnd(LocalTime operatingHoursEnd) { this.operatingHoursEnd = operatingHoursEnd; return this; }
        public Builder isActive(Boolean isActive) { this.isActive = isActive; return this; }

        public Department build() {
            return new Department(id, name, description, operatingHoursStart, operatingHoursEnd, isActive);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalTime getOperatingHoursStart() { return operatingHoursStart; }
    public void setOperatingHoursStart(LocalTime operatingHoursStart) { this.operatingHoursStart = operatingHoursStart; }

    public LocalTime getOperatingHoursEnd() { return operatingHoursEnd; }
    public void setOperatingHoursEnd(LocalTime operatingHoursEnd) { this.operatingHoursEnd = operatingHoursEnd; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
