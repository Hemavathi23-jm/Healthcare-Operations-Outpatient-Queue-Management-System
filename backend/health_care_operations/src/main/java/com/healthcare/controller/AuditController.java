package com.healthcare.controller;

import com.healthcare.dto.ApiResponse;
import com.healthcare.dto.AuditLogResponseDto;
import com.healthcare.entity.AuditLog;
import com.healthcare.repository.AuditLogRepository;
import com.healthcare.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*")
public class AuditController {

    private final AuditLogRepository auditLogRepository;
    private final AuditService auditService;

    public AuditController(AuditLogRepository auditLogRepository, AuditService auditService) {
        this.auditLogRepository = auditLogRepository;
        this.auditService = auditService;
    }

    // Supports both /audit and /audit-logs paths (frontend uses /audit-logs)
    @GetMapping({"/audit", "/audit-logs"})
    public ResponseEntity<ApiResponse<List<AuditLogResponseDto>>> getRecentAuditLogs() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        boolean isAuthorized = auth.getAuthorities().stream().anyMatch(a -> 
            a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_MANAGER") ||
            a.getAuthority().equals("ADMIN") || a.getAuthority().equals("MANAGER")
        );
        if (!isAuthorized) {
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied: Audit logs are restricted to Administrators and Managers"));
        }

        List<AuditLog> logs = auditLogRepository.findTop100ByOrderByTimestampDesc();
        List<AuditLogResponseDto> dtos = logs.stream().map(this::mapToDto).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos, "Recent audit logs retrieved"));
    }

    @GetMapping({"/audit/entity/{name}/{id}", "/audit-logs/entity/{name}/{id}"})
    public ResponseEntity<ApiResponse<List<AuditLogResponseDto>>> getLogsByEntity(
            @PathVariable String name,
            @PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        boolean isAuthorized = auth.getAuthorities().stream().anyMatch(a -> 
            a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_MANAGER") ||
            a.getAuthority().equals("ADMIN") || a.getAuthority().equals("MANAGER")
        );
        if (!isAuthorized) {
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
        }

        List<AuditLog> logs = auditLogRepository.findByEntityNameAndEntityIdOrderByTimestampDesc(name, id);
        List<AuditLogResponseDto> dtos = logs.stream().map(this::mapToDto).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos, "Entity audit logs retrieved"));
    }

    @PostMapping({"/audit", "/audit-logs"})
    public ResponseEntity<ApiResponse<Void>> logAction(@RequestBody Map<String, Object> payload) {
        String actionType = (String) payload.getOrDefault("action", payload.getOrDefault("actionType", "USER_ACTION"));
        String entityName = (String) payload.getOrDefault("entityName", "System");
        Long entityId = payload.get("entityId") != null ? Long.valueOf(payload.get("entityId").toString()) : null;
        String details = (String) payload.getOrDefault("details", payload.getOrDefault("detailsJson", ""));

        auditService.logAction(actionType, entityName, entityId, details);
        return ResponseEntity.ok(ApiResponse.success(null, "Audit log recorded"));
    }

    private AuditLogResponseDto mapToDto(AuditLog log) {
        Long userId = null;
        String username = "System";
        String fullName = "System Operations";

        try {
            if (log.getUser() != null) {
                userId = log.getUser().getId();
                username = log.getUser().getUsername();
                fullName = log.getUser().getFullName();
            }
        } catch (Exception ignored) {
        }

        return AuditLogResponseDto.builder()
                .id(log.getId())
                .userId(userId)
                .username(username)
                .fullName(fullName)
                .actionType(log.getActionType())
                .entityName(log.getEntityName())
                .entityId(log.getEntityId())
                .detailsJson(log.getDetailsJson())
                .ipAddress(log.getIpAddress())
                .timestamp(log.getTimestamp())
                .build();
    }
}
