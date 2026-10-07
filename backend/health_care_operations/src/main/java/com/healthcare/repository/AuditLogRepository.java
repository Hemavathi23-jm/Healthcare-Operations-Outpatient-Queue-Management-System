package com.healthcare.repository;

import com.healthcare.entity.AuditLog;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @EntityGraph(attributePaths = {"user"})
    List<AuditLog> findTop100ByOrderByTimestampDesc();

    @EntityGraph(attributePaths = {"user"})
    List<AuditLog> findByEntityNameAndEntityIdOrderByTimestampDesc(String entityName, Long entityId);

    @EntityGraph(attributePaths = {"user"})
    List<AuditLog> findByUserIdOrderByTimestampDesc(Long userId);
}
