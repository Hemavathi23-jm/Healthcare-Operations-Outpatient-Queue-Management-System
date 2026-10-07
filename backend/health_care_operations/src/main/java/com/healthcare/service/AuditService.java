package com.healthcare.service;

import com.healthcare.entity.AuditLog;
import com.healthcare.entity.User;
import com.healthcare.repository.AuditLogRepository;
import com.healthcare.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditService(AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    public void logAction(String actionType, String entityName, Long entityId, String detailsJson) {
        User currentUser = null;
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && !authentication.getName().equals("anonymousUser")) {
                currentUser = userRepository.findByUsername(authentication.getName()).orElse(null);
            }
        } catch (Exception ignored) {
        }

        AuditLog log = AuditLog.builder()
                .user(currentUser)
                .actionType(actionType)
                .entityName(entityName)
                .entityId(entityId)
                .detailsJson(detailsJson)
                .timestamp(LocalDateTime.now())
                .build();

        auditLogRepository.save(log);
    }
}
