import React, { useEffect, useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { supabase } from '../../lib/supabase';
import { ASSETS } from '../../constants';

const ChatDockItem: React.FC<{ userId: string }> = ({ userId }) => {
    const { openChat, closeChat } = useSocial();
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        supabase.from('profiles').select('username, avatar_url').eq('id', userId).single()
            .then(({ data }) => setProfile(data));
    }, [userId]);

    if (!profile) return <div className="w-[150px] h-8 bg-white/5 animate-pulse rounded-t-lg" />;

    return (
        <div
            className="bg-[#161718] border border-white/10 rounded-t-lg px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors min-w-[150px] shadow-lg animate-slide-up"
            onClick={() => openChat(userId)}
        >
            <div className="relative">
                <img src={profile.avatar_url || ASSETS.creatorPhoto} className="w-6 h-6 rounded-full object-cover border border-white/10" />
            </div>
            <span className="text-white text-xs font-bold truncate flex-1">{profile.username}</span>
            <button
                onClick={(e) => { e.stopPropagation(); closeChat(userId); }}
                className="text-text-muted hover:text-white p-1 hover:bg-white/10 rounded"
            >
                <span className="material-symbols-outlined text-[10px]">close</span>
            </button>
        </div>
    );
};

const ChatDock: React.FC = () => {
    const { minimizedChats, activeChat } = useSocial();

    if (minimizedChats.length === 0) return null;

    return (
        <div className={`fixed bottom-0 z-[999] px-4 flex gap-2 items-end transition-all duration-300 ${activeChat ? 'right-[400px]' : 'right-8'}`}>
            {minimizedChats.map(id => (
                <ChatDockItem key={id} userId={id} />
            ))}
            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </div>
    );
};

export default ChatDock;
