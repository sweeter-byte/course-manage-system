import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../services/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const location = useLocation();

    if (!isAuthenticated()) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = getUserRole();
        if (!userRole || !allowedRoles.includes(userRole)) {
            // Redirect to appropriate dashboard if role not allowed
            if (userRole === 'teacher') {
                return <Navigate to="/teacher/dashboard" replace />;
            } else if (userRole === 'officer') {
                return <Navigate to="/admin/dashboard" replace />;
            } else if (userRole === 'student') {
                return <Navigate to="/student/dashboard" replace />;
            } else {
                return <Navigate to="/login" replace />;
            }
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
