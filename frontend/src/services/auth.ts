import api from './api';
import { User, LoginRequest, ApiResponse } from '../types';

// Login with phone number and password
export async function login(request: LoginRequest): Promise<User | null> {
    try {
        const response = await api.post<ApiResponse<User>>('/users/login', request);
        if (response.data.code === 200 && response.data.user) {
            const user = response.data.user;
            // Store token and user info
            if (user.token) {
                localStorage.setItem('token', user.token);
            }
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        }
        return null;
    } catch (error) {
        console.error('Login error:', error);
        return null;
    }
}

// Logout - clear local storage
export function logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

// Get current user from local storage
export function getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            return JSON.parse(userStr) as User;
        } catch {
            return null;
        }
    }
    return null;
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
}

// Get user role
export function getUserRole(): string | null {
    const user = getCurrentUser();
    return user?.role || null;
}

// Register new user (with SMS verification)
export async function register(user: {
    phoneNumber: string;
    username: string;
    password: string;
    role: string;
    code: string;
}): Promise<boolean> {
    try {
        const response = await api.post<ApiResponse>('/users/register', user);
        return response.data.code === 200;
    } catch (error) {
        console.error('Register error:', error);
        return false;
    }
}

// Send SMS verification code
export async function sendSmsCode(phoneNumber: string, type: 'REGISTER' | 'LOGIN' | 'RESET_PASSWORD'): Promise<boolean> {
    try {
        const response = await api.post<ApiResponse>('/sms/send', { phoneNumber, type });
        return response.data.code === 200;
    } catch (error) {
        console.error('Send SMS code error:', error);
        return false;
    }
}

// Login with SMS code
export async function loginBySms(phoneNumber: string, code: string): Promise<User | null> {
    try {
        const response = await api.post<ApiResponse<User>>('/users/login-sms', { phoneNumber, code });
        if (response.data.code === 200 && response.data.user) {
            const user = response.data.user;
            if (user.token) {
                localStorage.setItem('token', user.token);
            }
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        }
        return null;
    } catch (error) {
        console.error('SMS login error:', error);
        return null;
    }
}

// Reset password with SMS code
export async function resetPassword(phoneNumber: string, code: string, newPassword: string): Promise<boolean> {
    try {
        const response = await api.post<ApiResponse>('/users/reset-password', { phoneNumber, code, newPassword });
        return response.data.code === 200;
    } catch (error) {
        console.error('Reset password error:', error);
        return false;
    }
}
