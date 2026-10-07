-- Healthcare Appointment Capacity & Queue Management Platform
-- Seed Data Script

USE Health_Care_Operations_DB;

-- 1. Seed Roles
INSERT INTO roles (id, role_name) VALUES
(1, 'ADMIN'),
(2, 'RECEPTIONIST'),
(3, 'DOCTOR'),
(4, 'MANAGER')
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

-- 2. Seed Priority Rules
INSERT INTO priority_rules (id, category_name, priority_weight, description) VALUES
(1, 'EMERGENCY', 100, 'Immediate attention required (Triage / Critical)'),
(2, 'SENIOR_CITIZEN', 50, 'Elderly patients / Special physical assistance required'),
(3, 'SCHEDULED_STANDARD', 10, 'Regular confirmed scheduled appointment'),
(4, 'WALK_IN', 5, 'Unscheduled walk-in patient filled into available slot')
ON DUPLICATE KEY UPDATE priority_weight = VALUES(priority_weight), description = VALUES(description);

-- 3. Seed Appointment Types
INSERT INTO appointment_types (id, type_name, duration_minutes, default_fee) VALUES
(1, 'General Consultation', 30, 40.00),
(2, 'Follow-up Consultation', 15, 25.00),
(3, 'Specialist Examination', 45, 80.00),
(4, 'Comprehensive Health Checkup', 60, 120.00)
ON DUPLICATE KEY UPDATE duration_minutes = VALUES(duration_minutes), default_fee = VALUES(default_fee);

-- 4. Seed Departments
INSERT INTO departments (id, name, description, operating_hours_start, operating_hours_end, is_active) VALUES
(1, 'Cardiology', 'Heart & cardiovascular care', '08:00:00', '18:00:00', TRUE),
(2, 'Orthopedics', 'Musculoskeletal system, joints & spine care', '08:30:00', '17:30:00', TRUE),
(3, 'General Medicine', 'Primary care, diagnostic evaluation & internal medicine', '08:00:00', '20:00:00', TRUE),
(4, 'Pediatrics', 'Child health & medical development', '09:00:00', '17:00:00', TRUE),
(5, 'Dermatology', 'Skin, hair and nail treatments', '09:00:00', '16:00:00', TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);

-- 5. Seed Core System Users (Password for all demo accounts: 'Password@123' hashed with BCrypt)
-- Hash: $2a$12$0vO430q3s5mGSmg99s67Q.68r5k8mU2j3F6wT6H.hC7sPZ5gJ6Z1K (Example standard bcrypt hash)
INSERT INTO users (id, username, password_hash, role_id, full_name, email, phone, is_active) VALUES
(1, 'admin', '$2a$12$K1rZzZg/u3gH3sXGZvh3kO.1H9e5rM9s8d1wA8k3H.lK8mU2j3F6w', 1, 'System Administrator', 'admin@hospital.org', '+1-555-0101', TRUE),
(2, 'receptionist1', '$2a$12$K1rZzZg/u3gH3sXGZvh3kO.1H9e5rM9s8d1wA8k3H.lK8mU2j3F6w', 2, 'Sarah Jenkins (Reception)', 'reception1@hospital.org', '+1-555-0102', TRUE),
(3, 'dr.smith', '$2a$12$K1rZzZg/u3gH3sXGZvh3kO.1H9e5rM9s8d1wA8k3H.lK8mU2j3F6w', 3, 'Dr. Robert Smith (Cardiology)', 'r.smith@hospital.org', '+1-555-0103', TRUE),
(4, 'dr.clark', '$2a$12$K1rZzZg/u3gH3sXGZvh3kO.1H9e5rM9s8d1wA8k3H.lK8mU2j3F6w', 3, 'Dr. Emily Clark (Orthopedics)', 'e.clark@hospital.org', '+1-555-0104', TRUE),
(5, 'manager1', '$2a$12$K1rZzZg/u3gH3sXGZvh3kO.1H9e5rM9s8d1wA8k3H.lK8mU2j3F6w', 4, 'Operations Manager David', 'manager@hospital.org', '+1-555-0105', TRUE)
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), email = VALUES(email);

-- 6. Seed Doctor Profiles
INSERT INTO doctors (id, user_id, department_id, specialization, consultation_fee, status) VALUES
(1, 3, 1, 'Senior Interventional Cardiologist', 90.00, 'ACTIVE'),
(2, 4, 2, 'Orthopedic & Joint Specialist', 85.00, 'ACTIVE')
ON DUPLICATE KEY UPDATE specialization = VALUES(specialization), consultation_fee = VALUES(consultation_fee);

-- 7. Seed Doctor Availability (Mon-Fri)
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, break_start_time, break_end_time, max_capacity_per_day) VALUES
(1, 'MONDAY', '09:00:00', '17:00:00', '13:00:00', '14:00:00', 16),
(1, 'TUESDAY', '09:00:00', '17:00:00', '13:00:00', '14:00:00', 16),
(1, 'WEDNESDAY', '09:00:00', '17:00:00', '13:00:00', '14:00:00', 16),
(1, 'THURSDAY', '09:00:00', '17:00:00', '13:00:00', '14:00:00', 16),
(1, 'FRIDAY', '09:00:00', '17:00:00', '13:00:00', '14:00:00', 16),
(2, 'MONDAY', '08:30:00', '16:30:00', '12:30:00', '13:30:00', 16),
(2, 'TUESDAY', '08:30:00', '16:30:00', '12:30:00', '13:30:00', 16),
(2, 'WEDNESDAY', '08:30:00', '16:30:00', '12:30:00', '13:30:00', 16),
(2, 'THURSDAY', '08:30:00', '16:30:00', '12:30:00', '13:30:00', 16),
(2, 'FRIDAY', '08:30:00', '16:30:00', '12:30:00', '13:30:00', 16);
