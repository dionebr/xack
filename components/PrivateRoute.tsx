import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute: React.FC = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    // Basic check: Token and User must exist in localStorage
    // Advanced check (TODO): Verify token expiration or validate with backend /api/me
    // For now, this prevents simple access to internal routes without login
    if (!token || !user) {
        // Clear potentially partial data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
