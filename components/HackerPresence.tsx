import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface HackerPresenceProps {
    userId: string;
    isOwnProfile?: boolean;
}

interface Activity {
    status: 'idle' | 'active';
    lab_id: string | null;
    lab_name: string | null;
    started_at: string | null;
}

const HackerPresence: React.FC<HackerPresenceProps> = ({ userId, isOwnProfile = false }) => {
    const [activity, setActivity] = useState<Activity>({
        status: 'idle',
        lab_id: null,
        lab_name: null,
        started_at: null
    });

    useEffect(() => {
        loadActivity();
        subscribeToActivity();
    }, [userId]);

    const loadActivity = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('current_activity')
            .eq('id', userId)
            .single();

        if (data?.current_activity) {
            setActivity(data.current_activity);
        }
    };

    const subscribeToActivity = () => {
        const channel = supabase
            .channel(`presence:${userId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'profiles',
                filter: `id=eq.${userId}`
            }, (payload: any) => {
                if (payload.new.current_activity) {
                    setActivity(payload.new.current_activity);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const getTimeAgo = (timestamp: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };

    const getActivityIcon = () => {
        if (activity.status === 'idle') return '💤';
        return '🧠';
    };

    const getActivityText = () => {
        if (activity.status === 'idle') return 'Idle';
        if (activity.lab_name) return `Exploiting ${activity.lab_name}`;
        return 'Active in Lab';
    };

    return (
        <div className="bg-black/40 border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{getActivityIcon()}</span>
                <h4 className="text-white/60 text-xs font-mono uppercase tracking-wider">Current Activity</h4>
            </div>

            <div className="space-y-1">
                <div className={`text-sm font-bold ${activity.status === 'active' ? 'text-accent-purple' : 'text-white/40'}`}>
                    {getActivityText()}
                </div>

                {activity.started_at && activity.status === 'active' && (
                    <div className="text-[10px] text-white/30 font-mono">
                        Started {getTimeAgo(activity.started_at)}
                    </div>
                )}

                {activity.status === 'idle' && (
                    <div className="text-[10px] text-white/30">
                        Not currently hacking
                    </div>
                )}
            </div>
        </div>
    );
};

export default HackerPresence;
