package com.healthcare.repository;

import com.healthcare.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Optional<Appointment> findByAppointmentNumber(String appointmentNumber);

    List<Appointment> findByPatientId(Long patientId);

    List<Appointment> findByDoctorIdAndScheduledStartTimeBetween(
            Long doctorId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND a.status NOT IN ('CANCELLED', 'RESCHEDULED') " +
           "AND a.scheduledStartTime >= :start AND a.scheduledStartTime < :end " +
           "ORDER BY a.scheduledStartTime ASC")
    List<Appointment> findActiveDoctorAppointmentsForDay(
            @Param("doctorId") Long doctorId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND a.status NOT IN ('CANCELLED', 'RESCHEDULED') " +
           "AND (:newStart < a.scheduledEndTime AND :newEnd > a.scheduledStartTime)")
    boolean hasDoctorTimeCollision(
            @Param("doctorId") Long doctorId,
            @Param("newStart") LocalDateTime newStart,
            @Param("newEnd") LocalDateTime newEnd);

    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND a.id <> :excludeApptId " +
           "AND a.status NOT IN ('CANCELLED', 'RESCHEDULED') " +
           "AND (:newStart < a.scheduledEndTime AND :newEnd > a.scheduledStartTime)")
    boolean hasDoctorTimeCollisionExcluding(
            @Param("doctorId") Long doctorId,
            @Param("newStart") LocalDateTime newStart,
            @Param("newEnd") LocalDateTime newEnd,
            @Param("excludeApptId") Long excludeApptId);

    List<Appointment> findByDoctorIdAndStatusIn(Long doctorId, List<String> statuses);

    @Query("SELECT a FROM Appointment a WHERE " +
           "(:doctorId IS NULL OR a.doctor.id = :doctorId) AND " +
           "(:departmentId IS NULL OR a.department.id = :departmentId) AND " +
           "(:status IS NULL OR a.status = :status OR " +
           " (:status = 'SCHEDULED' AND a.status IN ('SCHEDULED', 'CONFIRMED')) OR " +
           " (:status = 'IN_QUEUE' AND a.status IN ('IN_QUEUE', 'WAITING', 'CHECKED_IN')) OR " +
           " (:status = 'IN_CONSULTATION' AND a.status IN ('IN_CONSULTATION', 'IN_PROGRESS')) " +
           ") AND " +
           "(a.scheduledStartTime >= :start AND a.scheduledStartTime <= :end) " +
           "ORDER BY a.scheduledStartTime ASC")
    List<Appointment> filterAppointments(
            @Param("doctorId") Long doctorId,
            @Param("departmentId") Long departmentId,
            @Param("status") String status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}
