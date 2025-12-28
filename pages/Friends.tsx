import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ASSETS } from '../constants';
import { toast } from 'sonner';
import { useSocial } from '../context/SocialContext';
import PrivacySettingsModal from '../components/PrivacySettingsModal';
import { useAllianceRanking } from '../hooks/useAllianceRanking';
import SquadSelector from '../components/SquadSelector';
import StreakBadge from '../components/StreakBadge';
import HackerPresence from '../components/HackerPresence';
import KnowledgeFeed from '../components/Social/KnowledgeFeed';
import ReputationDisplay from '../components/Social/ReputationDisplay';
import DuelCard from '../components/Social/DuelCard';
import CommunityList from '../components/Social/CommunityList';

// Classic Orkut/MSN Vibe Constants
const QUOTES = [
    "There is no patch for human stupidity.",
    "It's not a bug, it's a feature.",
    "Hacking is the art of creative problem solving.",
    "Dance like nobody is watching. Encrypt like everyone is.",
    "Social Engineering: Because there is no patch for human stupidity.",
    "I read your email.",
    "Admin is watching you.",
];

const STATUS_OPTIONS = [
    { id: 'online', label: 'Online', color: 'bg-green-500' },
    { id: 'busy', label: 'Busy', color: 'bg-red-500' },
    { id: 'away', label: 'Away', color: 'bg-yellow-500' },
    { id: 'offline', label: 'Invisible', color: 'bg-gray-500' },
];

const Friends: React.FC = () => {
    const navigate = useNavigate();
    const { openChat, onlineUsers, updateStatus, currentUserStatus } = useSocial();
    const [activeTab, setActiveTab] = useState<'Knowledge' | 'Network' | 'Alliance' | 'Duels'>('Knowledge'); // Knowledge tab is now 'Activity'
    const [networkMode, setNetworkMode] = useState<'friends' | 'find' | 'requests'>('friends'); // Sub-state for Network tab

    // ... (existing state)

    // ... inside render tabs ...

    const [friends, setFriends] = useState<any[]>([]);
    const [visitors, setVisitors] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [currentProfile, setCurrentProfile] = useState<any>(null);
    const [fortune] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [privacyOpen, setPrivacyOpen] = useState(false);
    const [statusMenuOpen, setStatusMenuOpen] = useState(false);
    const [squadSelectorOpen, setSquadSelectorOpen] = useState(false);
    const [selectedSquad, setSelectedSquad] = useState<string>('Void');
    const [timeFilter, setTimeFilter] = useState<'weekly' | 'all'>('all');

    // Alliance Ranking (dados reais)
    const { ranking: allianceRanking, loading: rankingLoading } = useAllianceRanking(currentUser?.id, timeFilter);

    const [duels, setDuels] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setCurrentUser(user);

            // Fetch full profile for current user to get short_id
            const { data: myProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            setCurrentProfile(myProfile);

            // 1. Fetch Friends & Requests
            const { data: friendships, error: fErr } = await supabase
                .from('friendships')
                .select(`
                    id, status,
                    user:user_id(id, username, full_name, avatar_url, role, skills, short_id, score, stats),
                    friend:friend_id(id, username, full_name, avatar_url, role, skills, short_id, score, stats)
                `)
                .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

            if (fErr) throw fErr;

            const accepted: any[] = [];
            const pending: any[] = [];

            (friendships || []).forEach((f: any) => {
                const isMe = f.user.id === user.id;
                const profile = isMe ? f.friend : f.user;
                const item = { ...profile, friendship_id: f.id };

                if (f.status === 'accepted') accepted.push(item);
                else if (f.status === 'pending' && !isMe) pending.push(item);
            });
            setFriends(accepted);
            setRequests(pending);

            // 2. Fetch Visitors
            const { data: visitLogs } = await supabase
                .from('profile_visits')
                .select(`
                    visited_at,
                    visitor:visitor_id(id, username, full_name, avatar_url, role, focus_areas, short_id)
                `)
                .eq('visited_id', user.id)
                .order('visited_at', { ascending: false })
                .limit(9); // 3x3 Grid usually

            const uniqueVisits = Array.from(new Map((visitLogs || []).map((v: any) => {
                const vis = Array.isArray(v.visitor) ? v.visitor[0] : v.visitor;
                if (!vis || !vis.id) return [null, null]; // Skip invalid entries
                return [vis.id, { ...vis, visited_at: v.visited_at }];
            })).values()).filter(v => v !== null); // Remove null entries

            setVisitors(uniqueVisits);

            // 3. Fetch Active Duels
            const { data: activeDuels } = await supabase
                .from('duels')
                .select(`*, challenger:challenger_id(username, full_name, short_id)`)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });
            setDuels(activeDuels || []);

        } catch (error: any) {
            console.error('Data load error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: 'accept' | 'remove', id: string) => {
        if (action === 'remove' && !confirm('Sever connection?')) return;
        try {
            if (action === 'accept') {
                await supabase.from('friendships').update({ status: 'accepted' }).eq('id', id);
                toast.success('Ally added.');
            } else if (action === 'remove') {
                await supabase.from('friendships').delete().eq('id', id);
                toast.success('Connection severed.');
            }
            loadData();
        } catch (e) { toast.error('Action failed'); }
    };

    const triggerBuzz = async (targetUserId: string) => {
        if (!currentUser) return;
        const { error } = await supabase.from('direct_messages').insert({
            sender_id: currentUser.id,
            receiver_id: targetUserId,
            content: '⚡ NUDGE',
            is_nudge: true
        });
        if (!error) toast.success('Buzz sent!');
    };

    // --- Search Logic ---
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            // Check if input is UUID
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(searchQuery);
            const isShortId = /^\d{5}$/.test(searchQuery);

            let query = supabase.from('profiles').select('*').neq('id', currentUser.id);

            if (isUUID) {
                query = query.eq('id', searchQuery);
            } else if (isShortId) {
                query = query.eq('short_id', searchQuery);
            } else {
                query = query.ilike('username', `%${searchQuery}%`);
            }

            const { data } = await query;
            setSearchResults(data || []);
        } catch (e) { toast.error('Search failed'); }
        finally { setSearching(false); }
    };

    const sendRequest = async (targetId: string) => {
        try {
            // Check existing
            const { data } = await supabase.from('friendships').select('*')
                .or(`and(user_id.eq.${currentUser.id},friend_id.eq.${targetId}),and(user_id.eq.${targetId},friend_id.eq.${currentUser.id})`);

            if (data && data.length > 0) {
                toast.error('You are already connected or request is pending.');
                return;
            }

            const { error } = await supabase.from('friendships').insert({
                user_id: currentUser.id,
                friend_id: targetId,
                status: 'pending'
            });

            if (error) throw error;
            toast.success('Friend request sent!');
            loadData(); // Refresh to possibly show pending update if we change UI logic later
        } catch (e) {
            console.error(e);
            toast.error('Failed to send request');
        }
    };


    // Derived State
    const activeFriends = friends.map(f => {
        const presence = onlineUsers.get(f.id);
        return {
            ...f,
            status: presence?.status || 'offline',
            is_online: presence?.status && presence.status !== 'offline'
        };
    });
    const onlineFriends = activeFriends.filter(f => f.is_online);

    const getProfileLink = (u: any) => `/profile/${u.short_id || u.username || u.id}`;

    // Squad/Faction assignment (minimal colors)
    const getSquadName = (u: any) => {
        const hash = (u.id || '').charCodeAt(0) % 4;
        const squads = ['Void', 'Shadow', 'Cipher', 'Ghost'];
        const colors = ['text-white/50', 'text-gray-500', 'text-white/40', 'text-gray-400'];
        return { name: squads[hash], color: colors[hash] };
    };

    return (
        <div className="max-w-[1200px] mx-auto p-4 md:p-8 font-sans">
            {/* Top Breadcrumb / Status */}
            <div className="flex items-center gap-2 text-xs text-text-muted mb-4 uppercase tracking-wider">
                <span className="text-accent-purple font-bold">xack</span>
                <span>/</span>
                <span className="text-white">network</span>
                <span>/</span>
                <span>home</span>
            </div>

            <div className="grid grid-cols-12 gap-6">

                {/* LEFT COLUMN: Profile & Stat Bars */}
                <div className="col-span-12 md:col-span-3 space-y-4">
                    <div className="bg-[#161718] p-4 rounded-none border border-white/10 shadow-lg">
                        <div className="aspect-square w-full mb-3 border-2 border-accent-purple/30 p-1.5 bg-gradient-to-br from-accent-purple/10 to-transparent relative shadow-lg">
                            <img src={currentProfile?.avatar_url || currentUser?.user_metadata?.avatar_url || ASSETS.creatorPhoto} className="w-full h-full object-cover border border-white/10" />

                            {/* Status Selector Trigger */}
                            <div className="absolute bottom-2 right-2">
                                <div className="relative">
                                    <button
                                        onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                                        className={`w-4 h-4 rounded-full border-2 border-[#161718] hover:scale-110 transition-transform cursor-pointer shadow-lg
                                            ${currentUserStatus === 'online' ? 'bg-green-500' : currentUserStatus === 'busy' ? 'bg-red-500' : currentUserStatus === 'away' ? 'bg-yellow-500' : 'bg-gray-500'}
                                        `}
                                        title={`Status: ${currentUserStatus.toUpperCase()}`}
                                    />

                                    {/* Status Menu */}
                                    {statusMenuOpen && (
                                        <div className="absolute bottom-full right-0 mb-2 w-32 bg-[#161718] border border-white/20 rounded shadow-xl py-1 z-20">
                                            {STATUS_OPTIONS.map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => {
                                                        updateStatus(opt.id as any);
                                                        setStatusMenuOpen(false);
                                                    }}
                                                    className="w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center gap-2 text-xs text-white"
                                                >
                                                    <div className={`w-2 h-2 rounded-full ${opt.color}`} />
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <h2 className="text-white font-bold text-lg leading-tight mb-1">{currentProfile?.full_name || currentUser?.user_metadata?.full_name || 'Agent'}</h2>
                        <div className="text-xs text-accent-purple font-mono mb-4 flex items-center gap-1">
                            ID: {currentProfile?.short_id || 'UNKNOWN'}
                            <button onClick={() => navigator.clipboard.writeText(currentProfile?.short_id)} className="text-white/20 hover:text-white" title="Copy ID">
                                <span className="material-symbols-outlined text-[10px]">content_copy</span>
                            </button>
                        </div>

                        {/* Reputation / Specializations */}
                        {currentProfile?.reputation && (
                            <ReputationDisplay reputation={currentProfile.reputation} />
                        )}
                        {!currentProfile?.reputation && (
                            <div className="text-text-muted text-[10px] italic mb-6">No reputation data yet.</div>
                        )}

                        {/* Mini Menu */}
                        <div className="space-y-1 text-xs border-t border-white/10 pt-4">
                            <button onClick={() => navigate(getProfileLink(currentProfile || {}))} className="block text-accent-purple hover:underline hover:text-white transition-colors">Edit Profile</button>
                            <button className="block text-text-muted hover:underline hover:text-white transition-colors">My Friends ({friends.length})</button>
                            <button className="block text-text-muted hover:underline hover:text-white transition-colors">My Photos</button>
                            <button className="block text-text-muted hover:underline hover:text-white transition-colors" onClick={() => setPrivacyOpen(true)}>Privacy Settings</button>
                        </div>
                    </div>
                </div>

                {/* CENTER COLUMN: Main Content / Tabs */}
                <div className="col-span-12 md:col-span-6 space-y-4">
                    {/* Welcome / Fortune Box */}
                    <div className="bg-[#161718] p-4 border border-white/10 mb-4">
                        <h3 className="text-white font-bold text-sm mb-1">Welcome back, {currentProfile?.full_name?.split(' ')[0] || currentUser?.user_metadata?.full_name?.split(' ')[0] || 'Operative'}.</h3>
                        <p className="text-accent-purple text-xs italic">" {fortune} "</p>
                    </div>

                    <div className="flex gap-1 border-b border-white/10 pb-0 overflow-x-auto custom-scrollbar">
                        <button
                            onClick={() => setActiveTab('Alliance')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-lg border-t border-x border-transparent hover:bg-white/5 flex items-center gap-2 ${activeTab === 'Alliance' ? 'bg-[#161718] border-white/10 text-yellow-500 border-b-[#161718] mb-[-1px]' : 'text-text-muted'}`}
                        >
                            <span className="material-symbols-outlined text-sm">trophy</span> Alliance
                        </button>
                        <button
                            onClick={() => setActiveTab('Knowledge')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-lg border-t border-x border-transparent hover:bg-white/5 flex items-center gap-2 ${activeTab === 'Knowledge' ? 'bg-[#161718] border-white/10 text-accent-purple border-b-[#161718] mb-[-1px]' : 'text-text-muted'}`}
                        >
                            <span className="material-symbols-outlined text-sm">rss_feed</span> Activity
                        </button>
                        <button
                            onClick={() => setActiveTab('Duels')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-lg border-t border-x border-transparent hover:bg-white/5 flex items-center gap-2 ${activeTab === 'Duels' ? 'bg-[#161718] border-white/10 text-red-500 border-b-[#161718] mb-[-1px]' : 'text-text-muted'}`}
                        >
                            <span className="material-symbols-outlined text-sm">swords</span> Duels
                        </button>
                        <button
                            onClick={() => setActiveTab('Network')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-lg border-t border-x border-transparent hover:bg-white/5 flex items-center gap-2 ${activeTab === 'Network' ? 'bg-[#161718] border-white/10 text-white border-b-[#161718] mb-[-1px]' : 'text-text-muted'}`}
                        >
                            <span className="material-symbols-outlined text-sm">hub</span> Network
                            {requests.length > 0 && <span className="bg-accent-purple text-white text-[9px] px-1.5 rounded-full">{requests.length}</span>}
                        </button>
                    </div>

                    <div className="bg-[#161718] p-6 border border-white/10 min-h-[400px]">

                        {/* KNOWLEDGE FEED (ACTIVITY) */}
                        {activeTab === 'Knowledge' && (
                            <KnowledgeFeed />
                        )}

                        {/* DUELS TAB */}
                        {activeTab === 'Duels' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-white text-sm font-bold uppercase">Active Duels</h4>
                                    <button className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 text-xs font-bold uppercase rounded transition-all">
                                        Create Duel
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {duels.length === 0 ? (
                                        <div className="col-span-2 text-center py-10 text-white/30 text-xs border border-dashed border-white/10 rounded">
                                            No active duels found. Be the challenger.
                                        </div>
                                    ) : (
                                        duels.map(duel => (
                                            <DuelCard
                                                key={duel.id}
                                                type={duel.type}
                                                title={duel.title || 'Unknown Challenge'}
                                                challenger={duel.challenger?.username || 'Unknown'}
                                                reward={`+${duel.reward_xp || 0} XP`}
                                                timeLeft={duel.expires_at ? new Date(duel.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unlimited'}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ALLIANCE RANKING */}
                        {activeTab === 'Alliance' && (
                            <div className="space-y-6">
                                {/* Alliance Header */}
                                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-accent-purple">military_tech</span>
                                        <h3 className="text-white font-bold text-sm uppercase tracking-wider">Alliance Ranking</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Time Filter */}
                                        <div className="flex bg-black/40 border border-white/10">
                                            <button
                                                onClick={() => setTimeFilter('all')}
                                                className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider transition-all ${timeFilter === 'all' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
                                                    }`}
                                            >
                                                All Time
                                            </button>
                                            <button
                                                onClick={() => setTimeFilter('weekly')}
                                                className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider transition-all ${timeFilter === 'weekly' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
                                                    }`}
                                            >
                                                Weekly
                                            </button>
                                        </div>
                                        {/* Squad Selector */}
                                        {currentProfile && (
                                            <SquadSelector
                                                userId={currentUser?.id || ''}
                                                currentSquad={currentProfile.squad || 'Void'}
                                                onSquadChange={loadData}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Stats Header */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-black/40 border border-white/10 p-4">
                                        <div className="text-white/40 text-[10px] font-mono uppercase tracking-widest mb-1">Top Agent</div>
                                        <div className="text-white text-lg font-black truncate">
                                            {rankingLoading ? '...' : (allianceRanking[0]?.full_name || 'None')}
                                        </div>
                                        <div className="text-white/20 text-[9px] font-mono mt-1">WEEKLY RESET: 2D</div>
                                    </div>
                                    <div className="bg-black/40 border border-white/10 p-4">
                                        <div className="text-white/40 text-[10px] font-mono uppercase tracking-widest mb-1">Operatives</div>
                                        <div className="text-white text-lg font-black">
                                            {rankingLoading ? '...' : allianceRanking.length}
                                        </div>
                                        <div className="text-white/20 text-[9px] font-mono mt-1">GLOBAL RANK: #42</div>
                                    </div>
                                </div>

                                {/* Leaderboard Header */}
                                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                    <h4 className="text-white/60 text-xs font-mono uppercase tracking-wider">Ranking</h4>
                                    <div className="text-[9px] text-white/30 flex gap-4 font-mono uppercase">
                                        <span className="w-8 text-center">FLG</span>
                                        <span className="w-10 text-center">SYS</span>
                                        <span className="w-8 text-center">BLD</span>
                                        <span className="w-10 text-right">PTS</span>
                                    </div>
                                </div>

                                {/* Ranking List */}
                                <div className="space-y-1">
                                    {rankingLoading ? (
                                        <div className="text-center py-8 text-white/30 text-sm">Loading ranking...</div>
                                    ) : allianceRanking.length === 0 ? (
                                        <div className="text-center py-8 text-white/30 text-sm">No operatives in alliance yet.</div>
                                    ) : (
                                        allianceRanking.map((u, idx) => {
                                            const squad = { name: u.squad, color: 'text-white/50' };
                                            return (
                                                <div key={u.id} className={`flex items-center gap-3 p-2.5 border transition-all group ${u.is_me ? 'bg-white/5 border-white/10' : 'bg-transparent border-white/5 hover:border-white/10'}`}>
                                                    <div className={`font-mono text-sm font-bold w-6 text-center ${idx === 0 ? 'text-white' : 'text-white/20'}`}>
                                                        {idx + 1}
                                                    </div>

                                                    <div className="relative cursor-pointer" onClick={() => navigate(getProfileLink(u))}>
                                                        <img src={u.avatar_url || ASSETS.creatorPhoto} className="w-9 h-9 object-cover border border-white/10 opacity-80 group-hover:opacity-100 transition-opacity" />
                                                        {onlineUsers.has(u.id) && (
                                                            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border border-black rounded-full`} />
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="text-sm font-bold truncate text-white/90 cursor-pointer hover:text-white transition-colors"
                                                                onClick={() => navigate(getProfileLink(u))}
                                                            >
                                                                {u.full_name || 'Agent'}
                                                            </span>
                                                            <span className="text-[8px] px-1 py-0.5 border border-white/5 uppercase font-mono text-white/50 bg-black/20">
                                                                {squad.name}
                                                            </span>
                                                        </div>
                                                        <div className="text-[9px] text-white/20 font-mono truncate">
                                                            ACTIVE
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-4 text-[11px] font-mono text-white/40 text-right">
                                                        <div className="w-8 text-center" title="Flags">{u.stats?.flags || 0}</div>
                                                        <div className="w-10 text-center" title="Systems">{u.stats?.machines || 0}</div>
                                                        <div className="w-8 text-center flex items-center justify-center gap-1" title="First Blood">
                                                            {u.stats?.first_bloods > 0 && (
                                                                <span className="text-accent-purple text-sm">⚡</span>
                                                            )}
                                                            {u.stats?.first_bloods || 0}
                                                        </div>
                                                        <div className="w-10 text-right font-black text-white text-sm">{u.score || 0}</div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}

                        {/* NETWORK TAB (Consolidated) */}
                        {activeTab === 'Network' && (
                            <div className="space-y-6">
                                {/* Network Sub-Navigation */}
                                <div className="flex items-center gap-2 mb-4">
                                    <button
                                        onClick={() => setNetworkMode('friends')}
                                        className={`px-3 py-1 text-xs font-bold uppercase rounded transition-all ${networkMode === 'friends' ? 'bg-white text-black' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
                                    >
                                        My Allies ({friends.length})
                                    </button>
                                    <button
                                        onClick={() => setNetworkMode('find')}
                                        className={`px-3 py-1 text-xs font-bold uppercase rounded transition-all ${networkMode === 'find' ? 'bg-accent-purple text-white' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
                                    >
                                        Find Operatives
                                    </button>
                                    <button
                                        onClick={() => setNetworkMode('requests')}
                                        className={`px-3 py-1 text-xs font-bold uppercase rounded transition-all ${networkMode === 'requests' ? 'bg-blue-500 text-white' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
                                    >
                                        Requests {requests.length > 0 && `(${requests.length})`}
                                    </button>
                                </div>

                                {/* MODE: FRIENDS LIST */}
                                {networkMode === 'friends' && (
                                    <div className="space-y-3">
                                        {activeFriends.map(f => (
                                            <div key={f.id} className="flex items-start gap-4 p-3 bg-black/20 border border-white/5 hover:border-accent-purple/30 group transition-all">
                                                <div className="relative cursor-pointer" onClick={() => navigate(getProfileLink(f))}>
                                                    <img src={f.avatar_url || ASSETS.creatorPhoto} className="w-12 h-12 object-cover border border-white/10" />
                                                    {/* Status Indicator */}
                                                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-[#161718] rounded-full 
                                                        ${f.status === 'online' ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' :
                                                            f.status === 'busy' ? 'bg-red-500' :
                                                                f.status === 'away' ? 'bg-yellow-500' : 'bg-transparent border-white/10'}`}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between">
                                                        <h5 className="text-white text-sm font-bold truncate hover:underline cursor-pointer" onClick={() => navigate(getProfileLink(f))}>{f.full_name}</h5>
                                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => openChat(f.id)} className="text-text-muted hover:text-white" title="Message"><span className="material-symbols-outlined text-base">chat</span></button>
                                                            <button onClick={() => triggerBuzz(f.id)} className="text-text-muted hover:text-yellow-400" title="Nudge"><span className="material-symbols-outlined text-base">bolt</span></button>
                                                            <button onClick={() => handleAction('remove', f.friendship_id)} className="text-text-muted hover:text-red-500" title="Remove"><span className="material-symbols-outlined text-base">close</span></button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="text-[10px] text-text-muted uppercase tracking-wider">ID: {f.short_id || f.username || 'N/A'}</div>
                                                        {f.is_online && (
                                                            <span className={`text-[9px] px-1.5 py-0.5 border rounded font-bold uppercase tracking-wider
                                                                ${f.status === 'online' ? 'bg-green-500/10 text-green-500 border-green-500/30' :
                                                                    f.status === 'busy' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                                                                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'}`}>
                                                                {f.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-[10px] text-white/50 bg-white/5 inline-block px-1.5 py-0.5 rounded">
                                                            {(f.skills || [])[0]?.name || 'Netrunner'}
                                                        </div>
                                                        {f.streaks?.current_streak > 0 && (
                                                            <StreakBadge currentStreak={f.streaks.current_streak} longestStreak={f.streaks.longest_streak} size="sm" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {friends.length === 0 && <div className="text-text-muted text-xs italic text-center py-10">No friends connected. Switch to 'Find Operatives' to expand your network.</div>}
                                    </div>
                                )}

                                {/* MODE: FIND OPERATIVES */}
                                {networkMode === 'find' && (
                                    <div className="space-y-6">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Search by ID (e.g. 51823) or Username..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                                className="flex-1 bg-black/30 border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-accent-purple rounded"
                                            />
                                            <button
                                                onClick={handleSearch}
                                                disabled={searching}
                                                className="bg-accent-purple text-white px-6 py-2 text-sm font-bold uppercase rounded hover:brightness-110 disabled:opacity-50"
                                            >
                                                {searching ? 'Scanning...' : 'Search'}
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            {searchResults.map(user => {
                                                const isFriend = friends.some(f => f.id === user.id);
                                                const isSelf = user.id === currentUser?.id;

                                                return (
                                                    <div key={user.id} className="flex items-center justify-between p-3 bg-black/20 border border-white/5 hover:border-white/10 transition-all">
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <img
                                                                src={user.avatar_url || ASSETS.creatorPhoto}
                                                                className="w-10 h-10 object-cover border border-white/10 cursor-pointer hover:border-accent-purple transition-all"
                                                                onClick={() => navigate(getProfileLink(user))}
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <div
                                                                    className="text-white text-sm font-bold hover:text-accent-purple cursor-pointer transition-colors truncate"
                                                                    onClick={() => navigate(getProfileLink(user))}
                                                                >
                                                                    {user.full_name || user.username}
                                                                </div>
                                                                <div className="text-[10px] text-text-muted truncate max-w-[200px]">ID: <span className="text-accent-purple">{user.short_id || user.id}</span></div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            {isSelf ? (
                                                                <span className="text-xs text-text-muted italic">You</span>
                                                            ) : isFriend ? (
                                                                <span className="text-xs text-status-green font-bold uppercase">Connected</span>
                                                            ) : (
                                                                <button
                                                                    onClick={() => sendRequest(user.id)}
                                                                    className="px-3 py-1 bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase hover:bg-white/10"
                                                                >
                                                                    Add Friend
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {searchResults.length === 0 && searchQuery && !searching && (
                                                <div className="text-text-muted text-xs italic text-center py-4">No operatives found.</div>
                                            )}
                                            {!searchQuery && searchResults.length === 0 && (
                                                <div className="text-text-muted text-xs italic text-center py-4 text-white/20">
                                                    Enter coordinates to locate operatives.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {/* MODE: REQUESTS */}
                                {networkMode === 'requests' && (
                                    <div className="space-y-4">
                                        <h4 className="text-white text-sm font-bold uppercase mb-4">Pending Requests</h4>
                                        {requests.map(req => (
                                            <div key={req.id} className="flex items-center justify-between p-3 bg-black/20 border border-white/5 hover:border-white/10 transition-all">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <img
                                                        src={req.avatar_url || ASSETS.creatorPhoto}
                                                        className="w-10 h-10 object-cover cursor-pointer border border-white/10 hover:border-accent-purple transition-all"
                                                        onClick={() => navigate(getProfileLink(req))}
                                                        title="View profile"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div
                                                            className="text-white text-sm font-bold hover:text-accent-purple cursor-pointer transition-colors truncate"
                                                            onClick={() => navigate(getProfileLink(req))}
                                                            title="View profile"
                                                        >
                                                            {req.full_name}
                                                        </div>
                                                        <div className="text-[10px] text-accent-purple">Wants to be your friend</div>
                                                        <div className="text-[10px] text-text-muted">ID: {req.short_id || req.username || 'N/A'}</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleAction('accept', req.friendship_id)} className="px-3 py-1 bg-accent-purple text-white text-[10px] font-bold uppercase hover:brightness-110">Accept</button>
                                                    <button onClick={() => handleAction('remove', req.friendship_id)} className="px-3 py-1 bg-white/10 text-text-muted text-[10px] font-bold uppercase hover:bg-white/20">Ignore</button>
                                                </div>
                                            </div>
                                        ))}
                                        {requests.length === 0 && <div className="text-text-muted text-xs italic text-center py-10">No pending requests.</div>}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>

                {/* RIGHT COLUMN: The "Grids" (Friends 3x3 + Visitors) */}
                <div className="col-span-12 md:col-span-3 space-y-6">

                    {/* FRIENDS GRID BOX */}
                    <div>
                        <div className="flex justify-between items-baseline mb-2 px-1">
                            <h3 className="text-accent-purple px-1 font-bold text-xs uppercase tracking-widest">My Friends ({friends.length})</h3>
                            <button onClick={() => setActiveTab('Network')} className="text-[10px] text-text-muted hover:text-white hover:underline">view all</button>
                        </div>
                        <div className="bg-[#161718] p-3 border border-white/10">
                            <div className="grid grid-cols-3 gap-2">
                                {friends.slice(0, 9).map(f => (
                                    <div key={f.id} className="aspect-square bg-black relative cursor-pointer group" onClick={() => navigate(getProfileLink(f))}>
                                        <img src={f.avatar_url || ASSETS.creatorPhoto} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        {/* Status Dot */}
                                        <div className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full border border-black 
                                            ${f.status === 'online' ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' :
                                                f.status === 'busy' ? 'bg-red-500' :
                                                    f.status === 'away' ? 'bg-yellow-500' : 'bg-transparent'}`}
                                        />

                                        <div className="absolute inset-x-0 bottom-0 bg-black/70 text-[8px] text-white text-center truncate px-0.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {f.username || 'User'}
                                        </div>
                                    </div>
                                ))}
                                {/* Fill empty slots to keep 3x3 if needed, or just let it flow */}
                                {friends.length < 9 && Array.from({ length: 9 - friends.length }).map((_, i) => (
                                    <div key={i} className="aspect-square bg-white/5 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white/10 text-sm">person</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* VISITORS GRID BOX */}
                    <div>
                        <div className="flex justify-between items-baseline mb-2 px-1">
                            <h3 className="text-accent-purple px-1 font-bold text-xs uppercase tracking-widest">Recent Visitors</h3>
                            <button className="text-[10px] text-text-muted hover:text-white hover:underline">view all</button>
                        </div>
                        <div className="bg-[#161718] p-3 border border-white/10">
                            <div className="space-y-3">
                                {visitors.slice(0, 5).map(v => {
                                    if (!v || !v.id) return null;
                                    return (
                                        <div key={v.id} className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate(getProfileLink(v))}>
                                            <img src={v.avatar_url || ASSETS.creatorPhoto} className="w-8 h-8 object-cover border border-white/10" />
                                            <div className="min-w-0">
                                                <div className="text-white text-[10px] font-bold hover:underline truncate">{v.full_name}</div>
                                                <div className="text-[9px] text-text-muted">{new Date(v.visited_at).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {visitors.length === 0 && <div className="text-text-muted text-[10px] italic text-center py-4">No recent signals.</div>}
                            </div>
                        </div>
                    </div>

                    {/* COMMUNITIES BOX */}
                    <CommunityList />
                </div>

            </div>

            <style>{`
                .pixelated-border {
                    clip-path: polygon(
                        0px 0px, 
                        100% 0px, 
                        100% 100%, 
                        0px 100%
                    );
                }
            `}</style>
            {/* Privacy Modal */}
            <PrivacySettingsModal
                isOpen={privacyOpen}
                onClose={() => setPrivacyOpen(false)}
                currentSettings={currentProfile?.privacy_settings || {}}
                onUpdate={loadData}
            />
        </div>
    );
};

export default Friends;
