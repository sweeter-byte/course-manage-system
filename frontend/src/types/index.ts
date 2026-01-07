// Type definitions for the Course Management System

export interface User {
    userId: string;
    username: string;
    realName?: string;
    phoneNumber: string;
    email?: string;
    role: 'student' | 'teacher' | 'officer';
    studentId?: string;
    teacherId?: string;
    college?: string;
    major?: string;
    className?: string;
    token?: string;
}

export interface Course {
    courseId: string;
    creatorId: string;
    teacherId: string;
    courseName: string;
    courseDescription?: string;
    enrollmentCount?: number;
    courseStartDate?: string;
    courseEndDate?: string;
    courseStatus?: 'NotStarted' | 'Ongoing' | 'Ended';
    courseSemester?: string;
    courseLocation?: string;
    createdAt?: string;
}

export interface Assignment {
    assignmentId: string;
    courseId: string;
    teacherId: string;
    assignmentTitle: string;
    assignmentContent?: string;
    startTime?: string;
    endTime?: string;
    assignmentStatus?: 'NotStarted' | 'Ongoing' | 'Ended';
    createdAt?: string;
    courseName?: string;
}

export interface AssignmentAnswer {
    answerId: string;
    assignmentId: string;
    studentId: string;
    answerContent?: string;
    answerStatus?: 'NotSubmitted' | 'Submitted' | 'Graded';
    teacherFeedback?: string;
    feedback?: string;
    score?: number;
    submissionTime?: string;
    // Additional fields for display
    studentName?: string;
    assignmentTitle?: string;
    courseName?: string;
}

export interface Feedback {
    feedbackId: string;
    assignmentId: string;
    studentId: string;
    feedbackContent: string;
    replyContent?: string;
    publishTime?: string;
    createdAt?: string;
    repliedAt?: string;
    // Additional fields for display
    studentName?: string;
}

export interface Response {
    responseId: string;
    feedbackId: string;
    teacherId: string;
    responseContent: string;
    publishTime?: string;
}

export interface ApiResponse<T = any> {
    code: number;
    message?: string;
    data?: T;
    user?: T;
}

export interface LoginRequest {
    phoneNumber: string;
    password: string;
}

export interface GradeRequest {
    answerId: string;
    feedback: string;
    score: number;
}
