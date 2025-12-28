import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase.rpc('get_users');
            if (error) throw error;
            setUsers(data || []);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load operatives database");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-white font-sans p-10">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
                <div>
                    <Link to="/admin" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Dashboard
                    </Link>
                    <h1 className="text-3xl font-black uppercase tracking-widest">Operatives Database</h1>
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-black/40 rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                            <th className="p-4">Operative ID</th>
                            <th className="p-4">Email / Identity</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Last Active</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm font-mono">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4 text-gray-500 font-xs">{user.id}</td>
                                <td className="p-4 text-white font-bold flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    {user.email}
                                </td>
                                <td className="p-4">
                                    {user.is_admin === 'true' ? (
                                        <span className="bg-red-900/40 text-red-400 border border-red-900 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Admin</span>
                                    ) : (
                                        <span className="bg-blue-900/40 text-blue-400 border border-blue-900 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">User</span>
                                    )}
                                </td>
                                <td className="p-4 text-gray-400">
                                    {new Date(user.last_sign_in_at).toLocaleString()}
                                </td>
                                <td className="p-4 text-right">
                                    <button className="text-gray-500 hover:text-red-500 transition-colors uppercase text-[10px] font-bold tracking-widest mr-4">
                                        Reset PWD
                                    </button>
                                    <button className="text-gray-500 hover:text-red-500 transition-colors uppercase text-[10px] font-bold tracking-widest">
                                        Ban
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && !loading && (
                    <div className="p-10 text-center text-gray-500">No operatives found in registry.</div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
