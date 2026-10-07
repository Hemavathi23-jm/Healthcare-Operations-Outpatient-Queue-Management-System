package com.healthcare.service;

import com.healthcare.dto.DepartmentDto;
import com.healthcare.entity.Department;
import com.healthcare.repository.DepartmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public DepartmentDto getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Department not found with ID: " + id));
    }

    @Transactional
    public DepartmentDto createDepartment(DepartmentDto dto) {
        Department dept = Department.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .operatingHoursStart(dto.getOperatingHoursStart())
                .operatingHoursEnd(dto.getOperatingHoursEnd())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
        Department saved = departmentRepository.save(dept);
        return mapToDto(saved);
    }

    private DepartmentDto mapToDto(Department d) {
        return DepartmentDto.builder()
                .id(d.getId())
                .name(d.getName())
                .description(d.getDescription())
                .operatingHoursStart(d.getOperatingHoursStart())
                .operatingHoursEnd(d.getOperatingHoursEnd())
                .isActive(d.getIsActive())
                .build();
    }
}
