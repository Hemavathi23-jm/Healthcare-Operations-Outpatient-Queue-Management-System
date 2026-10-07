package com.healthcare.entity;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "doctor_availability")
public class DoctorAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "day_of_week", nullable = false, length = 15)
    private String dayOfWeek;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "break_start_time")
    private LocalTime breakStartTime;

    @Column(name = "break_end_time")
    private LocalTime breakEndTime;

    @Column(name = "max_capacity_per_day", nullable = false)
    private Integer maxCapacityPerDay = 20;

    public DoctorAvailability() {}

    public DoctorAvailability(Long id, Doctor doctor, String dayOfWeek, LocalTime startTime, LocalTime endTime, LocalTime breakStartTime, LocalTime breakEndTime, Integer maxCapacityPerDay) {
        this.id = id;
        this.doctor = doctor;
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
        this.breakStartTime = breakStartTime;
        this.breakEndTime = breakEndTime;
        this.maxCapacityPerDay = maxCapacityPerDay != null ? maxCapacityPerDay : 20;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Doctor doctor;
        private String dayOfWeek;
        private LocalTime startTime;
        private LocalTime endTime;
        private LocalTime breakStartTime;
        private LocalTime breakEndTime;
        private Integer maxCapacityPerDay = 20;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder doctor(Doctor doctor) { this.doctor = doctor; return this; }
        public Builder dayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; return this; }
        public Builder startTime(LocalTime startTime) { this.startTime = startTime; return this; }
        public Builder endTime(LocalTime endTime) { this.endTime = endTime; return this; }
        public Builder breakStartTime(LocalTime breakStartTime) { this.breakStartTime = breakStartTime; return this; }
        public Builder breakEndTime(LocalTime breakEndTime) { this.breakEndTime = breakEndTime; return this; }
        public Builder maxCapacityPerDay(Integer maxCapacityPerDay) { this.maxCapacityPerDay = maxCapacityPerDay; return this; }

        public DoctorAvailability build() {
            return new DoctorAvailability(id, doctor, dayOfWeek, startTime, endTime, breakStartTime, breakEndTime, maxCapacityPerDay);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }

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
