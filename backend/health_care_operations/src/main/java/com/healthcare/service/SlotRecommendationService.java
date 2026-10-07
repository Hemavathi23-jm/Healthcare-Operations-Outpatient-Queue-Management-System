package com.healthcare.service;

import com.healthcare.dto.SlotResponseDto;
import com.healthcare.entity.*;
import com.healthcare.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class SlotRecommendationService {

    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorLeaveRepository leaveRepository;
    private final AppointmentTypeRepository appointmentTypeRepository;
    private final AppointmentRepository appointmentRepository;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a");

    public SlotRecommendationService(DoctorRepository doctorRepository,
                                     DoctorAvailabilityRepository availabilityRepository,
                                     DoctorLeaveRepository leaveRepository,
                                     AppointmentTypeRepository appointmentTypeRepository,
                                     AppointmentRepository appointmentRepository) {
        this.doctorRepository = doctorRepository;
        this.availabilityRepository = availabilityRepository;
        this.leaveRepository = leaveRepository;
        this.appointmentTypeRepository = appointmentTypeRepository;
        this.appointmentRepository = appointmentRepository;
    }

    public List<SlotResponseDto> getAvailableSlots(Long doctorId, LocalDate targetDate, Long appointmentTypeId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + doctorId));

        if ("INACTIVE".equalsIgnoreCase(doctor.getStatus())) {
            return List.of();
        }

        // Check Approved Leave
        List<DoctorLeave> leaves = leaveRepository.findByDoctorIdAndLeaveDateAndStatus(doctorId, targetDate, "APPROVED");
        boolean fullDayLeave = leaves.stream().anyMatch(l -> "FULL_DAY".equalsIgnoreCase(l.getSessionType()));
        if (fullDayLeave) {
            return List.of();
        }

        // Check Availability for day of week
        String dayOfWeek = targetDate.getDayOfWeek().name();
        Optional<DoctorAvailability> availabilityOpt = availabilityRepository.findByDoctorIdAndDayOfWeek(doctorId, dayOfWeek);
        if (availabilityOpt.isEmpty()) {
            return List.of();
        }

        DoctorAvailability availability = availabilityOpt.get();
        LocalTime workStart = availability.getStartTime();
        LocalTime workEnd = availability.getEndTime();
        LocalTime breakStart = availability.getBreakStartTime();
        LocalTime breakEnd = availability.getBreakEndTime();

        // Get Appointment Type duration
        int durationMinutes = 30;
        if (appointmentTypeId != null) {
            Optional<AppointmentType> typeOpt = appointmentTypeRepository.findById(appointmentTypeId);
            if (typeOpt.isPresent()) {
                durationMinutes = typeOpt.get().getDurationMinutes();
            }
        }

        // Load existing booked appointments for the day
        LocalDateTime dayStart = targetDate.atStartOfDay();
        LocalDateTime dayEnd = targetDate.plusDays(1).atStartOfDay();
        List<Appointment> existingAppointments = appointmentRepository.findActiveDoctorAppointmentsForDay(doctorId, dayStart, dayEnd);

        List<SlotResponseDto> slots = new ArrayList<>();
        LocalTime current = workStart;
        LocalDate today = LocalDate.now();
        LocalTime nowTime = LocalTime.now();

        while (!current.plusMinutes(durationMinutes).isAfter(workEnd)) {
            LocalTime slotStart = current;
            LocalTime slotEnd = current.plusMinutes(durationMinutes);
            LocalDateTime slotStartDt = targetDate.atTime(slotStart);
            LocalDateTime slotEndDt = targetDate.atTime(slotEnd);

            boolean isAvailable = true;
            String reason = null;

            // 1. Check if past time for today
            if (targetDate.isEqual(today) && slotStart.isBefore(nowTime)) {
                isAvailable = false;
                reason = "Past Time";
            }
            // 2. Check break time collision
            else if (breakStart != null && breakEnd != null &&
                    !(slotEnd.isBefore(breakStart) || slotEnd.equals(breakStart) ||
                      slotStart.isAfter(breakEnd) || slotStart.equals(breakEnd))) {
                isAvailable = false;
                reason = "Doctor Break";
            }
            // 3. Check partial day leave collision
            else if (!leaves.isEmpty()) {
                for (DoctorLeave leave : leaves) {
                    if ("MORNING".equalsIgnoreCase(leave.getSessionType()) && slotStart.isBefore(LocalTime.of(13, 0))) {
                        isAvailable = false;
                        reason = "Doctor Morning Leave";
                        break;
                    } else if ("AFTERNOON".equalsIgnoreCase(leave.getSessionType()) && slotEnd.isAfter(LocalTime.of(13, 0))) {
                        isAvailable = false;
                        reason = "Doctor Afternoon Leave";
                        break;
                    }
                }
            }

            // 4. Check appointment collision
            if (isAvailable) {
                for (Appointment appt : existingAppointments) {
                    if (slotStartDt.isBefore(appt.getScheduledEndTime()) && slotEndDt.isAfter(appt.getScheduledStartTime())) {
                        isAvailable = false;
                        reason = "Booked";
                        break;
                    }
                }
            }

            slots.add(SlotResponseDto.builder()
                    .startTime(slotStart)
                    .endTime(slotEnd)
                    .formattedTime(slotStart.format(TIME_FORMATTER) + " - " + slotEnd.format(TIME_FORMATTER))
                    .available(isAvailable)
                    .reasonIfNotAvailable(reason)
                    .build());

            // Advance by slot duration
            current = current.plusMinutes(durationMinutes);
        }

        return slots;
    }
}
