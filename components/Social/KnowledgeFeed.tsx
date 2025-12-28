import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import CreatePost from './CreatePost';
import ActivityCard from './ActivityCard';
import PostCard from './PostCard';

interface KnowledgeFeedProps {
    showCreatePost?: boolean;
}

const KnowledgeFeed: React.FC<KnowledgeFeedProps> = ({ showCreatePost = true }) => {
    const [feedItems, setFeedItems] = useState<any[]>([]); // Mixed Posts & Activities
    const [loading, setLoading] = useState(true);
    const [filterArea, setFilterArea] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');

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

            if (filterArea !== 'all') postsQuery = postsQuery.eq('area', filterArea);
            if (filterType !== 'all') postsQuery = postsQuery.eq('type', filterType);

            // 2. Fetch Activities (Only if no specific post filter applied, as activities don't have 'area')
            let activities: any[] = [];
            if (filterArea === 'all' && filterType === 'all') {
                const { data: actData } = await supabase
                    .from('activities')
                    .select(`*, user:user_id(*)`)
                    .order('created_at', { ascending: false })
                    .limit(20);
                activities = actData || [];
            }

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
    }, [filterArea, filterType]);

    return (
        <div className="space-y-6">
            {showCreatePost && <CreatePost onPostCreated={fetchFeed} />}

            {/* Filters */}
            <div className="flex gap-4 overflow-x-auto pb-2 border-b border-white/5">
                <select
                    value={filterArea}
                    onChange={(e) => setFilterArea(e.target.value)}
                    className="bg-black/40 border border-white/10 text-[10px] text-white p-2 rounded uppercase font-bold focus:border-accent-purple outline-none"
                >
                    <option value="all">All Areas</option>
                    <option value="web">Web</option>
                    <option value="ad">AD</option>
                    <option value="cloud">Cloud</option>
                    <option value="crypto">Crypto</option>
                    <option value="mobile">Mobile</option>
                    <option value="reverse">Reverse</option>
                </select>

                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-black/40 border border-white/10 text-[10px] text-white p-2 rounded uppercase font-bold focus:border-accent-purple outline-none"
                >
                    <option value="all">All Types</option>
                    <option value="explain">Explain</option>
                    <option value="question">Question</option>
                    <option value="guide">Guide</option>
                    <option value="payload">Payload</option>
                    <option value="insight">Insight</option>
                </select>
            </div>

            {/* Feed Timeline */}
            <div className="space-y-0 relative ml-4 pl-0 py-2">
                {feedItems.map(item => (
                    item.feedType === 'ACTIVITY' ? (
                        <ActivityCard key={item.id} activity={item} />
                    ) : (
                        <PostCard key={item.id} post={item} onValidationChange={fetchFeed} />
                    )
                ))}

                {loading && <div className="text-center py-10 text-white/30 text-xs animate-pulse pl-12">Scanning network...</div>}

                {!loading && feedItems.length === 0 && (
                    <div className="ml-12 p-8 border border-white/5 rounded-xl bg-white/[0.02] text-center">
                        <div className="material-symbols-outlined text-4xl text-white/10 mb-2">wifi_off</div>
                        <div className="text-white/30 text-xs uppercase tracking-widest">No signals detected</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KnowledgeFeed;
