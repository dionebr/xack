import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ASSETS } from '../constants';

export interface Notification {
    id: string;
    type: 'friend_request' | 'flag_submission' | 'community_request' | 'achievement' | 'purchase' | 'new_post' | 'reply_post' | 'reply_activity' | 'like_post' | 'like_activity';
    user: any;
    data?: any;
    created_at: string;
}

export const useNotifications = (userId: string | null) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Helpers for Sound
    const playBeep = () => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (err) { }
    };

    const playNotificationSound = async () => {
        try {
            const audio = new Audio(ASSETS.notificationSound);
            audio.volume = 0.5;
            await audio.play().catch(() => playBeep());
        } catch (e) {
            playBeep();
        }
    };

    const loadNotifications = useCallback(async () => {
        if (!userId) return;
        setLoading(true);

        const viewedKey = `viewed_notifications_${userId}`;
        const viewedIds = JSON.parse(localStorage.getItem(viewedKey) || '[]');

        // --- FETCHING LOGIC (Same as previous Dropdown) ---

        // 1. Friend Requests
        const { data: requests } = await supabase
            .from('friendships')
            .select(`id, created_at, user:user_id(id, username, full_name, avatar_url, short_id)`)
            .eq('friend_id', userId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(5);

        // 2. Main Activities (Achievements/Purchases)
        const { data: globalActivities } = await supabase
            .from('activities')
            .select(`*, profiles:user_id(id, username, full_name, avatar_url, short_id)`)
            .in('type', ['achievement', 'purchase'])
            .eq('is_public', true)
            .order('created_at', { ascending: false })
            .limit(10);

        // 3. New Posts (Global)
        const { data: newPosts } = await supabase
            .from('posts')
            .select(`*, author:author_id(id, username, full_name, avatar_url, short_id)`)
            .order('created_at', { ascending: false })
            .limit(10);

        // 4. Replies (Posts)
        const { data: myPosts } = await supabase.from('posts').select('id').eq('author_id', userId);
        let postReplies: any[] = [];
        let postLikes: any[] = [];
        if (myPosts && myPosts.length > 0) {
            const myPostIds = myPosts.map(p => p.id);
            // Replies
            const { data: replies } = await supabase
                .from('post_comments')
                .select(`id, content, created_at, post_id, user:user_id(id, username, full_name, avatar_url, short_id)`)
                .in('post_id', myPostIds)
                .neq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(10);
            postReplies = replies || [];

            // Likes (Post Validations)
            const { data: likes } = await supabase
                .from('post_validations')
                .select(`id, created_at, post_id, validator:validator_id(id, username, full_name, avatar_url, short_id)`)
                .in('post_id', myPostIds)
                .neq('validator_id', userId) // Not self likes
                .order('created_at', { ascending: false })
                .limit(10);
            postLikes = likes || [];
        }

        // 5. Replies & Likes (Activities)
        const { data: myActivities } = await supabase.from('activities').select('id').eq('user_id', userId);
        let activityReplies: any[] = [];
        let activityLikes: any[] = [];
        if (myActivities && myActivities.length > 0) {
            const myActivityIds = myActivities.map(a => a.id);
            // Replies
            const { data: replies } = await supabase
                .from('activity_comments')
                .select(`id, content, created_at, activity_id, user:user_id(id, username, full_name, avatar_url, short_id)`)
                .in('activity_id', myActivityIds)
                .neq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(10);
            activityReplies = replies || [];

            // Likes
            const { data: likes } = await supabase
                .from('activity_likes')
                .select(`id, created_at, activity_id, user:user_id(id, username, full_name, avatar_url, short_id)`)
                .in('activity_id', myActivityIds)
                .neq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(10);
            activityLikes = likes || [];
        }

        // 6. Community Requests
        const { data: myManagedCommunities } = await supabase
            .from('community_members')
            .select('community_id')
            .eq('user_id', userId)
            .in('role', ['owner', 'moderator']);

        let communityRequests: any[] = [];
        if (myManagedCommunities && myManagedCommunities.length > 0) {
            const communityIds = myManagedCommunities.map(c => c.community_id);
            const { data: pendingMembers } = await supabase
                .from('community_members')
                .select('id, joined_at, community_id, user_id')
                .in('community_id', communityIds)
                .eq('status', 'pending')
                .order('joined_at', { ascending: false });

            if (pendingMembers && pendingMembers.length > 0) {
                const userIds = [...new Set(pendingMembers.map(m => m.user_id))];
                const { data: usersData } = await supabase.from('profiles').select('id, username, full_name, avatar_url, short_id').in('id', userIds);
                const pendingCommunityIds = [...new Set(pendingMembers.map(m => m.community_id))];
                const { data: communitiesData } = await supabase.from('communities').select('id, title').in('id', pendingCommunityIds);

                const usersMap = new Map(usersData?.map(u => [u.id, u]) || []);
                const communitiesMap = new Map(communitiesData?.map(c => [c.id, c]) || []);

                communityRequests = pendingMembers.map(member => ({
                    id: member.id,
                    joined_at: member.joined_at,
                    user: usersMap.get(member.user_id),
                    community: communitiesMap.get(member.community_id)
                }));
            }
        }

        // Combine
        const all: Notification[] = [
            ...(requests || []).map(r => ({ id: r.id, type: 'friend_request' as const, user: r.user, created_at: r.created_at })),
            ...(globalActivities || []).map(act => ({ id: act.id, type: act.type as any, user: act.profiles, data: act.metadata, created_at: act.created_at })),
            ...(newPosts || []).map(p => ({ id: p.id, type: 'new_post' as const, user: p.author, data: { content: p.content, post_id: p.id }, created_at: p.created_at })).filter(n => n.user.id !== userId),
            ...postReplies.map(r => ({ id: r.id, type: 'reply_post' as const, user: r.user, data: { content: r.content, post_id: r.post_id }, created_at: r.created_at })),
            ...activityReplies.map(r => ({ id: r.id, type: 'reply_activity' as const, user: r.user, data: { content: r.content, activity_id: r.activity_id }, created_at: r.created_at })),
            ...postLikes.map(l => ({ id: l.id, type: 'like_post' as const, user: l.validator, data: { post_id: l.post_id }, created_at: l.created_at })),
            ...activityLikes.map(l => ({ id: l.id, type: 'like_activity' as const, user: l.user, data: { activity_id: l.activity_id }, created_at: l.created_at })),
            ...communityRequests.map(req => ({ id: req.id, type: 'community_request' as const, user: req.user, data: { community: req.community }, created_at: req.joined_at }))
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        // Filter out viewed for the badge count, but keep them for the list if needed? 
        // Actually, usually notifications persist until cleared or clicked, but the badge only counts unread.
        // For this system, let's say "viewed" means "opened dropdown".

        // HOWEVER, "Global Activities" and "New Posts" might be spammy. 
        // Let's count them towards the badge only if they are strictly new (logic can be refined).
        // For now: everything counts.

        const unread = all.filter(n => !viewedIds.includes(n.id));
        setNotifications(all);
        setUnreadCount(unread.length);
        setLoading(false);

    }, [userId]);

    const markAllAsRead = useCallback(() => {
        if (!userId || notifications.length === 0) return;

        const viewedKey = `viewed_notifications_${userId}`;
        const currentViewed = JSON.parse(localStorage.getItem(viewedKey) || '[]');
        const allNotifIds = notifications.map(n => n.id);
        const updatedViewed = [...new Set([...currentViewed, ...allNotifIds])];
        localStorage.setItem(viewedKey, JSON.stringify(updatedViewed));

        setUnreadCount(0);
    }, [userId, notifications]);

    // Realtime Subscription
    useEffect(() => {
        if (!userId) return;

        loadNotifications();

        const channel = supabase
            .channel(`notifications_hook_${userId}`)
            // 1. Friend Requests
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'friendships', filter: `friend_id=eq.${userId}` }, () => {
                playNotificationSound();
                loadNotifications();
            })
            // 2. Global Activities
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activities' }, (payload) => {
                if (['achievement', 'purchase'].includes(payload.new.type) && payload.new.is_public !== false && payload.new.user_id !== userId) {
                    playNotificationSound();
                    loadNotifications();
                }
            })
            // 3. New Posts
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
                if (payload.new.author_id !== userId) {
                    playNotificationSound();
                    loadNotifications();
                }
            })
            // 4. Comments (Post)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_comments' }, async (payload) => {
                if (payload.new.user_id === userId) return;
                const { data: post } = await supabase.from('posts').select('author_id').eq('id', payload.new.post_id).single();
                if (post && post.author_id === userId) {
                    playNotificationSound();
                    loadNotifications();
                }
            })
            // 5. Comments (Activity)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_comments' }, async (payload) => {
                if (payload.new.user_id === userId) return;
                const { data: activity } = await supabase.from('activities').select('user_id').eq('id', payload.new.activity_id).single();
                if (activity && activity.user_id === userId) {
                    playNotificationSound();
                    loadNotifications();
                }
            })
            // 6. Likes (Post)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_validations' }, async (payload) => {
                if (payload.new.validator_id === userId) return; // Ignore own like
                const { data: post } = await supabase.from('posts').select('author_id').eq('id', payload.new.post_id).single();
                if (post && post.author_id === userId) {
                    playNotificationSound();
                    loadNotifications();
                }
            })
            // 7. Likes (Activity)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_likes' }, async (payload) => {
                if (payload.new.user_id === userId) return; // Ignore own like
                const { data: activity } = await supabase.from('activities').select('user_id').eq('id', payload.new.activity_id).single();
                if (activity && activity.user_id === userId) {
                    playNotificationSound();
                    loadNotifications();
                }
            })
            // 8. Community Requests
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_members' }, async (payload) => {
                if (payload.new.status === 'pending') {
                    const { data: role } = await supabase.from('community_members').select('role').eq('community_id', payload.new.community_id).eq('user_id', userId).single();
                    if (role && (role.role === 'owner' || role.role === 'moderator')) {
                        playNotificationSound();
                        loadNotifications();
                    }
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };

    }, [userId, loadNotifications]);

    return { notifications, unreadCount, loading, markAllAsRead, refresh: loadNotifications };
};
