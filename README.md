# Course Interaction Management System

A comprehensive educational platform designed to facilitate seamless interaction between students and teachers. The system integrates a robust backend, a responsive web management portal for teachers/admin, and a native Android client for students.

## 🚀 Overview

The **Course Interaction Management System** provides a unified solution for managing course lifecycles, assignment submissions, and grading feedback. It bridges the gap between mobile accessibility for students and powerful desktop management for educators.

## ✨ Key Features

### 📱 Android Client (Student Focus)
- **User Authentication**: Secure Login & Registration with session management.
- **Course Dashboard**: View enrolled courses and assignments.
- **Assignment Submission**: Submit answers directly from mobile devices.
- **Feedback Loop**: View grades and teacher feedback instantly.
- **Q&A**: Post questions and interact with instructors.

### 💻 Web Portal (Teacher & Admin Focus)
- **Teacher Workstation**:
    - **Grading Center**: Review student submissions with a modern split-view interface.
    - **Course Management**: Publish assignments and manage course content.
    - **Feedback Board**: Reply to student inquiries.
- **Admin Dashboard**:
    - **User Management**: Manage student/teacher accounts and reset passwords.
    - **System Statistics**: Overview of system usage.
    
### 🛡️ Backend Server
- **RESTful API**: Fully documented API endpoints.
- **Security**: JWT-based authentication and stateless session management.
- **Data Integrity**: Robust MySQL database schema with foreign key constraints.

## 🛠️ Tech Stack

| Component | Technologies |
|-----------|--------------|
| **Backend** | Java 17, Spring Boot 3.x, MyBatis, MySQL, JWT, BCrypt |
| **Frontend** | React 18, TypeScript, Vite, Ant Design, Axios |
| **Android** | Java, Retrofit2, OkHttp3, Material Design |
| **Database** | MySQL 8.0 |

## 📂 Project Structure

```bash
course-manage-system/
├── server/            # Spring Boot Backend Application
├── frontend/          # React Web Application (Vite)
├── android_client/    # Native Android Application
├── doc/               # Documentation and Plans
└── README.md          # Project Documentation
```

## ⚡ Getting Started

### Prerequisites
- JDK 17+
- Node.js 18+
- MySQL 8.0+
- Android Studio Iguana+

### 1. Database Setup
1. Create a MySQL database named `course_db`.
2. Run the initialization script located at `server/db_schema.sql`.

### 2. Backend Setup
```bash
cd server
# Update src/main/resources/application.properties with your DB credentials
mvn clean install
mvn spring-boot:run
```
The server will start at `http://localhost:8080`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The web portal will be available at `http://localhost:5173`.

### 4. Android Client Setup
1. Open `android_client` in Android Studio.
2. Update `RetrofitClient.java` (or `BASE_URL` config) with your server's IP address.
3. Sync Gradle and run on an emulator or physical device.

## 📝 API Documentation

The backend exposes standard REST endpoints. Key controllers include:
- `AuthController`: `/api/users/login`, `/api/users/register`
- `CourseController`: `/api/courses`
- `AssignmentController`: `/api/assignments`
- `GradingController`: `/api/answers/grade`

## 📄 License

This project is licensed under the MIT License.
