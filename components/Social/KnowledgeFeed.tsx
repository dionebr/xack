
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import CreatePost from './CreatePost';
import PostCard from './PostCard';

const KnowledgeFeed: React.FC = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterArea, setFilterArea] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');

    const fetchPosts = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('posts')
                .select(`
                    *,
                    author:author_id(*),
                    post_validations(id, type, validator_id)
                `)
                .order('created_at', { ascending: false });

            if (filterArea !== 'all') query = query.eq('area', filterArea);
            if (filterType !== 'all') query = query.eq('type', filterType);

            const { data, error } = await query;
            if (error) throw error;
            setPosts(data || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [filterArea, filterType]);

    return (
        <div className="space-y-6">
            <CreatePost onPostCreated={fetchPosts} />

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

            {/* Feed */}
            <div className="space-y-4">
                {posts.map(post => (
                    <PostCard key={post.id} post={post} onValidationChange={fetchPosts} />
                ))}

                {loading && <div className="text-center py-10 text-white/30 text-xs animate-pulse">Scanning network...</div>}

                {!loading && posts.length === 0 && (
                    <div className="text-center py-20 border border-dashed border-white/10 rounded-lg">
                        <div className="material-symbols-outlined text-4xl text-white/20 mb-2">wifi_off</div>
                        <div className="text-white/40 text-sm">No signals detected in this sector.</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KnowledgeFeed;
