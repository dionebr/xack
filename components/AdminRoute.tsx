import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface AdminRouteProps {
    children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setIsAdmin(false);
                return;
            }

            // GOD MODE: Dione is Master Admin
            if (user.email === 'dione@xack.com') {
                console.log('[AdminRoute] Access Granted: Master Admin Override');
                setIsAdmin(true);
                return;
            }

            // Check app_metadata for admin flag
            const isAdm = user.app_metadata?.admin === true;
            console.log('[AdminRoute] User:', user.email, 'Is Admin:', isAdm, 'Metadata:', user.app_metadata);
            setIsAdmin(isAdm);

            if (!isAdm) {
                toast.error("UNAUTHORIZED ACCESS DETECTED: Incident Logged.");
            }
        };
        checkAdmin();
    }, []);

    if (isAdmin === null) {
        return <div className="h-screen w-full bg-black flex items-center justify-center text-green-500 font-mono animate-pulse">VERIFYING CLEARANCE...</div>;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;
