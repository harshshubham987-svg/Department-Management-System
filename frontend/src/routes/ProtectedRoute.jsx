import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, token, loading } = useAuth();

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading session...</div>;
    }

    // If not logged in or missing token, redirect to login
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // If roles are specified, verify if user's role is allowed
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
        if (user.role === 'Teacher') return <Navigate to="/teacher/dashboard" replace />;
        if (user.role === 'Student') return <Navigate to="/student/dashboard" replace />;
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;