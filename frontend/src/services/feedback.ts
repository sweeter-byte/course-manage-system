import api from './api';
import { Feedback, Response, ApiResponse } from '../types';

// Get feedbacks by assignment ID
export async function getFeedbacksByAssignment(assignmentId: string): Promise<Feedback[]> {
    try {
        const response = await api.get<ApiResponse<Feedback[]>>('/feedbacks', {
            params: { assignmentId }
        });
        if (response.data.code === 200) {
            return response.data.data || [];
        }
        return [];
    } catch (error) {
        console.error('Get feedbacks error:', error);
        return [];
    }
}

// Create a response to a feedback
export async function createResponse(feedbackId: string, teacherId: string, responseContent: string): Promise<Response | null> {
    try {
        const response = await api.post<ApiResponse<Response>>('/feedbacks/responses', {
            feedbackId,
            teacherId,
            responseContent
        });
        if (response.data.code === 200) {
            return response.data.data || null;
        }
        return null;
    } catch (error) {
        console.error('Create response error:', error);
        return null;
    }
}

// Get responses by feedback ID
export async function getResponsesByFeedback(feedbackId: string): Promise<Response[]> {
    try {
        const response = await api.get<ApiResponse<Response[]>>(`/feedbacks/${feedbackId}/responses`);
        if (response.data.code === 200) {
            return response.data.data || [];
        }
        return [];
    } catch (error) {
        console.error('Get responses error:', error);
        return [];
    }
}
