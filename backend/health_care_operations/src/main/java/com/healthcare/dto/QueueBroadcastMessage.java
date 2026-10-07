package com.healthcare.dto;

import java.time.LocalDateTime;

public class QueueBroadcastMessage {
    private String eventType; // CHECK_IN, CALL_NEXT, COMPLETE, SKIP, RECALCULATE
    private Long doctorId;
    private Long queueEntryId;
    private String tokenNumber;
    private String queueStatus;
    private String patientName;
    private String message;
    private LocalDateTime timestamp;

    public QueueBroadcastMessage() {
        this.timestamp = LocalDateTime.now();
    }

    public QueueBroadcastMessage(String eventType, Long doctorId, Long queueEntryId, String tokenNumber, String queueStatus, String patientName, String message) {
        this.eventType = eventType;
        this.doctorId = doctorId;
        this.queueEntryId = queueEntryId;
        this.tokenNumber = tokenNumber;
        this.queueStatus = queueStatus;
        this.patientName = patientName;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public Long getQueueEntryId() {
        return queueEntryId;
    }

    public void setQueueEntryId(Long queueEntryId) {
        this.queueEntryId = queueEntryId;
    }

    public String getTokenNumber() {
        return tokenNumber;
    }

    public void setTokenNumber(String tokenNumber) {
        this.tokenNumber = tokenNumber;
    }

    public String getQueueStatus() {
        return queueStatus;
    }

    public void setQueueStatus(String queueStatus) {
        this.queueStatus = queueStatus;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
