import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../context/TranslationContext';
import CreatePost from './CreatePost';
import ActivityCard from './ActivityCard';
import PostCard from './PostCard';

interface KnowledgeFeedProps {
    showCreatePost?: boolean;
}

const KnowledgeFeed: React.FC<KnowledgeFeedProps> = ({ showCreatePost = true }) => {
    const { t } = useTranslation();
    const [feedItems, setFeedItems] = useState<any[]>([]); // Mixed Posts & Activities
    const [loading, setLoading] = useState(true);


    const handleItemDeleted = (id: string) => {
        setFeedItems(prev => prev.filter(item => item.id !== id));
    };

    const fetchFeed = async () => {
        setLoading(true);
        try {
            // 1. Fetch Posts
            let postsQuery = supabase
                .from('posts')
                .select(`
                    *,
                    author:author_id(*),
                    post_validations(id, type, validator_id)
                `)
                .order('created_at', { ascending: false })
                .limit(20);

            // 2. Fetch Activities
            const { data: actData } = await supabase
                .from('activities')
                .select(`
                    *, 
                    user:user_id(*),
                    activity_likes(id, user_id)
                `)
                .order('created_at', { ascending: false })
                .limit(20);
            const activities = actData || [];

            const { data: postsData, error } = await postsQuery;
            if (error) throw error;

            // 3. Merge & Sort
            const posts = (postsData || []).map((p: any) => ({ ...p, feedType: 'POST' }));
            const acts = activities.map((a: any) => ({ ...a, feedType: 'ACTIVITY' }));

            const combined = [...posts, ...acts].sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            setFeedItems(combined);
        } catch (error) {
            console.error('Error fetching feed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeed();

        // Real-time subscriptions
        const channel = supabase
            .channel('knowledge_feed_updates')
            // Listen for new posts
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
                // If filters are active, we might want to check them, but for now just refresh or append
                // Ideally, we fetch the single new item and prepend it
                fetchFeed();
            })
            // Listen for deleted posts (to remove from UI if not handled by local state)
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, (payload) => {
                setFeedItems(prev => prev.filter(item => item.id !== payload.old.id));
            })
            // Listen for new activities
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activities' }, (payload) => {
                fetchFeed();
            })
            // Listen for Likes (Post)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_validations' }, () => {
                fetchFeed();
            })
            // Listen for Likes (Activity)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_likes' }, () => {
                fetchFeed();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="space-y-6">
            {showCreatePost && <CreatePost onPostCreated={fetchFeed} />}

            {/* Filters */}


            {/* Feed Timeline */}
            <div className="space-y-0 relative ml-4 pl-0 py-2">
                {feedItems.map(item => (
                    item.feedType === 'ACTIVITY' ? (
                        <ActivityCard key={item.id} activity={item} onDelete={handleItemDeleted} />
                    ) : (
                        <PostCard key={item.id} post={item} onValidationChange={fetchFeed} onDelete={handleItemDeleted} />
                    )
                ))}

                {loading && <div className="text-center py-10 text-white/30 text-xs animate-pulse pl-12">{t('feed.scanning')}</div>}

                {!loading && feedItems.length === 0 && (
                    <div className="ml-12 p-8 border border-white/5 rounded-xl bg-white/[0.02] text-center">
                        <div className="material-symbols-outlined text-4xl text-white/10 mb-2">wifi_off</div>
                        <div className="text-white/30 text-xs uppercase tracking-widest">{t('feed.noSignals')}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KnowledgeFeed;
