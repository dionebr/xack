import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { ASSETS } from '../../constants';
import { useTranslation } from '../../context/TranslationContext';
import { useLocalizedPath } from '../../utils/navigation';
import { playSound } from '../../utils/sound';

const TopicDetail: React.FC = () => {
    const { communityId, topicId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const getPath = useLocalizedPath();
    const { user } = useAuth();
    const [topic, setTopic] = useState<any>(null);
    const [replies, setReplies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const [sending, setSending] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [communityRole, setCommunityRole] = useState<string | null>(null);

    // Buscar perfil do usuário logado e role na comunidade
    useEffect(() => {
        const loadUserContext = async () => {
            if (user?.id) {
                // Profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('avatar_url, role')
                    .eq('id', user.id)
                    .single();
                setUserProfile(profile);

                // Community Role
                if (communityId) {
                    const { data: member } = await supabase
                        .from('community_members')
                        .select('role')
                        .eq('community_id', communityId)
                        .eq('user_id', user.id)
                        .single();
                    setCommunityRole(member?.role || null);
                }
            }
        };
        loadUserContext();
    }, [user?.id, communityId]);

    useEffect(() => {
        if (topicId) {
            loadTopicData();
        }
    }, [topicId]);

    const loadTopicData = async () => {
        setLoading(true);
        try {
            // Load Topic
            const { data: topicData, error: tErr } = await supabase
                .from('community_topics')
                .select('*')
                .eq('id', topicId)
                .single();

            if (tErr) throw tErr;

            // Buscar dados do autor e comunidade separadamente
            const [authorResult, communityResult] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('id, username, full_name, avatar_url, role')
                    .eq('id', topicData.author_id)
                    .single(),
                supabase
                    .from('communities')
                    .select('id, title')
                    .eq('id', topicData.community_id)
                    .single()
            ]);

            setTopic({
                ...topicData,
                author: authorResult.data,
                community: communityResult.data
            });

            // Load Replies
            const { data: replyData, error: rErr } = await supabase
                .from('community_replies')
                .select('*')
                .eq('topic_id', topicId)
                .order('created_at', { ascending: true });

            if (rErr) throw rErr;

            if (replyData && replyData.length > 0) {
                // Buscar dados dos autores das respostas
                const replyAuthorIds = [...new Set(replyData.map(r => r.author_id))];
                const { data: replyAuthors } = await supabase
                    .from('profiles')
                    .select('id, username, full_name, avatar_url, role, short_id')
                    .in('id', replyAuthorIds);

                const repliesWithAuthors = replyData.map(reply => ({
                    ...reply,
                    author: replyAuthors?.find(a => a.id === reply.author_id)
                }));

                setReplies(repliesWithAuthors);
            } else {
                setReplies([]);
            }

        } catch (e) {
            console.error(e);
            toast.error(t('actions.actionFailed'));
            navigate(getPath('communities'));
        }
        setLoading(false);
    };

    const handlePostReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        setSending(true);
        try {
            const { error } = await supabase.from('community_replies').insert({
                topic_id: topicId,
                author_id: user?.id,
                content: replyContent,
            });

            if (error) throw error;

            setReplyContent('');
            toast.success(t('actions.posted'));
            loadTopicData(); // Refresh to see new reply
        } catch (e) {
            toast.error(t('actions.actionFailed'));
        }
        setSending(false);
    };

    const handleUpvote = async (replyId: string, currentUpvotes: number) => {
        // Simple optimistic update for now, ideally strictly handled by backend function or simpler increment
        // Since we don't have a 'likes' table to track unique user likes per reply yet, we'll just increment directly
        // WARNING: This is naive and allows infinite likes for now. 
        // Ideally we would add a 'community_reply_likes' table. 
        // Keeping it simple as requested for "Orkut style" (which often had loose metrics) or just for MVP.

        try {
            await supabase.from('community_replies').update({
                upvotes: (currentUpvotes || 0) + 1
            }).eq('id', replyId);

            // Optimistic local update
            setReplies(prev => prev.map(r => r.id === replyId ? { ...r, upvotes: (r.upvotes || 0) + 1 } : r));
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteTopic = async () => {
        if (!topic) return;

        try {
            const { error } = await supabase.from('community_topics').delete().eq('id', topicId);
            if (error) throw error;

            playSound('delete');
            toast.success(t('actions.deleted'));
            navigate(getPath(`communities/${topic.community.id}`));
        } catch (e) {
            console.error(e);
            toast.error(t('actions.actionFailed'));
        }
    };

    const handlePinTopic = async () => {
        if (!topic) return;
        const newStatus = !topic.is_pinned;

        try {
            const { error } = await supabase.from('community_topics').update({ is_pinned: newStatus }).eq('id', topicId);
            if (error) throw error;

            setTopic((prev: any) => ({ ...prev, is_pinned: newStatus }));
            toast.success(newStatus ? t('community.topic.pin') : t('community.topic.unpin'));
        } catch (e) {
            console.error(e);
            toast.error(t('actions.actionFailed'));
        }
    };

    const canDelete = user?.id === topic?.author_id || communityRole === 'owner' || communityRole === 'moderator' || userProfile?.role === 'owner';
    const canPin = communityRole === 'owner' || communityRole === 'moderator' || userProfile?.role === 'owner';

    if (loading) return <div className="p-8 text-center text-text-muted">{t('community.topic.loading')}</div>;
    if (!topic) return null;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Breadcrumb */}
            <div className="mb-6 text-xs font-mono text-text-muted flex items-center gap-2">
                <span className="cursor-pointer hover:text-white" onClick={() => navigate(getPath('communities'))}>{t('community.detail.back')}</span>
                <span>/</span>
                <span className="cursor-pointer hover:text-white" onClick={() => navigate(getPath(`communities/${topic.community.id}`))}>{topic.community.title.toUpperCase()}</span>
                <span>/</span>
                <span className="text-accent-purple truncate max-w-[200px]">{t('community.topic.breadcrumb')} #{topic.id.slice(0, 8)}</span>
            </div>

            {/* Main Topic Post */}
            <div className="bg-[#161718] border border-white/10 p-6 mb-8 relative group">
                <div className="flex gap-6">
                    {/* User Card */}
                    <div className="w-32 shrink-0 flex flex-col items-center">
                        <div className="w-20 h-20 bg-black border border-white/20 mb-3 relative group-hover:border-accent-purple/50 transition-colors">
                            <img src={topic.author?.avatar_url || ASSETS.creatorPhoto} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-center w-full">
                            <div className="text-white font-bold text-xs truncate w-full" title={topic.author?.full_name}>{topic.author?.full_name}</div>
                            <div className="text-[10px] text-text-muted">{topic.author?.role || 'Operative'}</div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                {topic.is_pinned && (
                                    <span className="material-symbols-outlined text-accent-purple text-xl" title={t('community.topic.pin')}>
                                        push_pin
                                    </span>
                                )}
                                <h1 className="text-2xl font-bold text-white leading-tight">{topic.title}</h1>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-[10px] text-text-muted font-mono">{new Date(topic.created_at).toLocaleString()}</div>

                                {(canPin || canDelete) && (
                                    <div className="flex items-center gap-1 border-l border-white/10 pl-3 ml-2">
                                        {canPin && (
                                            <button
                                                onClick={handlePinTopic}
                                                className={`p-1 rounded hover:bg-white/10 transition-colors ${topic.is_pinned ? 'text-accent-purple' : 'text-text-muted hover:text-white'}`}
                                                title={topic.is_pinned ? t('community.topic.unpin') : t('community.topic.pin')}
                                            >
                                                <span className="material-symbols-outlined text-lg">push_pin</span>
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button
                                                onClick={handleDeleteTopic}
                                                className="p-1 rounded hover:bg-red-500/20 text-text-muted hover:text-red-500 transition-colors"
                                                title={t('community.topic.delete')}
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                            {topic.content}
                        </div>
                    </div>
                </div>

                {topic.is_pinned && (
                    <div className="absolute top-0 right-0 p-2">
                        <span className="material-symbols-outlined text-accent-purple text-lg -rotate-45">push_pin</span>
                    </div>
                )}
            </div>

            {/* Discussion Thread */}
            <div className="space-y-4 mb-10">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-bold text-white uppercase tracking-wider">{t('community.topic.responses')}</span>
                    <span className="text-xs text-text-muted bg-white/5 px-2 py-0.5 rounded-full">{replies.length}</span>
                </div>

                {replies.map((reply, idx) => (
                    <div key={reply.id} className="flex gap-4 p-4 bg-black/20 border border-white/5 hover:bg-white/5 transition-colors group">
                        <div className="w-12 shrink-0">
                            <img src={reply.author?.avatar_url || ASSETS.creatorPhoto} className="w-10 h-10 object-cover border border-white/10" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-accent-purple">{reply.author?.full_name || reply.author?.username}</span>
                                    <span className="text-[9px] text-text-muted">#{idx + 1}</span>
                                </div>
                                <div className="text-[9px] text-text-muted">{new Date(reply.created_at).toLocaleString()}</div>
                            </div>
                            <div className="text-white/80 text-sm whitespace-pre-wrap mb-2">
                                {reply.content}
                            </div>
                            <div className="flex items-center justify-end">
                                <button
                                    onClick={() => handleUpvote(reply.id, reply.upvotes)}
                                    className="flex items-center gap-1 text-xs text-white/60 hover:text-accent-purple transition-colors"
                                >
                                    <span className="material-symbols-outlined text-base">thumb_up</span>
                                    <span>{reply.upvotes || 0}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {replies.length === 0 && (
                    <div className="text-center py-12 text-white/20 italic text-sm">
                        {t('community.topic.no_replies')}
                    </div>
                )}
            </div>

            {/* Quick Reply Box */}
            <div className="bg-[#161718] border-t border-white/10 p-6 sticky bottom-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <form onSubmit={handlePostReply}>
                    <div className="flex gap-4">
                        <div className="shrink-0 w-10 h-10 bg-black border border-white/10">
                            <img src={userProfile?.avatar_url || ASSETS.creatorPhoto} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <textarea
                                className="w-full bg-black border border-white/10 rounded-lg p-3 text-white text-sm focus:border-accent-purple outline-none resize-none h-20 mb-2 font-mono"
                                placeholder={t('community.topic.reply_placeholder')}
                                value={replyContent}
                                onChange={e => setReplyContent(e.target.value)}
                            />
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-text-muted uppercase">{t('community.topic.secure_log')}</span>
                                <button
                                    type="submit"
                                    disabled={sending || !replyContent.trim()}
                                    className="bg-accent-purple text-white px-6 py-2 rounded text-xs font-bold uppercase tracking-wider hover:brightness-110 disabled:opacity-50"
                                >
                                    {sending ? t('community.topic.transmitting') : t('community.topic.send_reply')}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TopicDetail;
