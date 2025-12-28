import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

interface Community {
    id: string;
    title: string;
    description: string;
    category: string;
    icon_url: string;
    members_count?: number;
}

const CATEGORIES = [
    { id: 'all', label: 'All Communities', icon: 'groups' },
    { id: 'web', label: 'Web Hacking', icon: 'language' },
    { id: 'ad', label: 'Active Directory', icon: 'domain' },
    { id: 'cloud', label: 'Cloud Security', icon: 'cloud' },
    { id: 'study', label: 'Study Groups', icon: 'school' },
    { id: 'off-topic', label: 'Off-Topic', icon: 'coffee' }
];

const CommunityHub: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [communities, setCommunities] = useState<Community[]>([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Create Form State
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newCategory, setNewCategory] = useState('web');

    useEffect(() => {
        loadCommunities();
    }, [activeCategory]);

    const loadCommunities = async () => {
        setLoading(true);
        let query = supabase.from('communities').select('*');

        if (activeCategory !== 'all') {
            query = query.eq('category', activeCategory);
        }

        const { data, error } = await query;
        if (error) {
            toast.error('Failed to load communities');
            setLoading(false);
        } else {
            // Buscar contagem de membros para cada comunidade
            const communitiesWithCount = await Promise.all(
                (data || []).map(async (comm) => {
                    const { count } = await supabase
                        .from('community_members')
                        .select('*', { count: 'exact', head: true })
                        .eq('community_id', comm.id)
                        .neq('status', 'pending');

                    return {
                        ...comm,
                        members_count: count || 0
                    };
                })
            );

            setCommunities(communitiesWithCount);
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        try {
            const { data, error } = await supabase
                .from('communities')
                .insert({
                    title: newTitle,
                    description: newDescription,
                    category: newCategory,
                    owner_id: user?.id
                })
                .select()
                .single();

            if (error) throw error;

            // Auto-join as owner
            await supabase.from('community_members').insert({
                community_id: data.id,
                user_id: user?.id,
                role: 'owner'
            });

            toast.success('Community created!');
            setShowCreateModal(false);
            loadCommunities();
            navigate(`/communities/${data.id}`);

        } catch (e: any) {
            toast.error(e.message);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-1">
                        <span className="text-accent-purple">Community</span> Hub
                    </h1>
                    <p className="text-text-muted text-sm">Join the underground. Share knowledge. Build legacy.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-accent-purple text-white px-4 py-2 font-bold uppercase text-xs tracking-wider hover:brightness-110 flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    Create Community
                </button>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Left Sidebar: Categories */}
                <div className="col-span-12 md:col-span-3">
                    <div className="bg-[#161718] border border-white/10 p-2 sticky top-4">
                        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 px-2 py-1">Browse</h3>
                        <div className="space-y-1">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wide transition-all
                                        ${activeCategory === cat.id
                                            ? 'bg-accent-purple text-white'
                                            : 'text-text-muted hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content: Grid */}
                <div className="col-span-12 md:col-span-9">
                    {loading ? (
                        <div className="text-center py-20">
                            <span className="material-symbols-outlined animate-spin text-4xl text-accent-purple">sync</span>
                        </div>
                    ) : communities.length === 0 ? (
                        <div className="text-center py-20 border border-white/5 border-dashed rounded bg-white/5">
                            <span className="material-symbols-outlined text-4xl text-white/20 mb-2">sentiment_dissatisfied</span>
                            <p className="text-text-muted">No communities found in this sector.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {communities.map(comm => (
                                <div
                                    key={comm.id}
                                    onClick={() => navigate(`/communities/${comm.id}`)}
                                    className="bg-[#161718] border border-white/10 p-4 hover:border-accent-purple/50 transition-all cursor-pointer group relative overflow-hidden"
                                >
                                    <div className="flex items-start gap-4 mb-3">
                                        <div className="w-12 h-12 bg-black flex items-center justify-center border border-white/10 group-hover:border-accent-purple transition-colors shrink-0">
                                            {comm.icon_url ? (
                                                <img src={comm.icon_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="material-symbols-outlined text-white/20 group-hover:text-accent-purple">{CATEGORIES.find(c => c.id === comm.category)?.icon || 'groups'}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-white font-bold text-sm truncate group-hover:text-accent-purple transition-colors">{comm.title}</h3>
                                            <span className="text-[10px] text-text-muted uppercase border border-white/10 px-1 py-0.5 rounded inline-block mt-1">
                                                {CATEGORIES.find(c => c.id === comm.category)?.label}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-text-muted text-xs line-clamp-2 h-8 mb-4">{comm.description || 'No description provided.'}</p>

                                    <div className="flex justify-between items-center text-[10px] text-text-muted border-t border-white/5 pt-3 mt-auto">
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">group</span>
                                            {comm.members_count || 0} Members
                                        </span>
                                        <span className="group-hover:translate-x-1 transition-transform text-accent-purple">
                                            JOIN ACCESS &rarr;
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#161718] border border-white/10 p-6 max-w-md w-full shadow-2xl relative">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-accent-purple">add_location_alt</span>
                            Initialize Community
                        </h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase font-bold text-white mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-black border border-white/20 p-2 text-white outline-none focus:border-accent-purple"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    placeholder="e.g. JWT Crackers"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase font-bold text-white mb-1">Category</label>
                                <select
                                    className="w-full bg-black border border-white/20 p-2 text-white outline-none focus:border-accent-purple text-sm"
                                    value={newCategory}
                                    onChange={e => setNewCategory(e.target.value)}
                                >
                                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                                        <option key={c.id} value={c.id}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs uppercase font-bold text-white mb-1">Description</label>
                                <textarea
                                    className="w-full bg-black border border-white/20 p-2 text-white outline-none focus:border-accent-purple h-24 resize-none"
                                    value={newDescription}
                                    onChange={e => setNewDescription(e.target.value)}
                                    placeholder="What is this community about?"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-text-muted hover:text-white text-xs font-bold uppercase"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-accent-purple text-white px-4 py-2 font-bold uppercase text-xs tracking-wider hover:brightness-110"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityHub;
