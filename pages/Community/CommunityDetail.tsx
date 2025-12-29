import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useLocalizedPath } from '../../utils/navigation';
import ManageCommunityModal from '../../components/Social/ManageCommunityModal';
import MemberManagement from '../../components/Social/MemberManagement';
import ReportAbuseModal from '../../components/Social/ReportAbuseModal';
import { useTranslation } from '../../context/TranslationContext';

const CommunityDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const getPath = useLocalizedPath();
    const { t } = useTranslation();

    // Data State
    const [community, setCommunity] = useState<any>(null);
    const [memberStatus, setMemberStatus] = useState<'none' | 'pending' | 'member' | 'moderator' | 'owner'>('none');
    const [topics, setTopics] = useState<any[]>([]);
    const [membersPreview, setMembersPreview] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [showCreateTopic, setShowCreateTopic] = useState(false);
    const [showManageModal, setShowManageModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showAllMembers, setShowAllMembers] = useState(false); // To toggle full member view if needed

    // Topic Form
    const [topicTitle, setTopicTitle] = useState('');
    const [topicContent, setTopicContent] = useState('');
    const [topicType, setTopicType] = useState('discussion');

    useEffect(() => {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || '');
        if (id && isUUID) {
            loadCommunityData();
        } else if (id) {
            navigate(getPath('communities'));
        }
    }, [id]);

    const loadCommunityData = async () => {
        setLoading(true);
        try {
            // 1. Community Info
            const { data: comm, error } = await supabase.from('communities').select('*').eq('id', id).single();
            if (error) throw error;

            // 1b. Fetch Member Count explicitly
            const { count: memberCount } = await supabase
                .from('community_members')
                .select('id', { count: 'exact', head: true })
                .eq('community_id', id)
                .neq('status', 'pending');

            setCommunity({ ...comm, members_count: memberCount || 0 });

            // 2. Membership Status
            if (user) {
                const { data: member } = await supabase
                    .from('community_members')
                    .select('role, status')
                    .eq('community_id', id)
                    .eq('user_id', user.id)
                    .single();

                if (member) {
                    setMemberStatus(member.status === 'pending' ? 'pending' : member.role);
                } else {
                    setMemberStatus('none');
                }
            }

            // 3. Topics (Recent) with Manual Join
            const { data: topicList } = await supabase
                .from('community_topics')
                .select('id, title, content, type, is_pinned, created_at, author_id')
                .eq('community_id', id)
                .order('is_pinned', { ascending: false })
                .order('created_at', { ascending: false });

            if (topicList && topicList.length > 0) {
                const authorIds = [...new Set(topicList.map((t: any) => t.author_id))];
                const { data: authors } = await supabase
                    .from('profiles')
                    .select('id, username, full_name, avatar_url')
                    .in('id', authorIds);

                const formattedTopics = topicList.map((topic: any) => ({
                    ...topic,
                    author: authors?.find((a: any) => a.id === topic.author_id)
                }));
                setTopics(formattedTopics);
            } else {
                setTopics([]);
            }

            // 4. Members Preview (First 9) with Manual Join
            const { data: memberList } = await supabase
                .from('community_members')
                .select('user_id')
                .eq('community_id', id)
                .in('status', ['approved', 'moderator', 'owner'])
                .limit(9);

            if (memberList && memberList.length > 0) {
                const memberUserIds = memberList.map((m: any) => m.user_id);
                const { data: memberProfiles } = await supabase
                    .from('profiles')
                    .select('id, username, avatar_url')
                    .in('id', memberUserIds);

                setMembersPreview(memberProfiles || []);
            } else {
                setMembersPreview([]);
            }

        } catch (e) {
            console.error(e);
            toast.error(t('actions.actionFailed'));
            navigate(getPath('communities'));
        }
        setLoading(false);
    };

    const handleJoin = async () => {
        try {
            const status = community.is_private ? 'pending' : 'approved';
            await supabase.from('community_members').insert({
                community_id: id,
                user_id: user?.id,
                status: status
            });
            setMemberStatus(status === 'pending' ? 'pending' : 'member');
            toast.success(status === 'pending' ? 'Access requested.' : 'Joined community!');
            loadCommunityData(); // Refresh to get updated member count/list
        } catch (e) {
            toast.error(t('actions.actionFailed'));
        }
    };

    const handleLeave = async () => {
        if (!confirm('Are you sure you want to leave this community?')) return;
        try {
            await supabase.from('community_members').delete().eq('community_id', id).eq('user_id', user?.id);
            setMemberStatus('none');
            toast.success(t('actions.connectionSevered'));
            loadCommunityData();
        } catch (e) {
            toast.error(t('actions.actionFailed'));
        }
    };

    const handleCreateTopic = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await supabase.from('community_topics').insert({
                community_id: id,
                author_id: user?.id,
                title: topicTitle,
                content: topicContent,
                type: topicType
            });
            toast.success('Topic created!');
            setShowCreateTopic(false);
            setTopicTitle('');
            setTopicContent('');
            loadCommunityData();
        } catch (e) {
            toast.error(t('actions.actionFailed'));
        }
    };

    if (loading) return <div className="p-20 text-center text-text-muted animate-pulse">{t('community.loading')}</div>;
    if (!community) return null;

    return (
        <div className="p-4 max-w-[1600px] mx-auto min-h-screen">
            {/* Breadcrumb nav */}
            <div className="mb-4 text-[10px] font-mono text-text-muted flex items-center gap-2">
                <span className="cursor-pointer hover:text-white" onClick={() => navigate(getPath('communities'))}>{t('community.detail.back')}</span>
                <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                <span className="text-accent-purple font-bold tracking-widest">{community.title.toUpperCase()}</span>
            </div>

            <div className="grid grid-cols-12 gap-6 items-start">

                {/* ================= LEFT COLUMN (Profile & Actions) ================= */}
                <div className="col-span-12 md:col-span-3 flex flex-col gap-4">
                    {/* Community Image Card */}
                    <div className="bg-[#161718] border border-white/10 p-2 rounded-sm shadow-lg">
                        <div className="w-full aspect-square bg-black mb-2 overflow-hidden border border-white/5 relative group">
                            {community.icon_url ? (
                                <img src={community.icon_url} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-accent-purple bg-accent-purple/5">
                                    <span className="material-symbols-outlined text-6xl">groups</span>
                                </div>
                            )}
                        </div>
                        <h1 className="text-sm font-black text-white leading-tight mb-1">{community.title}</h1>
                        <p className="text-[10px] text-text-muted mb-3 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">group</span>
                            {community.members_count || 0} {t('community.detail.members_count')}
                        </p>

                        {/* Primary Action Button */}
                        {memberStatus === 'none' && (
                            <button onClick={handleJoin} className="w-full py-1.5 mb-2 bg-accent-purple hover:bg-accent-purple/80 text-white text-xs font-bold uppercase tracking-wide rounded-sm transition-colors border border-accent-purple/50">
                                {community.is_private ? t('community.detail.request') : t('community.detail.join')}
                            </button>
                        )}
                        {memberStatus === 'pending' && (
                            <button disabled className="w-full py-1.5 mb-2 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 text-xs font-bold uppercase tracking-wide rounded-sm cursor-not-allowed">
                                {t('community.detail.pending')}
                            </button>
                        )}

                        {/* Vertical Link Menu (Orkut Style) */}
                        <div className="flex flex-col gap-1 mt-2">
                            <button className="text-left text-xs text-accent-purple hover:underline hover:bg-accent-purple/5 py-1 px-2 rounded-sm flex items-center gap-2 transition-colors nav-link-active">
                                <span className="material-symbols-outlined text-[14px]">forum</span>
                                {t('community.detail.recent_discussions')}
                            </button>
                            <button onClick={() => setShowAllMembers(true)} className="text-left text-xs text-text-muted hover:text-white hover:bg-white/5 py-1 px-2 rounded-sm flex items-center gap-2 transition-colors">
                                <span className="material-symbols-outlined text-[14px]">people</span>
                                {t('community.detail.members_count')}
                            </button>
                            {memberStatus !== 'none' && (
                                <button onClick={handleLeave} className="text-left text-xs text-text-muted hover:text-red-400 hover:bg-red-500/10 py-1 px-2 rounded-sm flex items-center gap-2 transition-colors">
                                    <span className="material-symbols-outlined text-[14px]">logout</span>
                                    {t('community.detail.leave')}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Actions Box */}
                    <div className="bg-[#161718] border border-white/10 p-3 rounded-sm">
                        <h3 className="text-[10px] font-bold text-text-muted uppercase mb-2 tracking-widest">{t('community.detail.actions')}</h3>
                        <div className="space-y-1">
                            {memberStatus === 'owner' && (
                                <button onClick={() => setShowManageModal(true)} className="w-full text-left text-xs text-white hover:text-accent-purple flex items-center gap-2 group">
                                    <span className="material-symbols-outlined text-[14px] text-text-muted group-hover:text-accent-purple">settings</span>
                                    {t('community.detail.edit')}
                                </button>
                            )}
                            <button onClick={() => setShowReportModal(true)} className="w-full text-left text-xs text-white hover:text-red-400 flex items-center gap-2 group">
                                <span className="material-symbols-outlined text-[14px] text-text-muted group-hover:text-red-400">flag</span>
                                {t('community.detail.report')}
                            </button>
                        </div>
                    </div>
                </div>


                {/* ================= CENTER COLUMN (Content & Forum) ================= */}
                <div className="col-span-12 md:col-span-7 flex flex-col gap-4">

                    {/* Info Block */}
                    <div className="bg-[#161718] border border-white/10 p-4 rounded-sm relative overflow-hidden">
                        <h2 className="text-xl font-bold text-white mb-2">{community.title}</h2>
                        <div className="text-xs text-text-muted leading-relaxed whitespace-pre-wrap font-mono">
                            {community.description || "No description initialized for this sector."}
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/5 flex gap-4 text-[10px] text-text-muted uppercase tracking-widest">
                            <span>Category: <span className="text-white">{community.category}</span></span>
                            <span>{t('community.detail.language')}: <span className="text-white">Universal</span></span>
                            <span>{t('community.detail.access')}: <span className="text-white">{community.is_private ? t('community.detail.type.private') : t('community.detail.type.public')}</span></span>
                        </div>
                    </div>

                    {/* Forum Section */}
                    <div className="bg-[#161718] border border-white/10 rounded-sm min-h-[400px]">
                        <div className="bg-white/5 p-3 flex justify-between items-center border-b border-white/10">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <span className="material-symbols-outlined">forum</span>
                                {t('community.detail.recent_discussions')}
                            </h3>
                            {memberStatus !== 'none' && (
                                <button onClick={() => setShowCreateTopic(true)} className="bg-accent-purple/10 border border-accent-purple/30 text-accent-purple hover:bg-accent-purple hover:text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 rounded-sm">
                                    <span className="material-symbols-outlined text-[12px]">add</span>
                                    {t('community.detail.new_topic')}
                                </button>
                            )}
                        </div>

                        <div className="divide-y divide-white/5">
                            {topics.length === 0 ? (
                                <div className="p-10 text-center">
                                    <span className="material-symbols-outlined text-4xl text-white/10 mb-2">subtitles_off</span>
                                    <p className="text-text-muted text-xs">{t('community.detail.no_topics')}</p>
                                </div>
                            ) : (
                                topics.map(topic => (
                                    <div key={topic.id} className="p-3 hover:bg-white/[0.02] flex gap-3 group cursor-pointer transition-colors pt-4 pb-4" onClick={() => navigate(getPath(`communities/${id}/topic/${topic.id}`))}>
                                        <div className="shrink-0 pt-1">
                                            {topic.is_pinned ? (
                                                <span className="material-symbols-outlined text-accent-purple text-lg" title="Pinned Payload">push_pin</span>
                                            ) : (
                                                <span className="material-symbols-outlined text-text-muted text-lg group-hover:text-white">chat_bubble_outline</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline justify-between mb-0.5">
                                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                    {topic.is_pinned && (
                                                        <span className="material-symbols-outlined text-accent-purple text-sm shrink-0">
                                                            push_pin
                                                        </span>
                                                    )}
                                                    <h4 className="text-sm font-bold text-white group-hover:text-accent-purple truncate transition-colors">
                                                        {topic.title}
                                                    </h4>
                                                </div>
                                                <span className="text-[9px] text-text-muted shrink-0 ml-2">
                                                    {new Date(topic.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-text-muted text-xs line-clamp-1 mb-1">
                                                {topic.content}
                                            </p>
                                            <div className="flex items-center gap-2 text-[10px] text-text-muted">
                                                <span className="hover:text-white">by {topic.author?.username || 'Unknown'}</span>
                                                {topic.type !== 'discussion' && (
                                                    <span className={`px-1 rounded border ${topic.type === 'help' ? 'border-red-500/30 text-red-400' : 'border-white/10'}`}>
                                                        {topic.type.toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="shrink-0 flex flex-col items-end justify-center text-text-muted pl-2 border-l border-white/5 min-w-[50px]">
                                            <span className="text-xs font-bold text-white">0</span>
                                            <span className="text-[8px] uppercase">{t('community.topic.responses')}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {topics.length > 0 && (
                            <div className="p-2 border-t border-white/10 text-right">
                                <button className="text-[10px] font-bold text-accent-purple hover:underline uppercase flex items-center justify-end gap-1 w-full">
                                    {t('community.topic.view_all')} <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>


                {/* ================= RIGHT COLUMN (Members & Related) ================= */}
                <div className="col-span-12 md:col-span-2 flex flex-col gap-4">
                    {/* Members Box */}
                    <div className="bg-[#161718] border border-white/10 p-2 rounded-sm">
                        <div className="flex justify-between items-center mb-2 px-1">
                            <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{t('community.detail.members_count')} ({community.members_count || 0})</h3>
                            <span className="text-[9px] text-accent-purple hover:underline cursor-pointer" onClick={() => setShowAllMembers(true)}>{t('community.detail.view_all')}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                            {membersPreview.map((m, i) => (
                                <div key={i} className="aspect-square bg-black border border-white/10 rounded-sm relative group cursor-pointer" title={m.username} onClick={() => navigate(getPath(`profile/${m.id}`))}>
                                    {m.avatar_url ? (
                                        <img src={m.avatar_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/20 group-hover:text-white">
                                            <span className="material-symbols-outlined text-sm">person</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-0.5">
                                        <span className="text-[8px] text-white truncate w-full">{m.username}</span>
                                    </div>
                                </div>
                            ))}
                            {/* Fill empty slots visually if less than 9 */}
                            {[...Array(Math.max(0, 9 - membersPreview.length))].map((_, i) => (
                                <div key={`empty-${i}`} className="aspect-square bg-white/5 rounded-sm"></div>
                            ))}
                        </div>
                    </div>

                    {/* Related Communities (Mockup for Visual) */}
                    <div className="bg-[#161718] border border-white/10 p-2 rounded-sm">
                        <div className="flex justify-between items-center mb-2 px-1">
                            <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{t('community.detail.related')}</h3>
                            <span className="text-[9px] text-accent-purple hover:underline cursor-pointer">{t('community.detail.view_all')}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {[1, 2, 3, 4].map((_, i) => (
                                <div key={i} className="aspect-square bg-black border border-white/10 rounded-sm flex items-center justify-center text-white/10 cursor-pointer hover:border-accent-purple/50">
                                    <span className="material-symbols-outlined">hub</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* Modals */}
            {showCreateTopic && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#161718] border border-white/10 p-6 max-w-2xl w-full shadow-2xl relative">
                        <h2 className="text-xl font-bold text-white mb-4">{t('community.topic.modal.title')}</h2>
                        <form onSubmit={handleCreateTopic} className="space-y-4">
                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-3">
                                    <label className="block text-xs uppercase font-bold text-white mb-1">{t('community.topic.modal.subject')}</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-black border border-white/20 p-2 text-white outline-none focus:border-accent-purple font-mono text-sm"
                                        value={topicTitle}
                                        onChange={e => setTopicTitle(e.target.value)}
                                        placeholder={t('community.topic.modal.subject')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase font-bold text-white mb-1">{t('community.topic.modal.type')}</label>
                                    <select
                                        className="w-full bg-black border border-white/20 p-2 text-white outline-none focus:border-accent-purple text-sm"
                                        value={topicType}
                                        onChange={e => setTopicType(e.target.value)}
                                    >
                                        <option value="discussion">{t('community.types.discussion')}</option>
                                        <option value="help">{t('community.types.help')}</option>
                                        <option value="debate">{t('community.types.debate')}</option>
                                        <option value="analysis">{t('community.types.analysis')}</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs uppercase font-bold text-white mb-1">{t('community.topic.modal.content')}</label>
                                <textarea
                                    required
                                    className="w-full bg-black border border-white/20 p-2 text-white outline-none focus:border-accent-purple h-40 resize-none font-mono text-sm"
                                    value={topicContent}
                                    onChange={e => setTopicContent(e.target.value)}
                                    placeholder={t('community.topic.modal.content')}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowCreateTopic(false)} className="px-4 py-2 text-text-muted hover:text-white text-xs font-bold uppercase">{t('community.topic.modal.cancel')}</button>
                                <button type="submit" className="bg-accent-purple text-white px-4 py-2 font-bold uppercase text-xs tracking-wider border border-accent-purple hover:bg-accent-purple/80">{t('community.topic.modal.send')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showManageModal && community && (
                <ManageCommunityModal
                    community={community}
                    onClose={() => setShowManageModal(false)}
                    onUpdate={loadCommunityData}
                />
            )}

            {showReportModal && (
                <ReportAbuseModal
                    communityId={id!}
                    onClose={() => setShowReportModal(false)}
                />
            )}

            {showAllMembers && (
                <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4">
                    <div className="bg-[#161718] border border-white/10 w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl relative">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white uppercase tracking-wider">{t('community.members.title')}</h2>
                            <button onClick={() => setShowAllMembers(false)} className="text-text-muted hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <MemberManagement communityId={id!} currentUserRole={memberStatus === 'owner' || memberStatus === 'moderator' ? memberStatus : 'member'} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityDetail;
