package com.healthcare.dto;

import java.time.LocalTime;

public class DepartmentDto {
    private Long id;
    private String name;
    private String description;
    private LocalTime operatingHoursStart;
    private LocalTime operatingHoursEnd;
    private Boolean isActive;

    public DepartmentDto() {}

    public DepartmentDto(Long id, String name, String description, LocalTime operatingHoursStart, LocalTime operatingHoursEnd, Boolean isActive) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.operatingHoursStart = operatingHoursStart;
        this.operatingHoursEnd = operatingHoursEnd;
        this.isActive = isActive;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String name;
        private String description;
        private LocalTime operatingHoursStart;
        private LocalTime operatingHoursEnd;
        private Boolean isActive;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder operatingHoursStart(LocalTime operatingHoursStart) { this.operatingHoursStart = operatingHoursStart; return this; }
        public Builder operatingHoursEnd(LocalTime operatingHoursEnd) { this.operatingHoursEnd = operatingHoursEnd; return this; }
        public Builder isActive(Boolean isActive) { this.isActive = isActive; return this; }

        public DepartmentDto build() { return new DepartmentDto(id, name, description, operatingHoursStart, operatingHoursEnd, isActive); }
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
