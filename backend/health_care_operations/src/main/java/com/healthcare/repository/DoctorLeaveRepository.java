package com.healthcare.repository;

import com.healthcare.entity.DoctorLeave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorLeaveRepository extends JpaRepository<DoctorLeave, Long> {
    List<DoctorLeave> findByDoctorId(Long doctorId);
    List<DoctorLeave> findByDoctorIdAndLeaveDateAndStatus(Long doctorId, LocalDate leaveDate, String status);
    Optional<DoctorLeave> findFirstByDoctorIdAndLeaveDateAndStatus(Long doctorId, LocalDate leaveDate, String status);
}
