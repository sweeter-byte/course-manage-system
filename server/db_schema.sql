-- Database Initialization
CREATE DATABASE IF NOT EXISTS course_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE course_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    real_name VARCHAR(50),
    phone_number VARCHAR(20) UNIQUE,
    email VARCHAR(100),
    role VARCHAR(20) NOT NULL COMMENT 'student, teacher, officer',
    student_id VARCHAR(20),
    teacher_id VARCHAR(20),
    college VARCHAR(50),
    major VARCHAR(50),
    class_name VARCHAR(50),
    register_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
    course_id VARCHAR(50) PRIMARY KEY,
    creator_id VARCHAR(50) NOT NULL,
    teacher_id VARCHAR(50) NOT NULL,
    course_name VARCHAR(100) NOT NULL,
    course_description TEXT,
    enrollment_count INT DEFAULT 0,
    course_start_date DATE,
    course_end_date DATE,
    course_status VARCHAR(20) DEFAULT 'NotStarted',
    course_semester VARCHAR(20),
    course_location VARCHAR(100),
    FOREIGN KEY (teacher_id) REFERENCES users(user_id)
);

-- Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    assignment_id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL,
    teacher_id VARCHAR(50) NOT NULL,
    assignment_title VARCHAR(100) NOT NULL,
    assignment_content TEXT,
    start_time DATETIME,
    end_time DATETIME,
    assignment_status VARCHAR(20) DEFAULT 'NotStarted',
    FOREIGN KEY (course_id) REFERENCES courses(course_id),
    FOREIGN KEY (teacher_id) REFERENCES users(user_id)
);

-- Assignment Answers Table
CREATE TABLE IF NOT EXISTS assignment_answers (
    answer_id VARCHAR(50) PRIMARY KEY,
    assignment_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    answer_content TEXT,
    answer_status VARCHAR(20) DEFAULT 'NotSubmitted',
    teacher_feedback TEXT,
    score DECIMAL(5, 2),
    submission_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id),
    FOREIGN KEY (student_id) REFERENCES users(user_id)
);

-- Feedbacks Table
CREATE TABLE IF NOT EXISTS feedbacks (
    feedback_id VARCHAR(50) PRIMARY KEY,
    assignment_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    feedback_content TEXT,
    publish_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id),
    FOREIGN KEY (student_id) REFERENCES users(user_id)
);

-- Responses Table
CREATE TABLE IF NOT EXISTS responses (
    response_id VARCHAR(50) PRIMARY KEY,
    feedback_id VARCHAR(50) NOT NULL,
    teacher_id VARCHAR(50) NOT NULL,
    response_content TEXT,
    publish_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (feedback_id) REFERENCES feedbacks(feedback_id),
    FOREIGN KEY (teacher_id) REFERENCES users(user_id)
);

-- Course Enrollments Table (选课关系表)
CREATE TABLE IF NOT EXISTS course_enrollments (
    enrollment_id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    course_id VARCHAR(50) NOT NULL,
    enrollment_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_enrollment (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES users(user_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);

-- SMS Verification Codes Table (短信验证码表)
CREATE TABLE IF NOT EXISTS sms_verification_codes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    type VARCHAR(20) NOT NULL COMMENT 'REGISTER, LOGIN, RESET_PASSWORD',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    INDEX idx_phone_type (phone_number, type)
);
