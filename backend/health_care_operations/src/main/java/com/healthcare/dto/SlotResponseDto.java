package com.healthcare.dto;

import java.time.LocalTime;

public class SlotResponseDto {
    private LocalTime startTime;
    private LocalTime endTime;
    private String formattedTime;
    private boolean available;
    private String reasonIfNotAvailable;

    public SlotResponseDto() {}

    public SlotResponseDto(LocalTime startTime, LocalTime endTime, String formattedTime, boolean available, String reasonIfNotAvailable) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.formattedTime = formattedTime;
        this.available = available;
        this.reasonIfNotAvailable = reasonIfNotAvailable;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private LocalTime startTime;
        private LocalTime endTime;
        private String formattedTime;
        private boolean available;
        private String reasonIfNotAvailable;

        public Builder startTime(LocalTime startTime) { this.startTime = startTime; return this; }
        public Builder endTime(LocalTime endTime) { this.endTime = endTime; return this; }
        public Builder formattedTime(String formattedTime) { this.formattedTime = formattedTime; return this; }
        public Builder available(boolean available) { this.available = available; return this; }
        public Builder reasonIfNotAvailable(String reasonIfNotAvailable) { this.reasonIfNotAvailable = reasonIfNotAvailable; return this; }

        public SlotResponseDto build() {
            return new SlotResponseDto(startTime, endTime, formattedTime, available, reasonIfNotAvailable);
        }
    }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public String getFormattedTime() { return formattedTime; }
    public void setFormattedTime(String formattedTime) { this.formattedTime = formattedTime; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    public String getReasonIfNotAvailable() { return reasonIfNotAvailable; }
    public void setReasonIfNotAvailable(String reasonIfNotAvailable) { this.reasonIfNotAvailable = reasonIfNotAvailable; }
}
