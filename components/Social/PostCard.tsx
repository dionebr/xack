
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { ASSETS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PostCardProps {
    post: any;
    onValidationChange: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onValidationChange }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Check if current user validated
    const myValidation = post.post_validations?.find((v: any) => v.validator_id === user?.id);

    const handleValidate = async (type: 'useful' | 'well_explained' | 'incomplete') => {
        if (!user) return toast.error('Login required');
        if (loading) return;
        setLoading(true);

        try {
            if (myValidation?.type === type) {
                // Remove validation if clicking same type
                await supabase.from('post_validations').delete().eq('id', myValidation.id);
            } else {
                if (myValidation) {
                    // Update existing
                    await supabase.from('post_validations').update({ type }).eq('id', myValidation.id);
                } else {
                    // Create new
                    await supabase.from('post_validations').insert({
                        post_id: post.id,
                        validator_id: user.id,
                        type
                    });
                }
            }
            onValidationChange();
        } catch (error) {
            console.error(error);
            toast.error('Action failed');
        } finally {
            setLoading(false);
        }
    };

    // Icons/Colors for types
    const getTypeStyle = (type: string) => {
        switch (type) {
            case 'explain': return { icon: 'school', color: 'text-blue-400', border: 'border-blue-400/30' };
            case 'question': return { icon: 'help', color: 'text-yellow-400', border: 'border-yellow-400/30' };
            case 'guide': return { icon: 'book', color: 'text-green-400', border: 'border-green-400/30' };
            case 'payload': return { icon: 'code', color: 'text-red-400', border: 'border-red-400/30' };
            case 'insight': return { icon: 'lightbulb', color: 'text-purple-400', border: 'border-purple-400/30' };
            default: return { icon: 'article', color: 'text-gray-400', border: 'border-white/10' };
        }
    };

    const style = getTypeStyle(post.type);

    // Count validations
    const usefulCount = post.post_validations?.filter((v: any) => v.type === 'useful').length || 0;
    const wellExplainedCount = post.post_validations?.filter((v: any) => v.type === 'well_explained').length || 0;
    const incompleteCount = post.post_validations?.filter((v: any) => v.type === 'incomplete').length || 0;

    return (
        <div className="relative pl-12 py-3 group animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Timeline Connector Line */}
            <div className="absolute left-[22px] top-0 bottom-0 w-[2px] bg-white/5 group-last:bottom-auto group-last:h-4"></div>

            {/* Avatar (Left) */}
            <div className="absolute left-0 top-3 cursor-pointer" onClick={() => navigate(`/profile/${post.author?.short_id || post.author?.username}`)}>
                <img
                    src={post.author?.avatar_url || ASSETS.creatorPhoto}
                    className="w-11 h-11 rounded-full border-2 border-[#161718] object-cover relative z-10 transition-transform hover:scale-105"
                />
                {/* Type Icon Badge for Posts */}
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#161718] flex items-center justify-center border border-white/10 z-20`}>
                    <span className={`material-symbols-outlined text-[10px] ${style.color}`}>{style.icon}</span>
                </div>
            </div>

            {/* Content (Right) */}
            <div className="bg-transparent group-hover:bg-white/[0.02] p-2 -my-2 rounded-xl transition-colors">
                {/* Header */}
                <div className="flex items-center gap-2 mb-0.5">
                    <span
                        className="font-bold text-sm text-white hover:underline cursor-pointer"
                        onClick={() => navigate(`/profile/${post.author?.short_id || post.author?.username}`)}
                    >
                        {post.author?.full_name || 'Agent'}
                    </span>
                    <span className="text-[11px] text-text-muted font-mono">@{post.author?.short_id || post.author?.username}</span>
                    <span className="text-[10px] text-white/20">•</span>
                    <span className="text-[10px] text-text-muted hover:underline cursor-pointer">
                        {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {/* Level Badge */}
                    <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-text-muted uppercase font-mono ml-auto">
                        Lvl {Math.floor((post.author?.reputation?.[post.area] || 0) / 100) + 1} {post.area.slice(0, 3)}
                    </span>
                </div>

                {/* Body Content */}
                <div className="text-[13px] text-gray-300 whitespace-pre-wrap leading-relaxed mb-3">
                    {post.content}
                </div>

                {/* Interaction Actions (Footer) */}
                <div className="flex items-center gap-6 border-t border-white/5 pt-3 mt-3">
                    {/* Like Button */}
                    <button
                        onClick={() => handleValidate('useful')}
                        className={`flex items-center gap-1.5 text-[11px] transition-all group ${myValidation?.type === 'useful' ? 'text-red-400' : 'text-text-muted hover:text-red-400'}`}
                        title="Like"
                    >
                        <span className={`material-symbols-outlined text-[18px] ${myValidation?.type === 'useful' ? 'fill-current' : ''}`}>favorite</span>
                        {usefulCount > 0 && <span className="font-mono">{usefulCount}</span>}
                    </button>

                    {/* Comment Button */}
                    <button
                        className="flex items-center gap-1.5 text-[11px] text-text-muted hover:text-accent-cyan transition-all group"
                        title="Comment"
                    >
                        <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                        <span className="font-mono">{post.comment_count || 0}</span>
                    </button>

                    {/* Share Button */}
                    <button
                        onClick={async () => {
                            const link = `${window.location.origin}/post/${post.id}`;
                            await navigator.clipboard.writeText(link);
                            toast.success('Link copied to clipboard!');
                            // Increment share count
                            await supabase.from('posts').update({ share_count: (post.share_count || 0) + 1 }).eq('id', post.id);
                        }}
                        className="flex items-center gap-1.5 text-[11px] text-text-muted hover:text-accent-purple transition-all group"
                        title="Share"
                    >
                        <span className="material-symbols-outlined text-[18px]">ios_share</span>
                        {post.share_count > 0 && <span className="font-mono">{post.share_count}</span>}
                    </button>

                    {/* Well Explained Badge */}
                    <button
                        onClick={() => handleValidate('well_explained')}
                        className={`flex items-center gap-1.5 text-[11px] ml-auto transition-all ${myValidation?.type === 'well_explained' ? 'text-accent-purple' : 'text-text-muted hover:text-accent-purple'}`}
                        title="Well Explained"
                    >
                        <span className="material-symbols-outlined text-[14px]">psychology</span>
                        {wellExplainedCount > 0 && <span className="font-mono text-[10px]">{wellExplainedCount}</span>}
                    </button>

                    {/* Report */}
                    <button
                        onClick={() => handleValidate('incomplete')}
                        className={`flex items-center gap-1.5 text-[11px] transition-all ${myValidation?.type === 'incomplete' ? 'text-red-400' : 'text-text-muted hover:text-red-400'}`}
                        title="Report"
                    >
                        <span className="material-symbols-outlined text-[14px]">flag</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostCard;
