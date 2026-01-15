import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

// Layouts
import MainLayout from './layouts/MainLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard';
import GradingCenter from './pages/teacher/GradingCenter';
import TeacherCourseManagement from './pages/teacher/CourseManagement';
import CreateAssignment from './pages/teacher/CreateAssignment';
import FeedbackBoard from './pages/teacher/FeedbackBoard';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminCourseManagement from './pages/admin/CourseManagement';
import UserManagement from './pages/admin/UserManagement';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentCourseList from './pages/student/CourseList';
import StudentCourseDetail from './pages/student/CourseDetail';
import StudentAssignmentDetail from './pages/student/AssignmentDetail';
import StudentGrades from './pages/student/Grades';
import StudentFeedback from './pages/student/Feedback';
import StudentProfile from './pages/student/Profile';

import './App.css';

dayjs.locale('zh-cn');

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Teacher Routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="grading" element={<GradingCenter />} />
            <Route path="courses" element={<TeacherCourseManagement />} />
            <Route path="courses/:courseId/assignments/new" element={<CreateAssignment />} />
            <Route path="feedback" element={<FeedbackBoard />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['officer']}>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="courses" element={<AdminCourseManagement />} />
            <Route path="users" element={<UserManagement />} />
          </Route>

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="courses" element={<StudentCourseList />} />
            <Route path="courses/:courseId" element={<StudentCourseDetail />} />
            <Route path="assignments/:assignmentId" element={<StudentAssignmentDetail />} />
            <Route path="grades" element={<StudentGrades />} />
            <Route path="feedback" element={<StudentFeedback />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;

