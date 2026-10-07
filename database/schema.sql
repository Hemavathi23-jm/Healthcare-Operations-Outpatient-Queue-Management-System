-- Healthcare Appointment Capacity & Queue Management Platform
-- Database Schema Definition (MySQL 8.0)

CREATE DATABASE IF NOT EXISTS Health_Care_Operations_DB
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE Health_Care_Operations_DB;

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id BIGINT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(25),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 3. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    operating_hours_start TIME NOT NULL DEFAULT '08:00:00',
    operating_hours_end TIME NOT NULL DEFAULT '20:00:00',
    is_active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- 4. Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    department_id BIGINT NOT NULL,
    specialization VARCHAR(150) NOT NULL,
    consultation_fee DECIMAL(10, 2) NOT NULL DEFAULT 50.00,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, ON_LEAVE, INACTIVE
    CONSTRAINT fk_doctors_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_doctors_department FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 5. Doctor Availability Table
CREATE TABLE IF NOT EXISTS doctor_availability (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    day_of_week VARCHAR(15) NOT NULL, -- MONDAY, TUESDAY, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_start_time TIME,
    break_end_time TIME,
    max_capacity_per_day INT NOT NULL DEFAULT 20,
    CONSTRAINT fk_availability_doctor FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE,
    INDEX idx_doc_day (doctor_id, day_of_week)
) ENGINE=InnoDB;

-- 6. Doctor Leave Table
CREATE TABLE IF NOT EXISTS doctor_leave (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    leave_date DATE NOT NULL,
    session_type VARCHAR(30) NOT NULL DEFAULT 'FULL_DAY', -- FULL_DAY, MORNING, AFTERNOON
    reason VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'APPROVED', -- PENDING, APPROVED, REJECTED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_leave_doctor FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE,
    INDEX idx_doc_leave_date (doctor_id, leave_date, status)
) ENGINE=InnoDB;

-- 7. Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_code VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender VARCHAR(15) NOT NULL,
    date_of_birth DATE NOT NULL,
    phone VARCHAR(25) NOT NULL UNIQUE,
    email VARCHAR(150),
    blood_group VARCHAR(10),
    address TEXT,
    emergency_contact VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 8. Appointment Types Table
CREATE TABLE IF NOT EXISTS appointment_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL UNIQUE,
    duration_minutes INT NOT NULL DEFAULT 30,
    default_fee DECIMAL(10, 2) NOT NULL DEFAULT 50.00
) ENGINE=InnoDB;

-- 9. Priority Rules Table
CREATE TABLE IF NOT EXISTS priority_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL UNIQUE,
    priority_weight INT NOT NULL DEFAULT 10, -- 100 for Emergency, 50 for Senior, 10 for Standard, 5 for Walk-in
    description TEXT
) ENGINE=InnoDB;

-- 10. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_number VARCHAR(60) NOT NULL UNIQUE,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    department_id BIGINT NOT NULL,
    appointment_type_id BIGINT NOT NULL,
    scheduled_start_time DATETIME NOT NULL,
    scheduled_end_time DATETIME NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED', -- CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, RESCHEDULED, MISSED
    priority_category VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    reason_for_visit TEXT,
    doctor_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE RESTRICT,
    CONSTRAINT fk_appt_doctor FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE RESTRICT,
    CONSTRAINT fk_appt_department FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE RESTRICT,
    CONSTRAINT fk_appt_type FOREIGN KEY (appointment_type_id) REFERENCES appointment_types (id) ON DELETE RESTRICT,
    INDEX idx_appt_doc_time (doctor_id, scheduled_start_time, scheduled_end_time, status),
    INDEX idx_appt_patient (patient_id, status)
) ENGINE=InnoDB;

-- 11. Appointment History Table
CREATE TABLE IF NOT EXISTS appointment_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_id BIGINT NOT NULL,
    previous_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    changed_by_user_id BIGINT,
    reason VARCHAR(255),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_appt FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE CASCADE,
    CONSTRAINT fk_history_user FOREIGN KEY (changed_by_user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 12. Queue Entries Table
CREATE TABLE IF NOT EXISTS queue_entries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_id BIGINT NOT NULL UNIQUE,
    doctor_id BIGINT NOT NULL,
    token_number VARCHAR(30) NOT NULL,
    queue_position INT NOT NULL DEFAULT 1,
    queue_status VARCHAR(30) NOT NULL DEFAULT 'WAITING', -- WAITING, IN_CONSULTATION, COMPLETED, SKIPPED
    priority_rule_id BIGINT,
    checked_in_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    consultation_started_at DATETIME,
    consultation_ended_at DATETIME,
    estimated_wait_minutes INT DEFAULT 0,
    CONSTRAINT fk_queue_appt FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE CASCADE,
    CONSTRAINT fk_queue_doctor FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE,
    CONSTRAINT fk_queue_priority FOREIGN KEY (priority_rule_id) REFERENCES priority_rules (id) ON DELETE SET NULL,
    INDEX idx_queue_doc_status (doctor_id, queue_status, checked_in_at)
) ENGINE=InnoDB;

-- 13. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action_type VARCHAR(60) NOT NULL, -- CREATE, UPDATE, CANCEL, RESCHEDULE, CALL_PATIENT, LOGIN
    entity_name VARCHAR(60) NOT NULL,
    entity_id BIGINT,
    details_json TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_audit_entity (entity_name, entity_id),
    INDEX idx_audit_time (timestamp)
) ENGINE=InnoDB;
