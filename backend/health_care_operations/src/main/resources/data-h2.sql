-- Healthcare Operations Seed Data (H2 Compatible)

-- 1. Seed Roles
MERGE INTO roles (id, role_name) VALUES (1, 'ADMIN');
MERGE INTO roles (id, role_name) VALUES (2, 'RECEPTIONIST');
MERGE INTO roles (id, role_name) VALUES (3, 'DOCTOR');
MERGE INTO roles (id, role_name) VALUES (4, 'MANAGER');

-- 2. Seed Priority Rules
MERGE INTO priority_rules (id, category_name, priority_weight, description) VALUES (1, 'EMERGENCY', 100, 'Immediate attention required');
MERGE INTO priority_rules (id, category_name, priority_weight, description) VALUES (2, 'SENIOR_CITIZEN', 50, 'Elderly patients');
MERGE INTO priority_rules (id, category_name, priority_weight, description) VALUES (3, 'SCHEDULED_STANDARD', 10, 'Regular confirmed appointment');
MERGE INTO priority_rules (id, category_name, priority_weight, description) VALUES (4, 'WALK_IN', 5, 'Unscheduled walk-in patient');

-- 3. Seed Appointment Types
MERGE INTO appointment_types (id, type_name, duration_minutes, default_fee) VALUES (1, 'General Consultation', 30, 40.00);
MERGE INTO appointment_types (id, type_name, duration_minutes, default_fee) VALUES (2, 'Follow-up Consultation', 15, 25.00);
MERGE INTO appointment_types (id, type_name, duration_minutes, default_fee) VALUES (3, 'Specialist Examination', 45, 80.00);
MERGE INTO appointment_types (id, type_name, duration_minutes, default_fee) VALUES (4, 'Comprehensive Health Checkup', 60, 120.00);

-- 4. Seed Departments
MERGE INTO departments (id, name, description, operating_hours_start, operating_hours_end, is_active) VALUES (1, 'Cardiology', 'Heart & cardiovascular care', '08:00:00', '18:00:00', TRUE);
MERGE INTO departments (id, name, description, operating_hours_start, operating_hours_end, is_active) VALUES (2, 'Orthopedics', 'Musculoskeletal system, joints & spine care', '08:30:00', '17:30:00', TRUE);
MERGE INTO departments (id, name, description, operating_hours_start, operating_hours_end, is_active) VALUES (3, 'General Medicine', 'Primary care, diagnostic evaluation & internal medicine', '08:00:00', '20:00:00', TRUE);
MERGE INTO departments (id, name, description, operating_hours_start, operating_hours_end, is_active) VALUES (4, 'Pediatrics', 'Child health & medical development', '09:00:00', '17:00:00', TRUE);
MERGE INTO departments (id, name, description, operating_hours_start, operating_hours_end, is_active) VALUES (5, 'Dermatology', 'Skin, hair and nail treatments', '09:00:00', '16:00:00', TRUE);

-- 5. Seed Users (BCrypt hash of 'Password@123')
-- admin: admin123 | receptionist: reception123 | doctors: doctor123 | manager: manager123
MERGE INTO users (id, username, password_hash, role_id, full_name, email, phone, is_active) VALUES (1, 'admin', '$2a$12$K1rZzZg/u3gH3sXGZvh3kO.1H9e5rM9s8d1wA8k3H.lK8mU2j3F6w', 1, 'System Administrator', 'admin@hospital.org', '+1-555-0101', TRUE);
MERGE INTO users (id, username, password_hash, role_id, full_name, email, phone, is_active) VALUES (2, 'receptionist1', '$2a$12$K1rZzZg/u3gH3sXGZvh3kO.1H9e5rM9s8d1wA8k3H.lK8mU2j3F6w', 2, 'Sarah Jenkins (Reception)', 'reception1@hospital.org', '+1-555-0102', TRUE);
MERGE INTO users (id, username, password_hash, role_id, full_name, email, phone, is_active) VALUES (3, 'dr.smith', '$2a$12$K1rZzZg/u3gH3sXGZvh3kO.1H9e5rM9s8d1wA8k3H.lK8mU2j3F6w', 3, 'Dr. Robert Smith', 'r.smith@hospital.org', '+1-555-0103', TRUE);
MERGE INTO users (id, username, password_hash, role_id, full_name, email, phone, is_active) VALUES (4, 'dr.clark', '$2a$12$K1rZzZg/u3gH3sXGZvh3kO.1H9e5rM9s8d1wA8k3H.lK8mU2j3F6w', 3, 'Dr. Emily Clark', 'e.clark@hospital.org', '+1-555-0104', TRUE);
MERGE INTO users (id, username, password_hash, role_id, full_name, email, phone, is_active) VALUES (5, 'manager1', '$2a$12$K1rZzZg/u3gH3sXGZvh3kO.1H9e5rM9s8d1wA8k3H.lK8mU2j3F6w', 4, 'Operations Manager David', 'manager@hospital.org', '+1-555-0105', TRUE);

-- 6. Seed Doctor Profiles
MERGE INTO doctors (id, user_id, department_id, specialization, consultation_fee, status) VALUES (1, 3, 1, 'Senior Interventional Cardiologist', 90.00, 'ACTIVE');
MERGE INTO doctors (id, user_id, department_id, specialization, consultation_fee, status) VALUES (2, 4, 2, 'Orthopedic & Joint Specialist', 85.00, 'ACTIVE');

-- 7. Seed Doctor Availability (Mon-Fri)
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, break_start_time, break_end_time, max_capacity_per_day) VALUES (1, 'MONDAY', '09:00:00', '17:00:00', '13:00:00', '14:00:00', 16);
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, break_start_time, break_end_time, max_capacity_per_day) VALUES (1, 'TUESDAY', '09:00:00', '17:00:00', '13:00:00', '14:00:00', 16);
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, break_start_time, break_end_time, max_capacity_per_day) VALUES (1, 'WEDNESDAY', '09:00:00', '17:00:00', '13:00:00', '14:00:00', 16);
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, break_start_time, break_end_time, max_capacity_per_day) VALUES (1, 'THURSDAY', '09:00:00', '17:00:00', '13:00:00', '14:00:00', 16);
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, break_start_time, break_end_time, max_capacity_per_day) VALUES (1, 'FRIDAY', '09:00:00', '17:00:00', '13:00:00', '14:00:00', 16);
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, break_start_time, break_end_time, max_capacity_per_day) VALUES (2, 'MONDAY', '08:30:00', '16:30:00', '12:30:00', '13:30:00', 16);
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, break_start_time, break_end_time, max_capacity_per_day) VALUES (2, 'TUESDAY', '08:30:00', '16:30:00', '12:30:00', '13:30:00', 16);
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, break_start_time, break_end_time, max_capacity_per_day) VALUES (2, 'WEDNESDAY', '08:30:00', '16:30:00', '12:30:00', '13:30:00', 16);
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, break_start_time, break_end_time, max_capacity_per_day) VALUES (2, 'THURSDAY', '08:30:00', '16:30:00', '12:30:00', '13:30:00', 16);
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, break_start_time, break_end_time, max_capacity_per_day) VALUES (2, 'FRIDAY', '08:30:00', '16:30:00', '12:30:00', '13:30:00', 16);

-- 8. Seed Patients
MERGE INTO patients (id, patient_code, first_name, last_name, gender, date_of_birth, phone, email, blood_group) VALUES (1, 'PAT-001', 'John', 'Doe', 'MALE', '1980-05-15', '+1-555-1001', 'john.doe@email.com', 'O+');
MERGE INTO patients (id, patient_code, first_name, last_name, gender, date_of_birth, phone, email, blood_group) VALUES (2, 'PAT-002', 'Jane', 'Smith', 'FEMALE', '1992-08-22', '+1-555-1002', 'jane.smith@email.com', 'A+');
MERGE INTO patients (id, patient_code, first_name, last_name, gender, date_of_birth, phone, email, blood_group) VALUES (3, 'PAT-003', 'Robert', 'Johnson', 'MALE', '1955-11-30', '+1-555-1003', 'r.johnson@email.com', 'B+');
