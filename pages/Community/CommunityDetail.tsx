import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { ASSETS } from '../../constants';
import ManageCommunityModal from '../../components/Social/ManageCommunityModal';
import MemberManagement from '../../components/Social/MemberManagement';

const CommunityDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [community, setCommunity] = useState<any>(null);
    const [memberStatus, setMemberStatus] = useState<'none' | 'pending' | 'member' | 'moderator' | 'owner'>('none');
    const [topics, setTopics] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'topics' | 'members'>('topics');
    const [loading, setLoading] = useState(true);
    const [showCreateTopic, setShowCreateTopic] = useState(false);
    const [showManageModal, setShowManageModal] = useState(false);

    // Topic Form
    const [topicTitle, setTopicTitle] = useState('');
    const [topicContent, setTopicContent] = useState('');
    const [topicType, setTopicType] = useState('discussion');

    useEffect(() => {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || '');
        if (id && isUUID) {
            loadCommunityData();
        } else if (id) {
            navigate('/communities');
        }
    }, [id]);

    const loadCommunityData = async () => {
        setLoading(true);
        try {
            // Load Community Info
            const { data: comm, error } = await supabase.from('communities').select('*').eq('id', id).single();
            if (error) throw error;
            setCommunity(comm);

            // Load Membership
            if (user) {
                const { data: member } = await supabase
                    .from('community_members')
                    .select('role, status')
                    .eq('community_id', id)
                    .eq('user_id', user.id)
                    .single();

                if (member) {
                    if (member.status === 'pending') {
                        setMemberStatus('pending');
                    } else {
                        setMemberStatus(member.role);
                    }
                } else {
                    setMemberStatus('none');
                }
            }

            // Load Topics
            const { data: topicList } = await supabase
                .from('community_topics')
                .select('id, title, content, type, is_pinned, created_at, author_id')
                .eq('community_id', id)
                .order('is_pinned', { ascending: false })
                .order('created_at', { ascending: false });

            if (topicList && topicList.length > 0) {
                // Buscar dados dos autores separadamente
                const authorIds = [...new Set(topicList.map(t => t.author_id))];
                const { data: authors } = await supabase
                    .from('profiles')
                    .select('id, username, full_name, avatar_url')
                    .in('id', authorIds);

                // Combinar dados
                const topicsWithAuthors = topicList.map(topic => ({
                    ...topic,
                    author: authors?.find(a => a.id === topic.author_id)
                }));

                setTopics(topicsWithAuthors);
            } else {
                setTopics([]);
            }

        } catch (e) {
            toast.error('Failed to load community');
            navigate('/communities');
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

            if (status === 'pending') {
                setMemberStatus('pending');
                toast.success('Access requested. Waiting for approval.');
            } else {
                setMemberStatus('member');
                toast.success('You have joined the community!');
            }
        } catch (e) {
            toast.error('Failed to join');
        }
    };

    const handleLeave = async () => {
        try {
            await supabase.from('community_members').delete().eq('community_id', id).eq('user_id', user?.id);
            setMemberStatus('none');
            toast.success('You left the community.');
        } catch (e) {
            toast.error('Failed to leave');
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
            toast.error('Failed to create topic');
        }
    };

    if (loading) return <div className="p-8 text-center text-text-muted">Loading Community...</div>;
    if (!community) return null;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <div className="mb-4 text-xs font-mono text-text-muted">
                <span className="cursor-pointer hover:text-white" onClick={() => navigate('/communities')}>COMMUNITIES</span> / <span className="text-accent-purple">{community.title.toUpperCase()}</span>
            </div>

            {/* Banner/Header */}
            <div className="bg-[#161718] border border-white/10 p-6 flex items-start gap-6 mb-6 relative overflow-hidden">
                <div className="w-24 h-24 bg-black border border-white/20 shrink-0 relative z-10">
                    {community.icon_url ? (
                        <img src={community.icon_url} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-accent-purple text-4xl">
                            <span className="material-symbols-outlined">groups</span>
                        </div>
                    )}
                </div>
                <div className="flex-1 z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">{community.title}</h1>
                            <p className="text-text-muted text-sm max-w-2xl mb-4">{community.description}</p>
                        </div>
                        {memberStatus === 'owner' && (
                            <button
                                onClick={() => setShowManageModal(true)}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-text-muted hover:text-white transition-colors border border-white/5"
                                title="Manage Community"
                            >
                                <span className="material-symbols-outlined">settings</span>
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {memberStatus === 'none' ? (
                            <button
                                onClick={handleJoin}
                                className={`px-6 py-2 font-bold uppercase text-xs tracking-wider border hover:brightness-110 ${community.is_private ? 'bg-white/10 border-white/20 text-white' : 'bg-accent-purple border-accent-purple text-white'
                                    }`}
                            >
                                {community.is_private ? 'Request Access' : 'Join Community'}
                            </button>
                        ) : memberStatus === 'pending' ? (
                            <div className="flex gap-2">
                                <button disabled className="bg-white/5 text-white/50 px-4 py-2 font-bold uppercase text-xs tracking-wider border border-white/10 cursor-not-allowed">
                                    Request Pending
                                </button>
                                <button onClick={handleLeave} className="text-text-muted px-2 hover:text-red-500 text-xs uppercase font-bold">
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <button className="bg-white/5 text-white px-4 py-2 font-bold uppercase text-xs tracking-wider border border-white/10 cursor-default">
                                    Member ({memberStatus})
                                </button>
                                <button onClick={handleLeave} className="text-text-muted px-2 hover:text-red-500 text-xs uppercase font-bold">
                                    Leave
                                </button>
                            </div>
                        )}
                        <span className="text-[10px] text-text-muted uppercase border border-white/10 px-2 py-1 rounded">
                            Category: {community.category}
                        </span>
                    </div>
                </div>
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                    <span className="material-symbols-outlined text-[150px]">groups</span>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1 mb-6 border-b border-white/10">
                <button
                    onClick={() => setActiveTab('topics')}
                    className={`px-4 py-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'topics' ? 'border-accent-purple text-white' : 'border-transparent text-text-muted hover:text-white'}`}
                >
                    Topics
                </button>
                <button
                    onClick={() => setActiveTab('members')}
                    className={`px-4 py-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'members' ? 'border-accent-purple text-white' : 'border-transparent text-text-muted hover:text-white'}`}
                >
                    Members
                </button>
            </div>

            {/* Content */}
            {activeTab === 'topics' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-white font-bold text-sm uppercase">Recent Discussions</h2>
                        {memberStatus !== 'none' && (
                            <button
                                onClick={() => setShowCreateTopic(true)}
                                className="text-accent-purple hover:underline text-xs font-bold uppercase flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-sm">post_add</span>
                                New Topic
                            </button>
                        )}
                    </div>

                    <div className="space-y-1">
                        {topics.length === 0 ? (
                            <div className="bg-[#161718] p-8 text-center border border-white/10 text-text-muted">
                                No topics yet. Be the first to start a discussion.
                            </div>
                        ) : (
                            topics.map(topic => (
                                <div key={topic.id} onClick={() => navigate(`/communities/${id}/topic/${topic.id}`)} className="bg-[#161718] border border-white/10 p-3 hover:border-accent-purple/30 transition-colors group cursor-pointer flex gap-4">
                                    <div className="w-8 flex flex-col items-center pt-1 text-text-muted">
                                        <span className="material-symbols-outlined text-xl">
                                            {topic.is_pinned ? 'push_pin' :
                                                topic.type === 'help' ? 'help' :
                                                    topic.type === 'debate' ? 'campaign' :
                                                        topic.type === 'analysis' ? 'query_stats' : 'forum'}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {topic.is_pinned && <span className="bg-accent-purple text-white text-[9px] px-1 rounded font-bold uppercase">Pinned</span>}
                                            <h3 className="text-white font-bold text-sm group-hover:text-accent-purple transition-colors">{topic.title}</h3>
                                            <span className={`text-[9px] px-1 border rounded uppercase ${topic.type === 'help' ? 'text-red-400 border-red-400/20' : 'text-text-muted border-white/10'
                                                }`}>{topic.type}</span>
                                        </div>
                                        <div className="text-xs text-text-muted flex items-center gap-2">
                                            <span>by <span className="text-white hover:underline">{topic.author?.username || 'Unknown'}</span></span>
                                            <span>•</span>
                                            <span>{new Date(topic.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="text-right pl-4 border-l border-white/5 flex flex-col justify-center min-w-[60px]">
                                        <span className="text-xs font-bold text-white block">0</span>
                                        <span className="text-[9px] text-text-muted uppercase">Replies</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'members' && (
                <MemberManagement communityId={id!} currentUserRole={memberStatus === 'owner' || memberStatus === 'moderator' ? memberStatus : 'member'} />
            )}

            {/* Create Topic Modal */}
            {showCreateTopic && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#161718] border border-white/10 p-6 max-w-2xl w-full shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">New Topic</h2>
                        <form onSubmit={handleCreateTopic} className="space-y-4">
                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-3">
                                    <label className="block text-xs uppercase font-bold text-white mb-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-black border border-white/20 p-2 text-white outline-none focus:border-accent-purple"
                                        value={topicTitle}
                                        onChange={e => setTopicTitle(e.target.value)}
                                        placeholder="Topic Subject"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase font-bold text-white mb-1">Type</label>
                                    <select
                                        className="w-full bg-black border border-white/20 p-2 text-white outline-none focus:border-accent-purple text-sm"
                                        value={topicType}
                                        onChange={e => setTopicType(e.target.value)}
                                    >
                                        <option value="discussion">Discussion</option>
                                        <option value="help">Help Request</option>
                                        <option value="debate">Debate</option>
                                        <option value="analysis">Analysis</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs uppercase font-bold text-white mb-1">Content</label>
                                <textarea
                                    required
                                    className="w-full bg-black border border-white/20 p-2 text-white outline-none focus:border-accent-purple h-40 resize-none font-mono text-sm"
                                    value={topicContent}
                                    onChange={e => setTopicContent(e.target.value)}
                                    placeholder="Write your message here..."
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowCreateTopic(false)} className="px-4 py-2 text-text-muted hover:text-white text-xs font-bold uppercase">Cancel</button>
                                <button type="submit" className="bg-accent-purple text-white px-4 py-2 font-bold uppercase text-xs tracking-wider">Post Topic</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manage Community Modal */}
            {showManageModal && community && (
                <ManageCommunityModal
                    community={community}
                    onClose={() => setShowManageModal(false)}
                    onUpdate={loadCommunityData}
                />
            )}
        </div>
    );
};

export default CommunityDetail;
