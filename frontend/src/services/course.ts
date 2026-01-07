import api from './api';
import { Course, ApiResponse } from '../types';

// Get all courses
export async function getAllCourses(): Promise<Course[]> {
    try {
        const response = await api.get<ApiResponse<Course[]>>('/courses');
        if (response.data.code === 200) {
            return response.data.data || [];
        }
        return [];
    } catch (error) {
        console.error('Get all courses error:', error);
        return [];
    }
}

// Get course by ID
export async function getCourseById(courseId: string): Promise<Course | null> {
    try {
        const response = await api.get<ApiResponse<Course>>(`/courses/${courseId}`);
        if (response.data.code === 200) {
            return response.data.data || null;
        }
        return null;
    } catch (error) {
        console.error('Get course by ID error:', error);
        return null;
    }
}

// Get courses by teacher ID
export async function getCoursesByTeacher(teacherId: string): Promise<Course[]> {
    try {
        const response = await api.get<ApiResponse<Course[]>>(`/courses/teacher/${teacherId}`);
        if (response.data.code === 200) {
            return response.data.data || [];
        }
        return [];
    } catch (error) {
        console.error('Get courses by teacher error:', error);
        return [];
    }
}

// Create new course
export async function createCourse(course: Partial<Course>): Promise<Course | null> {
    try {
        const response = await api.post<ApiResponse<Course> & { course?: Course }>('/courses', course);
        if (response.data.code === 200) {
            return response.data.course || response.data.data || null;
        }
        return null;
    } catch (error) {
        console.error('Create course error:', error);
        return null;
    }
}

// Update course
export async function updateCourse(courseId: string, course: Partial<Course>): Promise<boolean> {
    try {
        const response = await api.put<ApiResponse>(`/courses/${courseId}`, course);
        return response.data.code === 200;
    } catch (error) {
        console.error('Update course error:', error);
        return false;
    }
}

// Delete course
export async function deleteCourse(courseId: string): Promise<boolean> {
    try {
        const response = await api.delete<ApiResponse>(`/courses/${courseId}`);
        return response.data.code === 200;
    } catch (error) {
        console.error('Delete course error:', error);
        return false;
    }
}

// Get students enrolled in a course
export async function getCourseStudents(courseId: string): Promise<any[]> {
    try {
        const response = await api.get<ApiResponse & { data?: any[], count?: number }>('/enrollments/course-students', {
            params: { courseId }
        });
        if (response.data.code === 200) {
            return response.data.data || [];
        }
        return [];
    } catch (error) {
        console.error('Get course students error:', error);
        return [];
    }
}
