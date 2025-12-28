import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export type UserStatus = 'online' | 'busy' | 'away' | 'offline';

export interface UserPresence {
    user_id: string;
    status: UserStatus;
    online_at: string;
    last_seen: string;
}

interface SocialContextType {
    activeChat: string | null; // friend_id
    minimizedChats: string[];
    onlineUsers: Map<string, UserPresence>; // Changed from Set to Map
    currentUserStatus: UserStatus;
    openChat: (friendId: string) => void;
    minimizeChat: (friendId: string) => void;
    closeChat: (friendId: string) => void;
    updateStatus: (status: UserStatus) => Promise<void>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const SocialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [minimizedChats, setMinimizedChats] = useState<string[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<Map<string, UserPresence>>(new Map());
    const [currentUserStatus, setCurrentUserStatus] = useState<UserStatus>('online');
    const [channel, setChannel] = useState<any>(null);

    useEffect(() => {
        // Setup Presence Channel
        const newChannel = supabase.channel('global_presence', {
            config: {
                presence: {
                    key: 'user_presence'
                }
            }
        });

        newChannel
            .on('presence', { event: 'sync' }, () => {
                const state = newChannel.presenceState();
                const users = new Map<string, UserPresence>();
                console.log('🟢 Presence sync:', state);

                for (const id in state) {
                    state[id].forEach((presence: any) => {
                        if (presence.user_id) {
                            users.set(presence.user_id, {
                                user_id: presence.user_id,
                                status: presence.status || 'online',
                                online_at: presence.online_at,
                                last_seen: new Date().toISOString()
                            });
                        }
                    });
                }
                setOnlineUsers(users);
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                console.log('✅ User joined:', newPresences);
                setOnlineUsers(prev => {
                    const next = new Map(prev);
                    newPresences.forEach((p: any) => {
                        if (p.user_id) {
                            next.set(p.user_id, {
                                user_id: p.user_id,
                                status: p.status || 'online',
                                online_at: p.online_at || new Date().toISOString(),
                                last_seen: new Date().toISOString()
                            });
                        }
                    });
                    return next;
                });
            })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
                console.log('❌ User left:', leftPresences);
                setOnlineUsers(prev => {
                    const next = new Map(prev);
                    leftPresences.forEach((p: any) => {
                        if (p.user_id) next.delete(p.user_id);
                    });
                    return next;
                });
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await newChannel.track({
                            user_id: user.id,
                            online_at: new Date().toISOString(),
                            status: 'online' // Default status
                        });
                    }
                }
            });

        setChannel(newChannel);

        return () => {
            console.log('🔴 Unsubscribing from presence channel');
            supabase.removeChannel(newChannel);
        };
    }, []);

    const updateStatus = async (status: UserStatus) => {
        setCurrentUserStatus(status);
        if (channel) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await channel.track({
                    user_id: user.id,
                    online_at: new Date().toISOString(),
                    status: status
                });
            }
        }
    };

    const openChat = (friendId: string) => {
        setActiveChat(friendId);
        // Remove from minimized if there
        setMinimizedChats(prev => prev.filter(id => id !== friendId));
    };

    const minimizeChat = (friendId: string) => {
        if (activeChat === friendId) {
            setActiveChat(null);
            setMinimizedChats(prev => {
                if (!prev.includes(friendId)) return [...prev, friendId];
                return prev;
            });
        }
    };

    const closeChat = (friendId: string) => {
        if (activeChat === friendId) setActiveChat(null);
        setMinimizedChats(prev => prev.filter(id => id !== friendId));
    };

    return (
        <SocialContext.Provider value={{
            activeChat,
            minimizedChats,
            onlineUsers,
            currentUserStatus,
            openChat,
            minimizeChat,
            closeChat,
            updateStatus
        }}>
            {children}
        </SocialContext.Provider>
    );
};

export const useSocial = () => {
    const context = useContext(SocialContext);
    if (!context) throw new Error('useSocial must be used within a SocialProvider');
    return context;
};

