import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Community {
    id: string;
    title: string;
    icon_url: string;
    category: string;
    members_count?: number;
}

const CommunityList: React.FC = () => {
    const navigate = useNavigate();
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCommunities();
    }, []);

    const loadCommunities = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // First fetch communities the user is a member of
            const { data: memberData } = await supabase
                .from('community_members')
                .select('community_id')
                .eq('user_id', user.id)
                .eq('status', 'approved')
                .limit(9); // 3x3 grid max

            if (memberData && memberData.length > 0) {
                const ids = memberData.map(m => m.community_id);
                const { data: commData } = await supabase
                    .from('communities')
                    .select('id, title, icon_url, category')
                    .in('id', ids);

                // Buscar contagem de membros para cada comunidade
                const communitiesWithCount = await Promise.all(
                    (commData || []).map(async (comm) => {
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
            } else {
                // Determine if we should show "Featured" or "Popular" if user has no communities?
                // For now just empty or "Join One"
                setCommunities([]);
            }
        }
        setLoading(false);
    };

    return (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-2 px-1">
                <h3 className="text-accent-purple text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">groups</span>
                    Communities
                </h3>
                <span className="text-[10px] text-text-muted cursor-pointer hover:text-white" onClick={() => navigate('/communities')}>
                    See All
                </span>
            </div>

            <div className="bg-[#161718] border border-white/10 p-2">
                {loading ? (
                    <div className="text-center py-4 text-xs text-text-muted">Loading...</div>
                ) : communities.length === 0 ? (
                    <div className="text-center py-6 text-text-muted flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-2xl opacity-30">group_off</span>
                        <div className="text-[10px]">No communities yet</div>
                        <button
                            onClick={() => navigate('/communities/create')}
                            className="text-[10px] text-accent-purple border border-accent-purple/30 px-2 py-1 hover:bg-accent-purple/10 uppercase font-bold"
                        >
                            Join / Create
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                        {communities.map(comm => (
                            <div
                                key={comm.id}
                                className="aspect-square bg-black border border-white/5 relative group cursor-pointer hover:border-accent-purple/50 transition-colors"
                                onClick={() => navigate(`/communities/${comm.id}`)}
                                title={comm.title}
                            >
                                {comm.icon_url ? (
                                    <img src={comm.icon_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/20 group-hover:text-accent-purple/50">
                                        <span className="material-symbols-outlined text-xl">
                                            {comm.category === 'web' ? 'language' :
                                                comm.category === 'ad' ? 'domain' :
                                                    comm.category === 'cloud' ? 'cloud' : 'forum'}
                                        </span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex flex-col items-start justify-end p-1">
                                    <span className="text-[9px] text-white truncate w-full font-bold">{comm.title}</span>
                                    <span className="text-[8px] text-text-muted">{comm.members_count || 0} members</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {communities.length > 0 && (
                    <div className="mt-2 text-center border-t border-white/5 pt-2">
                        <button
                            onClick={() => navigate('/communities')}
                            className="text-[10px] text-accent-purple hover:underline uppercase font-bold"
                        >
                            Manage Communities
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityList;
