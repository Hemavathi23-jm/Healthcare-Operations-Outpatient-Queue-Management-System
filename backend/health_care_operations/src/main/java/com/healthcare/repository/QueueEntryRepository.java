package com.healthcare.repository;

import com.healthcare.entity.QueueEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface QueueEntryRepository extends JpaRepository<QueueEntry, Long> {

    Optional<QueueEntry> findByAppointmentId(Long appointmentId);

    Optional<QueueEntry> findByTokenNumber(String tokenNumber);

    @Query("SELECT q FROM QueueEntry q " +
           "LEFT JOIN q.priorityRule pr " +
           "WHERE q.queueStatus IN ('WAITING', 'IN_CONSULTATION') " +
           "ORDER BY " +
           "CASE WHEN q.queueStatus = 'IN_CONSULTATION' THEN 0 ELSE 1 END ASC, " +
           "COALESCE(pr.priorityWeight, 0) DESC, " +
           "q.checkedInAt ASC, " +
           "q.id ASC")
    List<QueueEntry> findAllActiveQueues();

    @Query("SELECT q FROM QueueEntry q " +
           "LEFT JOIN q.priorityRule pr " +
           "WHERE q.doctor.id = :doctorId " +
           "AND q.queueStatus IN ('WAITING', 'IN_CONSULTATION') " +
           "ORDER BY " +
           "CASE WHEN q.queueStatus = 'IN_CONSULTATION' THEN 0 ELSE 1 END ASC, " +
           "COALESCE(pr.priorityWeight, 0) DESC, " +
           "q.checkedInAt ASC, " +
           "q.id ASC")
    List<QueueEntry> findActiveQueueForDoctor(@Param("doctorId") Long doctorId);

    @Query("SELECT q FROM QueueEntry q " +
           "LEFT JOIN q.priorityRule pr " +
           "WHERE q.queueStatus = 'WAITING' " +
           "AND q.doctor.id = :doctorId " +
           "ORDER BY COALESCE(pr.priorityWeight, 0) DESC, q.checkedInAt ASC")
    List<QueueEntry> findWaitingQueueForDoctor(@Param("doctorId") Long doctorId);

    @Query("SELECT COUNT(q) FROM QueueEntry q WHERE q.doctor.id = :doctorId AND q.checkedInAt >= :startOfDay")
    long countTodayTokensForDoctor(@Param("doctorId") Long doctorId, @Param("startOfDay") LocalDateTime startOfDay);

    List<QueueEntry> findByDoctorIdAndQueueStatus(Long doctorId, String queueStatus);
}
