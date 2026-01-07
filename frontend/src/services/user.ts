import api from './api';
import { User, ApiResponse } from '../types';

// Get all users (admin function)
export async function getAllUsers(): Promise<User[]> {
    try {
        const response = await api.get<ApiResponse<User[]>>('/users');
        if (response.data.code === 200) {
            return response.data.data || [];
        }
        return [];
    } catch (error) {
        console.error('Get all users error:', error);
        return [];
    }
}

// Get user by ID
export async function getUserById(userId: string): Promise<User | null> {
    try {
        const response = await api.get<ApiResponse<User>>(`/users/${userId}`);
        if (response.data.code === 200) {
            return response.data.data || null;
        }
        return null;
    } catch (error) {
        console.error('Get user by ID error:', error);
        return null;
    }
}

// Update user information
export async function updateUser(user: Partial<User>): Promise<boolean> {
    try {
        const response = await api.post<ApiResponse>('/users/update', user);
        return response.data.code === 200;
    } catch (error) {
        console.error('Update user error:', error);
        return false;
    }
}

// Reset user password (admin function)
export async function resetPassword(userId: string, newPassword: string): Promise<boolean> {
    try {
        // Use admin reset endpoint - we'll need to add this to backend
        const response = await api.post<ApiResponse>('/users/admin-reset-password', {
            userId,
            newPassword
        });
        return response.data.code === 200;
    } catch (error) {
        console.error('Reset password error:', error);
        return false;
    }
}

// Register new user (admin function for importing users)
export async function createUser(user: Partial<User> & { password: string }): Promise<boolean> {
    try {
        const response = await api.post<ApiResponse>('/users/register', user);
        return response.data.code === 200;
    } catch (error) {
        console.error('Create user error:', error);
        return false;
    }
}
