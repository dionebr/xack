import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ASSETS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { playSound } from '../../utils/sound';

interface ActivityCardProps {
    activity: any;
    onDelete?: (id: string) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onDelete }) => {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const { type, content, metadata, created_at, activity_likes } = activity;
    const author = activity.user || {};

    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        // Instant delete - no confirmation
        setIsDeleting(true);
        try {
            const { error } = await supabase.from('activities').delete().eq('id', activity.id);
            if (error) throw error;

            playSound('delete');
            toast.success('Log purged');
            if (onDelete) onDelete(activity.id);
        } catch (error) {
            console.error('Error deleting activity:', error);
            toast.error('Failed to delete');
            setIsDeleting(false);
        }
    };

    // Comment Logic
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [sendingComment, setSendingComment] = useState(false);

    const fetchComments = async () => {
        setCommentsLoading(true);
        const { data, error } = await supabase
            .from('activity_comments')
            .select('*, user:user_id(*)')
            .eq('activity_id', activity.id)
            .order('created_at', { ascending: true });

        if (!error && data) {
            setComments(data);
        }
        setCommentsLoading(false);
    };

    const handlePostComment = async () => {
        if (!user) return toast.error('Login required');
        if (!newComment.trim()) return;

        setSendingComment(true);
        try {
            const { data, error } = await supabase
                .from('activity_comments')
                .insert({
                    activity_id: activity.id,
                    user_id: user.id,
                    content: newComment
                })
                .select('*, user:user_id(*)')
                .single();

            if (error) throw error;
            if (data) {
                setComments(prev => [...prev, data]);
                setNewComment('');
            }
        } catch (error) {
            console.error('Error posting comment:', error);
            toast.error('Failed to send signal');
        } finally {
            setSendingComment(false);
        }
    };

    const [loading, setLoading] = useState(false);

    // Check if current user liked
    const myLike = activity_likes?.find((l: any) => l.user_id === user?.id);

    // Optimistic UI state
    const [liked, setLiked] = useState<boolean>(!!myLike);
    const [likeCount, setLikeCount] = useState<number>(activity_likes?.length || 0);

    useEffect(() => {
        setLiked(!!myLike);
        setLikeCount(activity_likes?.length || 0);
    }, [activity_likes, myLike]);

    const handleLike = async () => {
        if (!user) return toast.error('Login required');

        // Optimistic update
        const isLiking = !liked;
        setLiked(isLiking);
        setLikeCount(prev => isLiking ? prev + 1 : prev - 1);

        try {
            if (isLiking) {
                playSound('like');
                await supabase.from('activity_likes').insert({
                    activity_id: activity.id,
                    user_id: user.id
                });
            } else {
                // We need to find the ID to delete. 
                // In optimistic UI, if we just created it, we might not have the ID yet.
                // But for delete, RLS policy "Auth delete own activity_likes" allows deleting by user_id matches.
                // However, standard delete requires a row match. 
                // Let's delete based on activity_id + user_id match if possible or fetch ID.
                // Actually safer to select ID first or use match.
                await supabase.from('activity_likes').delete().match({ activity_id: activity.id, user_id: user.id });
            }
        } catch (error) {
            console.error('Error liking activity:', error);
            toast.error('Action failed');
            // Revert
            setLiked(!isLiking);
            setLikeCount(prev => !isLiking ? prev + 1 : prev - 1);
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'MACHINE_SOLVED': return 'flag';
            case 'QUIZ_SOLVED': return 'school';
            case 'COINS_EARNED': return 'monetization_on'; // Yellow
            case 'LEVEL_UP': return 'upgrade';
            default: return 'notifications';
        }
    };

    const getColor = () => {
        switch (type) {
            case 'MACHINE_SOLVED': return 'text-red-500';
            case 'QUIZ_SOLVED': return 'text-accent-cyan';
            case 'COINS_EARNED': return 'text-yellow-500';
            default: return 'text-white';
        }
    };

    return (
        <div className="relative pl-12 py-4 group animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Timeline Connector Line */}
            <div className="absolute left-[22px] top-0 bottom-0 w-[2px] bg-white/5 group-last:bottom-auto group-last:h-4"></div>

            {/* Avatar (Left) */}
            <div className="absolute left-0 top-4 cursor-pointer" onClick={() => navigate(`/profile/${author.short_id || author.username}`)}>
                <img
                    src={author.avatar_url || ASSETS.creatorPhoto}
                    className="w-11 h-11 rounded-full border-2 border-[#161718] object-cover relative z-10 transition-transform hover:scale-105"
                />

                {/* Type Icon Badge */}
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#161718] flex items-center justify-center border border-white/10 z-20`}>
                    <span className={`material-symbols-outlined text-[10px] ${getColor()}`}>{getIcon()}</span>
                </div>
            </div>

            {/* Content (Right) */}
            <div className="bg-transparent group-hover:bg-white/[0.02] p-2 -my-2 rounded-xl transition-colors">
                {/* Header */}
                <div className="flex items-center gap-2 mb-0.5">
                    <span
                        className="font-bold text-sm text-white hover:underline cursor-pointer"
                        onClick={() => navigate(`/profile/${author.short_id || author.username}`)}
                    >
                        {author.full_name || author.username || 'Unknown Agent'}
                    </span>
                    <span className="text-[11px] text-text-muted font-mono">@{author.short_id || author.username}</span>
                    <span className="text-[10px] text-white/20">•</span>
                    <span className="text-[10px] text-text-muted hover:underline cursor-pointer">
                        {new Date(created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {/* Main Delete Button (Owner Only) - Added to Header */}
                    {(user?.id === activity.user_id || user?.id === author.id) && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                            disabled={isDeleting}
                            className={`ml-auto flex items-center gap-1.5 text-[11px] text-text-muted hover:text-red-500 transition-all ${isDeleting ? 'opacity-50' : ''}`}
                            title="Delete Activity"
                        >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="text-[13px] text-white/80 leading-snug mb-2">
                    {/* System Badge */}
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider mr-2 align-middle border ${type === 'MACHINE_SOLVED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        type === 'QUIZ_SOLVED' ? 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20' :
                            'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        }`}>
                        <span className="material-symbols-outlined text-[10px]">{getIcon()}</span>
                        {type.replace('_', ' ')}
                    </span>

                    {content}
                </div>

                {/* Rewards / Metadata */}
                {metadata?.coins && (
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-400 bg-yellow-400/5 px-2 py-1 rounded-md border border-yellow-400/10">
                            <span className="material-symbols-outlined text-xs">monetization_on</span>
                            +{metadata.coins} COINS
                        </div>
                    </div>
                )}

                {/* Footer (Interactions) */}
                <div className="flex items-center gap-6 mt-2 relative z-10">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleLike();
                        }}
                        className={`flex items-center gap-1.5 text-[11px] transition-colors group/act ${liked ? 'text-red-400' : 'text-text-muted/50 hover:text-red-400'}`}
                    >
                        <span className={`material-symbols-outlined text-[14px] group-hover/act:scale-110 transition-transform ${liked ? 'fill-current' : ''}`}>favorite</span>
                        {likeCount > 0 && <span className="font-mono">{likeCount}</span>}
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowComments(!showComments);
                            if (!showComments && comments.length === 0) fetchComments();
                        }}
                        className={`flex items-center gap-1.5 text-[11px] transition-colors group/act ${showComments ? 'text-accent-cyan' : 'text-text-muted/50 hover:text-accent-cyan'}`}
                    >
                        <span className={`material-symbols-outlined text-[14px] group-hover/act:scale-110 transition-transform ${showComments ? 'fill-current' : ''}`}>chat_bubble</span>
                        {activity.comment_count > 0 && <span className="font-mono">{activity.comment_count}</span>}
                    </button>
                    <button className="flex items-center gap-1.5 text-[11px] text-text-muted/50 hover:text-green-400 transition-colors group/act">
                        <span className="material-symbols-outlined text-[14px] group-hover/act:scale-110 transition-transform">ios_share</span>
                    </button>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="mt-4 pt-3 border-t border-white/5 animate-in fade-in slide-in-from-top-1">
                        {/* Comment List */}
                        <div className="space-y-4 mb-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                            {commentsLoading && <div className="text-center text-xs text-white/20 py-2">Loading signals...</div>}

                            {!commentsLoading && comments.length === 0 && (
                                <div className="text-center text-xs text-white/20 py-2">No transmissions yet. Be the first.</div>
                            )}

                            {comments.map((comment: any) => (
                                <div key={comment.id} className="flex gap-2.5">
                                    <img
                                        src={comment.user?.avatar_url || ASSETS.creatorPhoto}
                                        className="w-6 h-6 rounded-full border border-white/10 object-cover mt-0.5"
                                    />
                                    <div className="flex-1">
                                        <div className="bg-white/5 rounded-lg rounded-tl-none p-2.5">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[11px] font-bold text-white/90">{comment.user?.full_name || 'Unknown'}</span>
                                                <span className="text-[9px] text-white/30 font-mono">
                                                    {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {/* Delete (Owner Only) */}
                                                {(user?.id === activity.user_id || user?.id === author.id) && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete();
                                                        }}
                                                        disabled={isDeleting}
                                                        className={`flex items-center gap-1.5 text-[11px] text-text-muted hover:text-red-500 transition-all ${isDeleting ? 'opacity-50' : ''}`}
                                                        title="Delete"
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">delete</span>
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-[12px] text-gray-300 leading-snug break-words whitespace-pre-wrap">{comment.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="flex items-end gap-2 relative">
                            <img
                                src={profile?.avatar_url || user?.user_metadata?.avatar_url || ASSETS.creatorPhoto}
                                className="w-7 h-7 rounded-full border border-white/10 object-cover mb-1"
                            />
                            <div className="flex-1 relative bg-black/20 rounded-xl border border-white/10 focus-within:border-accent-cyan/50 transition-colors">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Execute response protocol..."
                                    className="w-full bg-transparent border-none text-white text-[13px] placeholder:text-white/20 focus:ring-0 p-3 min-h-[42px] max-h-24 resize-none leading-relaxed custom-scrollbar"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handlePostComment();
                                        }
                                    }}
                                />
                                <div className="absolute right-2 bottom-1.5">
                                    <button
                                        onClick={handlePostComment}
                                        disabled={!newComment.trim() || sendingComment}
                                        className="p-1.5 rounded-full bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[16px] block">send</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityCard;
