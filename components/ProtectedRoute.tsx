import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-main flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-text-muted text-sm font-bold uppercase tracking-wider">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
