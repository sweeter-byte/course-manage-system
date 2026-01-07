import api from './api';
import { Assignment, AssignmentAnswer, GradeRequest, ApiResponse } from '../types';

// Get assignments by course ID
export async function getAssignmentsByCourse(courseId: string): Promise<Assignment[]> {
    try {
        const response = await api.get<ApiResponse<Assignment[]>>('/assignments', {
            params: { courseId }
        });
        if (response.data.code === 200) {
            return response.data.data || [];
        }
        return [];
    } catch (error) {
        console.error('Get assignments error:', error);
        return [];
    }
}

// Create new assignment
export async function createAssignment(assignment: Partial<Assignment>): Promise<Assignment | null> {
    try {
        const response = await api.post<ApiResponse & { assignment?: Assignment }>('/assignments', assignment);
        if (response.data.code === 200) {
            return response.data.assignment || response.data.data || null;
        }
        return null;
    } catch (error) {
        console.error('Create assignment error:', error);
        return null;
    }
}

// Get all answers for an assignment
export async function getAnswersByAssignment(assignmentId: string): Promise<AssignmentAnswer[]> {
    try {
        const response = await api.get<ApiResponse<AssignmentAnswer[]>>('/answers', {
            params: { assignmentId }
        });
        if (response.data.code === 200) {
            return response.data.data || [];
        }
        return [];
    } catch (error) {
        console.error('Get answers error:', error);
        return [];
    }
}

// Grade an answer
export async function gradeAnswer(gradeData: GradeRequest): Promise<AssignmentAnswer | null> {
    try {
        const response = await api.post<ApiResponse<AssignmentAnswer>>('/answers/grade', gradeData);
        if (response.data.code === 200) {
            return response.data.data || null;
        }
        return null;
    } catch (error) {
        console.error('Grade answer error:', error);
        return null;
    }
}

// Get all answers for grading (teacher view - all answers from their courses)
export async function getAllAnswersForTeacher(courses: { courseId: string; }[]): Promise<AssignmentAnswer[]> {
    const allAnswers: AssignmentAnswer[] = [];

    for (const course of courses) {
        const assignments = await getAssignmentsByCourse(course.courseId);
        for (const assignment of assignments) {
            const answers = await getAnswersByAssignment(assignment.assignmentId);
            // Add assignment info to each answer for display
            answers.forEach(answer => {
                answer.assignmentTitle = assignment.assignmentTitle;
            });
            allAnswers.push(...answers);
        }
    }

    return allAnswers;
}
