import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ASSETS } from '../constants';
import { useSocial } from '../context/SocialContext';

interface MessagesDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
}

const MessagesDropdown: React.FC<MessagesDropdownProps> = ({ isOpen, onClose, userId }) => {
    const { openChat, onlineUsers } = useSocial();
    const [friends, setFriends] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && userId) {
            loadFriends();
        }
    }, [isOpen, userId, onlineUsers]); // Re-sort when presence changes

    const loadFriends = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            // Fetch friends
            const { data } = await supabase
                .from('friendships')
                .select(`
                    id, 
                    user:user_id(id, username, full_name, avatar_url, short_id),
                    friend:friend_id(id, username, full_name, avatar_url, short_id)
                `)
                .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
                .eq('status', 'accepted');

            const friendList = (data || []).map((f: any) => {
                const isMe = f.user.id === userId;
                return isMe ? f.friend : f.user;
            });

            // Sort by Status Priority (Online > Busy > Away > Offline), then Name
            const statusPriority = { online: 3, busy: 2, away: 1, offline: 0 };

            const sorted = friendList.sort((a: any, b: any) => {
                const aPresence = onlineUsers.get(a.id);
                const bPresence = onlineUsers.get(b.id);

                const aStatus = aPresence?.status || 'offline';
                const bStatus = bPresence?.status || 'offline';

                const aPrio = statusPriority[aStatus];
                const bPrio = statusPriority[bStatus];

                if (aPrio !== bPrio) return bPrio - aPrio;
                return a.username.localeCompare(b.username);
            });

            setFriends(sorted);
        } catch (e) {
            console.error('Error loading friends for dropdown:', e);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'bg-green-500 shadow-[0_0_5px_#22c55e]';
            case 'busy': return 'bg-red-500 shadow-[0_0_5px_#ef4444]';
            case 'away': return 'bg-yellow-500 shadow-[0_0_5px_#eab308]';
            default: return 'bg-neutral-600';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'online': return 'Online';
            case 'busy': return 'Do Not Disturb';
            case 'away': return 'Away';
            default: return 'Offline';
        }
    };

    if (!isOpen) return null;

    // Calculate online count
    const onlineCount = Array.from(onlineUsers.values()).filter(p => p.status !== 'offline').length;

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose}></div>
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#161718] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-3 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-accent-purple text-sm">question_answer</span>
                        Messenger
                    </h3>
                    <div className="text-[10px] text-text-muted">
                        {onlineCount} Active
                    </div>
                </div>

                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="p-4 text-center">
                            <span className="material-symbols-outlined animate-spin text-accent-purple">sync</span>
                        </div>
                    ) : friends.length === 0 ? (
                        <div className="p-8 text-center text-text-muted flex flex-col items-center gap-2">
                            <span className="material-symbols-outlined text-2xl opacity-50">sentiment_dissatisfied</span>
                            <span className="text-xs">No friends found.</span>
                            <a href="#/friends" className="text-xs text-accent-purple hover:underline" onClick={onClose}>Add Friends</a>
                        </div>
                    ) : (
                        <div className="py-1">
                            {friends.map(friend => {
                                const presence = onlineUsers.get(friend.id);
                                const status = presence?.status || 'offline';
                                const isOnline = status !== 'offline';

                                return (
                                    <div
                                        key={friend.id}
                                        onClick={() => {
                                            openChat(friend.id);
                                            onClose();
                                        }}
                                        className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center gap-3 transition-colors border-b border-white/5 last:border-0 group"
                                    >
                                        <div className="relative">
                                            <img src={friend.avatar_url || ASSETS.creatorPhoto} className="w-9 h-9 rounded-full object-cover border border-white/10 group-hover:border-accent-purple transition-colors" />
                                            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#161718] ${getStatusColor(status)}`}></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-white truncate flex items-center gap-2">
                                                {friend.username}
                                                {isOnline && (
                                                    <span className={`text-[9px] font-normal uppercase tracking-wider border px-1 rounded bg-opacity-10 
                                                        ${status === 'online' ? 'text-green-500 border-green-500/30 bg-green-500' :
                                                            status === 'busy' ? 'text-red-500 border-red-500/30 bg-red-500' :
                                                                'text-yellow-500 border-yellow-500/30 bg-yellow-500'}`}>
                                                        {getStatusText(status)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-text-muted truncate group-hover:text-white/70">
                                                {isOnline ? 'Click to chat' : 'Offline'}
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined text-white/10 group-hover:text-accent-purple text-lg -mr-1">
                                            chat
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-2 border-t border-white/10 bg-white/5 text-center">
                    <a href="#/friends" onClick={onClose} className="text-xs text-accent-purple hover:text-white uppercase font-bold tracking-widest hover:underline">
                        View All Friends
                    </a>
                </div>
            </div>
        </>
    );
};

export default MessagesDropdown;
