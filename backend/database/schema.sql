-- Department Management System - Database Schema (PostgreSQL)
-- Fully aligned with Assignment Specifications

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    dept_id SERIAL PRIMARY KEY,
    dept_name VARCHAR(100) UNIQUE NOT NULL,
    dept_code VARCHAR(50) UNIQUE NOT NULL,
    head_of_department VARCHAR(100),
    location VARCHAR(100),
    contact_email VARCHAR(100),
    total_staff INTEGER DEFAULT 0,
    total_students INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Teacher', 'Student')),
    phone VARCHAR(20),
    department_id INT REFERENCES departments(dept_id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    course_id SERIAL PRIMARY KEY,
    course_name VARCHAR(150) NOT NULL,
    course_code VARCHAR(50) UNIQUE NOT NULL,
    dept_id INT NOT NULL REFERENCES departments(dept_id) ON DELETE CASCADE,
    instructor_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    credits INTEGER DEFAULT 3,
    semester VARCHAR(50),
    max_capacity INTEGER DEFAULT 50,
    enrolled_students INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Enrollments Table
CREATE TABLE IF NOT EXISTS enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    grade VARCHAR(5),
    attendance_percentage NUMERIC(5,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Enrolled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_course UNIQUE (student_id, course_id)
);

-- 5. API Logs Table
CREATE TABLE IF NOT EXISTS api_logs (
    log_id SERIAL PRIMARY KEY,
    api_endpoint VARCHAR(255) NOT NULL,
    http_method VARCHAR(10) NOT NULL,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    request_body JSONB,
    response_body JSONB,
    status_code INT NOT NULL,
    response_time_ms INT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- Performance Indexes
-- =========================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_courses_dept_id ON courses(dept_id);
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_timestamp ON api_logs(timestamp);