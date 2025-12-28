import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UserStats {
    id: string;
    full_name: string;
    avatar_url: string;
    squad: string;
    score: number;
    stats: {
        flags: number;
        machines: number;
        first_bloods: number;
    };
    is_online?: boolean;
    is_me?: boolean;
}

export const useAllianceRanking = (userId: string | undefined, timeFilter: 'weekly' | 'all' = 'all') => {
    const [ranking, setRanking] = useState<UserStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchRanking = async () => {
            try {
                setLoading(true);

                // Buscar amigos aceitos
                const { data: friendships, error: friendError } = await supabase
                    .from('friendships')
                    .select('friend_id')
                    .eq('user_id', userId)
                    .eq('status', 'accepted');

                if (friendError) throw friendError;

                const friendIds = friendships?.map(f => f.friend_id) || [];
                const allUserIds = [userId, ...friendIds];

                // Buscar perfis com stats
                const { data: profiles, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url, squad, score, stats, privacy_settings')
                    .in('id', allUserIds);

                if (profileError) throw profileError;

                // Filtrar usuários que permitem aparecer no ranking
                const visibleProfiles = profiles?.filter(p =>
                    p.id === userId || p.privacy_settings?.show_ranking !== false
                ) || [];

                // Ordenar por score
                const sorted = visibleProfiles
                    .map(p => ({
                        id: p.id,
                        full_name: p.full_name,
                        avatar_url: p.avatar_url,
                        squad: p.squad || 'Void',
                        score: p.score || 0,
                        stats: p.stats || { flags: 0, machines: 0, first_bloods: 0 },
                        is_me: p.id === userId
                    }))
                    .sort((a, b) => b.score - a.score);

                setRanking(sorted);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching ranking:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRanking();
    }, [userId, timeFilter]);

    return { ranking, loading, error };
};
