import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        pendingReports: 0,
        totalUsers: 0,
        totalCommunities: 0,
        activeMachines: 5 // Mock
    });
    const [loading, setLoading] = useState(true);

    const isMasterUser = user?.email === 'dione@xack.com';

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Count pending reports
            const { count: reportCount } = await supabase
                .from('reports')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            // Count communities
            const { count: communityCount } = await supabase
                .from('communities')
                .select('*', { count: 'exact', head: true });


            setStats({
                pendingReports: reportCount || 0,
                totalUsers: 42, // Still mock until better access
                totalCommunities: communityCount || 0,
                activeMachines: 5
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-bg-main text-white font-sans p-8">
            {/* BACKGROUND VFX */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-purple/20 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full mix-blend-screen" />
            </div>

            {/* TOP BAR */}
            <div className="relative z-10 flex justify-between items-center mb-12 border-b border-white/10 pb-6">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-black border border-accent-purple shadow-[0_0_20px_rgba(185,70,233,0.3)] flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-accent-purple">admin_panel_settings</span>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                            XACK <span className="text-accent-purple">MASTER CONTROL</span>
                        </h1>
                        <div className="flex items-center gap-2 text-xs font-mono text-text-muted uppercase tracking-widest mt-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            System Operational • v2.1.0 • {new Date().toLocaleDateString()}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="text-right hidden md:block">
                        <div className="text-[10px] uppercase text-text-muted tracking-widest mb-1">Authenticated Identity</div>
                        {isMasterUser ? (
                            <div className="font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-white animate-pulse">
                                DIONE // OVERLORD
                            </div>
                        ) : (
                            <div className="font-bold text-white text-lg">ADMIN USER</div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Link to="/dashboard" className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">rocket_launch</span>
                            Platform
                        </Link>
                        <button onClick={handleLogout} className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">power_settings_new</span>
                            Terminate
                        </button>
                    </div>
                </div>
            </div>

            {/* WELCOME SECTION */}
            {isMasterUser && (
                <div className="relative z-10 mb-12 transform hover:scale-[1.01] transition-transform duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-purple/20 to-transparent blur-xl opacity-50"></div>
                    <div className="bg-gradient-to-r from-[#2a1b35] to-black border-l-4 border-accent-purple p-8 rounded-r-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold text-white mb-2">Welcome back, Sir.</h2>
                            <p className="text-white/60 max-w-2xl text-sm leading-relaxed">
                                The grid is stable. User growth is within projected parameters.
                                We have <span className="text-white font-bold">{stats.pendingReports} new items</span> requiring your authorization in the queue.
                                Your infrastructure is operating at peak efficiency.
                            </p>
                        </div>
                        <span className="material-symbols-outlined absolute right-10 top-1/2 -translate-y-1/2 text-[120px] text-accent-purple opacity-5 rotate-12">
                            verified_user
                        </span>
                    </div>
                </div>
            )}

            {/* DASHBOARD GRID */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">

                {/* CARD 1: REPORTS */}
                <Link to="/admin/reports" className="group bg-[#161718] border border-white/5 p-6 hover:border-accent-purple/50 transition-all cursor-pointer relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-black border border-white/10 rounded group-hover:bg-accent-purple group-hover:text-white transition-colors text-text-muted">
                            <span className="material-symbols-outlined text-2xl">article</span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${stats.pendingReports > 0 ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                            {stats.pendingReports > 0 ? 'Requires Action' : 'All Clear'}
                        </span>
                    </div>
                    <div className="text-4xl font-black text-white mb-1">{stats.pendingReports}</div>
                    <div className="text-xs text-text-muted uppercase tracking-wider font-bold group-hover:text-white transition-colors">Intel Reports</div>

                    <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
                        <div className="h-full bg-accent-purple w-1/3 group-hover:w-full transition-all duration-500"></div>
                    </div>
                </Link>

                {/* CARD 2: USERS */}
                <Link to="/admin/users" className="group bg-[#161718] border border-white/5 p-6 hover:border-blue-500/50 transition-all cursor-pointer relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-black border border-white/10 rounded group-hover:bg-blue-500 group-hover:text-white transition-colors text-text-muted">
                            <span className="material-symbols-outlined text-2xl">group</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                            Active
                        </span>
                    </div>
                    <div className="text-4xl font-black text-white mb-1">{stats.totalUsers}</div>
                    <div className="text-xs text-text-muted uppercase tracking-wider font-bold group-hover:text-white transition-colors">Operatives</div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
                        <div className="h-full bg-blue-500 w-2/3 group-hover:w-full transition-all duration-500"></div>
                    </div>
                </Link>

                {/* CARD 3: COMMUNITIES */}
                <div className="group bg-[#161718] border border-white/5 p-6 hover:border-pink-500/50 transition-all cursor-pointer relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-black border border-white/10 rounded group-hover:bg-pink-500 group-hover:text-white transition-colors text-text-muted">
                            <span className="material-symbols-outlined text-2xl">hub</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-pink-500/20 text-pink-400">
                            Network
                        </span>
                    </div>
                    <div className="text-4xl font-black text-white mb-1">{stats.totalCommunities}</div>
                    <div className="text-xs text-text-muted uppercase tracking-wider font-bold group-hover:text-white transition-colors">Communities</div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
                        <div className="h-full bg-pink-500 w-1/2 group-hover:w-full transition-all duration-500"></div>
                    </div>
                </div>

                {/* CARD 4: SYSTEM */}
                <div className="group bg-[#161718] border border-white/5 p-6 hover:border-yellow-500/50 transition-all cursor-pointer relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-black border border-white/10 rounded group-hover:bg-yellow-500 group-hover:text-white transition-colors text-text-muted">
                            <span className="material-symbols-outlined text-2xl">dns</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
                            Stable
                        </span>
                    </div>
                    <div className="text-4xl font-black text-white mb-1">98%</div>
                    <div className="text-xs text-text-muted uppercase tracking-wider font-bold group-hover:text-white transition-colors">Sys Integrity</div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
                        <div className="h-full bg-yellow-500 w-full group-hover:w-full transition-all duration-500"></div>
                    </div>
                </div>

            </div>

            {/* LOGS MODULE */}
            <div className="border border-white/10 bg-black/50 p-6 relative">
                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">System Activity Log</h3>
                    <div className="flex gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    </div>
                </div>
                <div className="font-mono text-xs space-y-2 text-white/50 h-32 overflow-y-auto">
                    <div><span className="text-accent-purple">[22:45:12]</span> MASTER_OVERRIDE: User Dione initiated session.</div>
                    <div><span className="text-blue-500">[22:44:02]</span> AUTH_SERVICE: New operative registered. verification pending.</div>
                    <div><span className="text-green-500">[22:42:15]</span> CRON: Daily reputation sync completed.</div>
                    <div><span className="text-yellow-500">[22:40:01]</span> WARN: High traffic detected in sector 7 (Web Labs).</div>
                    <div><span className="text-white/30">[22:38:22]</span> SYSTEM: Backup procedure initiated...</div>
                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;
