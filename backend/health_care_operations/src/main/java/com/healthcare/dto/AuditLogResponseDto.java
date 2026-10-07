package com.healthcare.dto;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

public class AuditLogResponseDto {
    private Long id;
    private Long userId;
    private String username;
    private String fullName;
    private String actionType;
    private String action;
    private String entityName;
    private String entity;
    private Long entityId;
    private String detailsJson;
    private String details;
    private String ipAddress;
    private LocalDateTime timestamp;
    private Map<String, String> user;

    public AuditLogResponseDto() {}

    public AuditLogResponseDto(Long id, Long userId, String username, String fullName, String actionType, String entityName, Long entityId, String detailsJson, String ipAddress, LocalDateTime timestamp) {
        this.id = id;
        this.userId = userId;
        this.username = username != null ? username : "System";
        this.fullName = fullName != null ? fullName : (username != null ? username : "System Operations");
        this.actionType = actionType != null ? actionType : "EVENT";
        this.action = this.actionType;
        this.entityName = entityName != null ? entityName : "General";
        this.entity = this.entityName;
        this.entityId = entityId;
        this.detailsJson = detailsJson != null ? detailsJson : "";
        this.details = this.detailsJson;
        this.ipAddress = ipAddress;
        this.timestamp = timestamp != null ? timestamp : LocalDateTime.now();

        this.user = new HashMap<>();
        this.user.put("username", this.username);
        this.user.put("fullName", this.fullName);
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Long userId;
        private String username;
        private String fullName;
        private String actionType;
        private String entityName;
        private Long entityId;
        private String detailsJson;
        private String ipAddress;
        private LocalDateTime timestamp;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder userId(Long userId) { this.userId = userId; return this; }
        public Builder username(String username) { this.username = username; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }
        public Builder actionType(String actionType) { this.actionType = actionType; return this; }
        public Builder entityName(String entityName) { this.entityName = entityName; return this; }
        public Builder entityId(Long entityId) { this.entityId = entityId; return this; }
        public Builder detailsJson(String detailsJson) { this.detailsJson = detailsJson; return this; }
        public Builder ipAddress(String ipAddress) { this.ipAddress = ipAddress; return this; }
        public Builder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }

        public AuditLogResponseDto build() {
            return new AuditLogResponseDto(id, userId, username, fullName, actionType, entityName, entityId, detailsJson, ipAddress, timestamp);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) {
        this.actionType = actionType;
        this.action = actionType;
    }

    public String getAction() { return action; }
    public void setAction(String action) {
        this.action = action;
        this.actionType = action;
    }

    public String getEntityName() { return entityName; }
    public void setEntityName(String entityName) {
        this.entityName = entityName;
        this.entity = entityName;
    }

    public String getEntity() { return entity; }
    public void setEntity(String entity) {
        this.entity = entity;
        this.entityName = entity;
    }

    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }

    public String getDetailsJson() { return detailsJson; }
    public void setDetailsJson(String detailsJson) {
        this.detailsJson = detailsJson;
        this.details = detailsJson;
    }

    public String getDetails() { return details; }
    public void setDetails(String details) {
        this.details = details;
        this.detailsJson = details;
    }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public Map<String, String> getUser() { return user; }
    public void setUser(Map<String, String> user) { this.user = user; }
}
