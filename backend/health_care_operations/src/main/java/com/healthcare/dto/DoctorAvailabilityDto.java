package com.healthcare.dto;

import java.time.LocalTime;

public class DoctorAvailabilityDto {
    private Long id;
    private Long doctorId;
    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalTime breakStartTime;
    private LocalTime breakEndTime;
    private Integer maxCapacityPerDay;

    public DoctorAvailabilityDto() {}

    public DoctorAvailabilityDto(Long id, Long doctorId, String dayOfWeek, LocalTime startTime, LocalTime endTime, LocalTime breakStartTime, LocalTime breakEndTime, Integer maxCapacityPerDay) {
        this.id = id;
        this.doctorId = doctorId;
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
        this.breakStartTime = breakStartTime;
        this.breakEndTime = breakEndTime;
        this.maxCapacityPerDay = maxCapacityPerDay;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Long doctorId;
        private String dayOfWeek;
        private LocalTime startTime;
        private LocalTime endTime;
        private LocalTime breakStartTime;
        private LocalTime breakEndTime;
        private Integer maxCapacityPerDay;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder doctorId(Long doctorId) { this.doctorId = doctorId; return this; }
        public Builder dayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; return this; }
        public Builder startTime(LocalTime startTime) { this.startTime = startTime; return this; }
        public Builder endTime(LocalTime endTime) { this.endTime = endTime; return this; }
        public Builder breakStartTime(LocalTime breakStartTime) { this.breakStartTime = breakStartTime; return this; }
        public Builder breakEndTime(LocalTime breakEndTime) { this.breakEndTime = breakEndTime; return this; }
        public Builder maxCapacityPerDay(Integer maxCapacityPerDay) { this.maxCapacityPerDay = maxCapacityPerDay; return this; }

        public DoctorAvailabilityDto build() { return new DoctorAvailabilityDto(id, doctorId, dayOfWeek, startTime, endTime, breakStartTime, breakEndTime, maxCapacityPerDay); }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public LocalTime getBreakStartTime() { return breakStartTime; }
    public void setBreakStartTime(LocalTime breakStartTime) { this.breakStartTime = breakStartTime; }
    public LocalTime getBreakEndTime() { return breakEndTime; }
    public void setBreakEndTime(LocalTime breakEndTime) { this.breakEndTime = breakEndTime; }
    public Integer getMaxCapacityPerDay() { return maxCapacityPerDay; }
    public void setMaxCapacityPerDay(Integer maxCapacityPerDay) { this.maxCapacityPerDay = maxCapacityPerDay; }
}
