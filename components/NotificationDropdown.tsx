import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ASSETS } from '../constants';

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
    onAccept: () => void;
}

interface Notification {
    id: string;
    type: 'friend_request' | 'flag_submission' | 'community_request';
    user: any;
    data?: any;
    created_at: string;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose, userId, onAccept }) => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    // Declare functions first, before useEffects
    const loadNotifications = useCallback(async () => {
        if (!userId) return;
        setLoading(true);

        // Carregar IDs de notificações já vistas do localStorage
        const viewedKey = `viewed_notifications_${userId}`;
        const viewedIds = JSON.parse(localStorage.getItem(viewedKey) || '[]');

        // 1. Load friend requests
        const { data: requests } = await supabase
            .from('friendships')
            .select(`
                id,
                created_at,
                user:user_id(id, username, full_name, avatar_url, short_id)
            `)
            .eq('friend_id', userId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(5);

        // 2. Load recent flag submissions from friends
        const { data: friendships } = await supabase
            .from('friendships')
            .select('friend_id')
            .eq('user_id', userId)
            .eq('status', 'accepted');

        const friendIds = friendships?.map(f => f.friend_id) || [];

        const { data: solves } = await supabase
            .from('solves')
            .select(`
                id,
                submitted_at,
                flag_type,
                challenge_id,
                user:user_id(id, username, full_name, avatar_url, short_id)
            `)
            .in('user_id', friendIds)
            .order('submitted_at', { ascending: false })
            .limit(5);

        // 3. Load Community Join Requests (NEW)
        // First find communities where I am owner or moderator
        const { data: myManagedCommunities } = await supabase
            .from('community_members')
            .select('community_id')
            .eq('user_id', userId)
            .in('role', ['owner', 'moderator']);

        let communityRequests: any[] = [];

        if (myManagedCommunities && myManagedCommunities.length > 0) {
            const communityIds = myManagedCommunities.map(c => c.community_id);

            // Buscar apenas IDs de membros pendentes
            const { data: pendingMembers } = await supabase
                .from('community_members')
                .select('id, joined_at, community_id, user_id')
                .in('community_id', communityIds)
                .eq('status', 'pending')
                .order('joined_at', { ascending: false });

            if (pendingMembers && pendingMembers.length > 0) {
                // Buscar dados dos usuários
                const userIds = [...new Set(pendingMembers.map(m => m.user_id))];
                const { data: usersData } = await supabase
                    .from('profiles')
                    .select('id, username, full_name, avatar_url, short_id')
                    .in('id', userIds);

                // Buscar dados das comunidades
                const pendingCommunityIds = [...new Set(pendingMembers.map(m => m.community_id))];
                const { data: communitiesData } = await supabase
                    .from('communities')
                    .select('id, title')
                    .in('id', pendingCommunityIds);

                // Mapear por ID
                const usersMap = new Map(usersData?.map(u => [u.id, u]) || []);
                const communitiesMap = new Map(communitiesData?.map(c => [c.id, c]) || []);

                // Combinar tudo
                communityRequests = pendingMembers.map(member => ({
                    id: member.id,
                    joined_at: member.joined_at,
                    user: usersMap.get(member.user_id),
                    community: communitiesMap.get(member.community_id)
                }));
            }
        }

        // Combine and sort notifications
        const allNotifications: Notification[] = [
            ...(requests || []).map(r => ({
                id: r.id,
                type: 'friend_request' as const,
                user: r.user,
                created_at: r.created_at
            })),
            ...(solves || []).map(s => ({
                id: s.id,
                type: 'flag_submission' as const,
                user: s.user,
                data: { flag_type: s.flag_type, challenge_id: s.challenge_id },
                created_at: s.submitted_at
            })).filter(n => !viewedIds.includes(n.id)), // Filtrar notificações já vistas
            ...communityRequests.map(req => ({
                id: req.id,
                type: 'community_request' as const,
                user: req.user,
                data: { community: req.community },
                created_at: req.joined_at
            }))
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setNotifications(allNotifications.slice(0, 15)); // Increased limit
        setLoading(false);
    }, [userId]);

    const playBeep = () => {
        try {
            // Usar Web Audio API para criar um beep simples
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800; // Frequência em Hz
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (err) {
            console.error('Beep failed:', err);
        }
    };

    // Web Audio API para notificações com suporte a arquivo MP3
    const playNotificationSound = async () => {
        try {
            // Tentar tocar o arquivo MP3 primeiro se ele existir
            const audio = new Audio(ASSETS.notificationSound);
            audio.volume = 0.5;

            await audio.play().catch(e => {
                // Fallback para beep simples
                playBeep();
            });
        } catch (e) {
            playBeep();
        }
    };

    const subscribeToFlagSubmissions = useCallback(() => {
        if (!userId) return () => { };

        // Subscribe to relevant tables
        const channel = supabase
            .channel(`notifications_v3_${userId}`) // Unique channel per user/mount to avoid conflicts
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'solves'
            }, async (payload) => {
                playNotificationSound();

                // Buscar dados do usuário para adicionar instantaneamente
                const { data: userData } = await supabase
                    .from('profiles')
                    .select('id, username, full_name, avatar_url, short_id')
                    .eq('id', payload.new.user_id)
                    .single();

                if (userData) {
                    const newNotif: Notification = {
                        id: payload.new.id,
                        type: 'flag_submission',
                        user: userData,
                        data: {
                            flag_type: payload.new.flag_type,
                            challenge_id: payload.new.challenge_id
                        },
                        created_at: payload.new.submitted_at
                    };

                    setNotifications(prev => [newNotif, ...prev].slice(0, 15));
                }
            })
            // Subscribe to community join requests
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'community_members'
            }, async (payload) => {
                if (payload.new.status === 'pending') {
                    playNotificationSound();

                    // Buscar dados do usuário e comunidade
                    const [userResult, communityResult] = await Promise.all([
                        supabase
                            .from('profiles')
                            .select('id, username, full_name, avatar_url, short_id')
                            .eq('id', payload.new.user_id)
                            .single(),
                        supabase
                            .from('communities')
                            .select('id, title')
                            .eq('id', payload.new.community_id)
                            .single()
                    ]);

                    if (userResult.data && communityResult.data) {
                        const newNotif: Notification = {
                            id: payload.new.id,
                            type: 'community_request',
                            user: userResult.data,
                            data: { community: communityResult.data },
                            created_at: payload.new.joined_at
                        };

                        setNotifications(prev => [newNotif, ...prev].slice(0, 15));
                    }
                }
            })
            // Also listen for friend requests
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'friendships',
                filter: `friend_id=eq.${userId}`
            }, async (payload) => {
                playNotificationSound();

                // Buscar dados do usuário que enviou a solicitação
                const { data: userData } = await supabase
                    .from('profiles')
                    .select('id, username, full_name, avatar_url, short_id')
                    .eq('id', payload.new.user_id)
                    .single();

                if (userData) {
                    const newNotif: Notification = {
                        id: payload.new.id,
                        type: 'friend_request',
                        user: userData,
                        created_at: payload.new.created_at
                    };

                    setNotifications(prev => [newNotif, ...prev].slice(0, 15));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, loadNotifications]);

    // Now useEffects can safely reference the functions above
    // Subscribe to real-time events ALWAYS (when userId exists)
    useEffect(() => {
        if (!userId) return;

        const unsubscribe = subscribeToFlagSubmissions();
        return unsubscribe;
    }, [userId, subscribeToFlagSubmissions]);

    // Load notifications only when dropdown opens
    useEffect(() => {
        if (isOpen && userId) {
            loadNotifications();
        }
    }, [isOpen, userId, loadNotifications]);

    const handleAccept = async (friendshipId: string) => {
        await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId);
        loadNotifications();
        onAccept();
    };

    const handleIgnore = async (friendshipId: string) => {
        await supabase.from('friendships').delete().eq('id', friendshipId);
        loadNotifications();
        onAccept();
    };

    const handleCommunityAction = async (memberId: string, action: 'approve' | 'reject') => {
        if (action === 'approve') {
            await supabase.from('community_members').update({ status: 'approved' }).eq('id', memberId);
        } else {
            await supabase.from('community_members').delete().eq('id', memberId);
        }
        loadNotifications();
    };

    const getProfileLink = (user: any) => `/profile/${user.short_id || user.username || user.id}`;

    const getTimeAgo = (dateString: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    // if (!isOpen) return null; // REMOVED EARLY RETURN

    return (
        <>
            {/* Backdrop */}
            {isOpen && <div className="fixed inset-0 z-[999]" onClick={onClose} />}

            {/* Dropdown */}
            <div className={`absolute top-16 right-4 w-96 bg-bg-card rounded-xl shadow-2xl border border-white/10 overflow-hidden z-[1000] ${!isOpen ? 'hidden' : ''}`}>
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">NOTIFICATIONS</h3>
                    <div className="flex gap-2">
                        {notifications.some(n => n.type === 'flag_submission') && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Evitar que feche o dropdown

                                    // Salvar IDs das flag submissions no localStorage
                                    const viewedKey = `viewed_notifications_${userId}`;
                                    const currentViewed = JSON.parse(localStorage.getItem(viewedKey) || '[]');
                                    const flagSubmissionIds = notifications
                                        .filter(n => n.type === 'flag_submission')
                                        .map(n => n.id);
                                    const updatedViewed = [...new Set([...currentViewed, ...flagSubmissionIds])];
                                    localStorage.setItem(viewedKey, JSON.stringify(updatedViewed));

                                    // Filtrar apenas notificações que não são flag submissions
                                    setNotifications(prev => prev.filter(n => n.type !== 'flag_submission'));
                                }}
                                className="px-3 py-1 text-xs font-semibold text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded transition-all cursor-pointer"
                            >
                                Clear All
                            </button>
                        )}
                        <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-xl">close</span>
                        </button>
                    </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-text-muted text-sm">Loading...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-text-muted text-sm">No new notifications</div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {notifications.map(notif => {
                                const user = notif.user;

                                if (notif.type === 'community_request') {
                                    return (
                                        <div key={notif.id} className="p-4 hover:bg-white/5 transition-colors" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-start gap-3">
                                                <img
                                                    src={user.avatar_url || ASSETS.creatorPhoto}
                                                    className="w-10 h-10 rounded-full object-cover cursor-pointer border border-white/10 hover:border-accent-purple transition-all"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(getProfileLink(user));
                                                        onClose();
                                                    }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-white text-sm font-bold truncate">
                                                        {user.full_name || user.username}
                                                    </div>
                                                    <div className="text-[11px] text-text-muted mb-2">
                                                        requests to join <span className="text-white font-bold">{notif.data?.community?.title}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCommunityAction(notif.id, 'approve');
                                                            }}
                                                            className="px-3 py-1 bg-accent-purple text-white text-[10px] font-bold uppercase rounded hover:brightness-110 transition-all"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCommunityAction(notif.id, 'reject');
                                                            }}
                                                            className="px-3 py-1 bg-white/10 text-text-muted text-[10px] font-bold uppercase rounded hover:bg-white/20 transition-all"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                if (notif.type === 'friend_request') {
                                    return (
                                        <div key={notif.id} className="p-4 hover:bg-white/5 transition-colors" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-start gap-3">
                                                <img
                                                    src={user.avatar_url || ASSETS.creatorPhoto}
                                                    className="w-10 h-10 rounded-full object-cover cursor-pointer border border-white/10 hover:border-accent-purple transition-all"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(getProfileLink(user));
                                                        onClose();
                                                    }}
                                                    title="View profile"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div
                                                        className="text-white text-sm font-bold hover:text-accent-purple cursor-pointer transition-colors truncate"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(getProfileLink(user));
                                                            onClose();
                                                        }}
                                                        title="View profile"
                                                    >
                                                        {user.full_name || user.username}
                                                    </div>
                                                    <div className="text-[11px] text-text-muted mb-2">wants to connect</div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAccept(notif.id);
                                                            }}
                                                            className="px-3 py-1 bg-accent-purple text-white text-[10px] font-bold uppercase rounded hover:brightness-110 transition-all"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleIgnore(notif.id);
                                                            }}
                                                            className="px-3 py-1 bg-white/10 text-text-muted text-[10px] font-bold uppercase rounded hover:bg-white/20 transition-all"
                                                        >
                                                            Ignore
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                // Flag submission notification
                                return (
                                    <div key={notif.id} className="p-4 hover:bg-white/5 transition-colors cursor-pointer" onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/machines/${notif.data?.challenge_id}`);
                                        onClose();
                                    }}>
                                        <div className="flex items-start gap-3">
                                            <div className="relative">
                                                <img
                                                    src={user.avatar_url || ASSETS.creatorPhoto}
                                                    className="w-10 h-10 rounded-full object-cover border border-white/10"
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-accent-purple rounded-full flex items-center justify-center border-2 border-bg-card">
                                                    <span className="material-symbols-outlined text-white text-[12px]">flag</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-white text-sm font-bold truncate">
                                                    {user.full_name || user.username}
                                                </div>
                                                <div className="text-[11px] text-text-muted">
                                                    captured <span className="text-accent-purple font-bold">{notif.data?.flag_type}</span> flag on <span className="text-white">{notif.data?.challenge_id}</span>
                                                </div>
                                                <div className="text-[10px] text-white/30 mt-1">{getTimeAgo(notif.created_at)}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-3 border-t border-white/10 text-center">
                    <button
                        onClick={() => {
                            navigate('/friends');
                            onClose();
                        }}
                        className="text-accent-purple text-xs font-bold uppercase hover:text-white transition-colors"
                    >
                        View All
                    </button>
                </div>
            </div>
        </>
    );
};

export default NotificationDropdown;
