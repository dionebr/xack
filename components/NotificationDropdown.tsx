
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ASSETS } from '../constants';
import { useTranslation } from '../context/TranslationContext';


interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
    notifications: any[];
    loading: boolean;
    markAllAsRead: () => void;
    refresh: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose, userId, notifications, loading, markAllAsRead, refresh }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Call refresh parent (Layout) when actions happen
    const wrappedOnAccept = () => {
        refresh();
    };

    useEffect(() => {
        if (isOpen) {
            markAllAsRead();
            wrappedOnAccept(); // Trigger parent update to clear badge
        }
    }, [isOpen]);

    const handleAccept = async (friendshipId: string) => { await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId); wrappedOnAccept(); };
    const handleIgnore = async (friendshipId: string) => { await supabase.from('friendships').delete().eq('id', friendshipId); wrappedOnAccept(); };
    const handleCommunityAction = async (memberId: string, action: 'approve' | 'reject') => {
        if (action === 'approve') await supabase.from('community_members').update({ status: 'approved' }).eq('id', memberId);
        else await supabase.from('community_members').delete().eq('id', memberId);
        wrappedOnAccept();
    };

    const getProfileLink = (user: any) => `/profile/${user.short_id || user.username || user.id}`;
    const getTimeAgo = (dateString: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
        if (seconds < 60) return t('notifications.time.just_now');
        if (seconds < 3600) return `${Math.floor(seconds / 60)}${t('notifications.time.ago').replace('ago', 'm ago').replace('atrás', 'm atrás')}`; // Keeping it simple for now, ideally parameterized
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}${t('notifications.time.ago').replace('ago', 'h ago').replace('atrás', 'h atrás')}`;
        return `${Math.floor(seconds / 86400)}d ago`; // Days usually standard, but let's leave. Actually simpler: 
    };

    // Better TimeAgo approach using key split or simple string concatenation if languages are similar structure.
    // PT: 5m atrás, EN: 5m ago.
    const getTimeAgoTranslated = (dateString: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
        const ago = t('notifications.time.ago');
        if (seconds < 60) return t('notifications.time.just_now');
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${ago}`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${ago}`;
        return `${Math.floor(seconds / 86400)}d ${ago}`;
    };

    return (
        <>
            {isOpen && <div className="fixed inset-0 z-[999]" onClick={onClose} />}
            <div className={`absolute top-16 right-4 w-96 bg-bg-card rounded-xl shadow-2xl border border-white/10 overflow-hidden z-[1000] ${!isOpen ? 'hidden' : ''}`}>
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">{t('notifications.title')}</h3>
                    <div className="flex gap-2">
                        {notifications.length > 0 && (
                            <button onClick={(e) => {
                                e.stopPropagation();
                                markAllAsRead();
                                wrappedOnAccept();
                            }} className="px-3 py-1 text-xs font-semibold text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded transition-all cursor-pointer">{t('notifications.mark_read')}</button>
                        )}
                        <button onClick={onClose} className="text-white/60 hover:text-white transition-colors"><span className="material-symbols-outlined text-xl">close</span></button>
                    </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                    {loading ? <div className="p-8 text-center text-text-muted text-sm">{t('community.loading')}</div> : notifications.length === 0 ? <div className="p-8 text-center text-text-muted text-sm">{t('notifications.empty')}</div> : (
                        <div className="divide-y divide-white/5">
                            {notifications.map(notif => {
                                const user = notif.user;

                                // -- RENDERERS --
                                if (notif.type === 'community_request') {
                                    return (
                                        <div key={notif.id} className="p-4 hover:bg-white/5 transition-colors" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-start gap-3">
                                                <img src={user.avatar_url || ASSETS.creatorPhoto} className="w-10 h-10 rounded-full object-cover cursor-pointer border border-white/10 hover:border-accent-purple transition-all" onClick={() => navigate(getProfileLink(user))} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-white text-sm font-bold truncate">{user.full_name || user.username}</div>
                                                    <div className="text-[11px] text-text-muted mb-2">{t('notifications.types.community_request')} <span className="text-white font-bold">{notif.data?.community?.title}</span></div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleCommunityAction(notif.id, 'approve')} className="px-3 py-1 bg-accent-purple text-white text-[10px] font-bold uppercase rounded hover:brightness-110">{t('notifications.actions.approve')}</button>
                                                        <button onClick={() => handleCommunityAction(notif.id, 'reject')} className="px-3 py-1 bg-white/10 text-text-muted text-[10px] font-bold uppercase rounded hover:bg-white/20">{t('notifications.actions.reject')}</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                if (notif.type === 'achievement' || notif.type === 'purchase') {
                                    const isPurchase = notif.type === 'purchase';
                                    return (
                                        <div key={notif.id} className="p-4 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => { if (notif.data?.machine_id) navigate(`/machines/${notif.data.machine_id}`); else if (notif.data?.challenge_id) navigate(`/machines/${notif.data.challenge_id}`); onClose(); }}>
                                            <div className="flex items-start gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-white/10 ${isPurchase ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                                                    <span className={`material-symbols-outlined text-[18px] ${isPurchase ? 'text-red-500' : 'text-green-500'}`}>{isPurchase ? 'shopping_cart' : 'emoji_events'}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-white text-sm font-bold truncate">{user.full_name || user.username}</div>
                                                    <div className="text-[11px] text-text-muted">{isPurchase ? t('notifications.types.purchased_exploit') : t('notifications.types.unlocked_machine')} <span className="text-white font-bold">{notif.data?.machine_id || 'Unknown'}</span></div>
                                                    <div className="text-[10px] text-white/30 mt-1">{getTimeAgoTranslated(notif.created_at)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                if (notif.type === 'friend_request') {
                                    return (
                                        <div key={notif.id} className="p-4 hover:bg-white/5 transition-colors" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-start gap-3">
                                                <img src={user.avatar_url || ASSETS.creatorPhoto} className="w-10 h-10 rounded-full object-cover cursor-pointer border border-white/10 hover:border-accent-purple" onClick={() => navigate(getProfileLink(user))} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-white text-sm font-bold truncate">{user.full_name || user.username}</div>
                                                    <div className="text-[11px] text-text-muted mb-2">{t('notifications.types.friend_request')}</div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleAccept(notif.id)} className="px-3 py-1 bg-accent-purple text-white text-[10px] font-bold uppercase rounded hover:brightness-110">{t('notifications.actions.accept')}</button>
                                                        <button onClick={() => handleIgnore(notif.id)} className="px-3 py-1 bg-white/10 text-text-muted text-[10px] font-bold uppercase rounded hover:bg-white/20">{t('notifications.actions.ignore')}</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                if (notif.type === 'new_post') {
                                    return (
                                        <div key={notif.id} className="p-4 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => { navigate('/'); onClose(); }}>
                                            <div className="flex items-start gap-3">
                                                <img src={user.avatar_url || ASSETS.creatorPhoto} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-white text-sm font-bold truncate">{user.full_name || user.username}</div>
                                                    <div className="text-[11px] text-text-muted">{t('notifications.types.new_post')}</div>
                                                    <div className="text-[11px] text-white/50 italic mt-0.5 truncate">{notif.data?.content}</div>
                                                    <div className="text-[10px] text-white/30 mt-1">{getTimeAgoTranslated(notif.created_at)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                if (notif.type === 'reply_post' || notif.type === 'reply_activity') {
                                    return (
                                        <div key={notif.id} className="p-4 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => { navigate('/'); onClose(); }}>
                                            <div className="flex items-start gap-3">
                                                <div className="relative">
                                                    <img src={user.avatar_url || ASSETS.creatorPhoto} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-accent-cyan rounded-full flex items-center justify-center border-2 border-bg-card">
                                                        <span className="material-symbols-outlined text-white text-[12px]">chat_bubble</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-white text-sm font-bold truncate">{user.full_name || user.username}</div>
                                                    <div className="text-[11px] text-text-muted">
                                                        {notif.type === 'reply_post' ? t('notifications.types.reply_post') : t('notifications.types.reply_activity')}
                                                    </div>
                                                    <div className="text-[11px] text-white/50 italic mt-0.5 truncate">{notif.data?.content}</div>
                                                    <div className="text-[10px] text-white/30 mt-1">{getTimeAgoTranslated(notif.created_at)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                if (notif.type === 'like_post' || notif.type === 'like_activity') {
                                    return (
                                        <div key={notif.id} className="p-4 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => { navigate('/'); onClose(); }}>
                                            <div className="flex items-start gap-3">
                                                <div className="relative">
                                                    <img src={user.avatar_url || ASSETS.creatorPhoto} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center border-2 border-bg-card">
                                                        <span className="material-symbols-outlined text-white text-[12px]">favorite</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-white text-sm font-bold truncate">{user.full_name || user.username}</div>
                                                    <div className="text-[11px] text-text-muted">
                                                        {notif.type === 'like_post' ? t('notifications.types.like_post') : t('notifications.types.like_activity')}
                                                    </div>
                                                    <div className="text-[10px] text-white/30 mt-1">{getTimeAgoTranslated(notif.created_at)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                // Flag Submission
                                return (
                                    <div key={notif.id} className="p-4 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => { navigate(`/machines/${notif.data?.challenge_id}`); onClose(); }}>
                                        <div className="flex items-start gap-3">
                                            <div className="relative">
                                                <img src={user.avatar_url || ASSETS.creatorPhoto} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-accent-purple rounded-full flex items-center justify-center border-2 border-bg-card">
                                                    <span className="material-symbols-outlined text-white text-[12px]">flag</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-white text-sm font-bold truncate">{user.full_name || user.username}</div>
                                                <div className="text-[11px] text-text-muted">{t('notifications.types.captured_flag')} <span className="text-accent-purple font-bold">{notif.data?.flag_type}</span> on <span className="text-white">{notif.data?.challenge_id}</span></div>
                                                <div className="text-[10px] text-white/30 mt-1">{getTimeAgoTranslated(notif.created_at)}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="p-3 border-t border-white/10 text-center">
                    <button onClick={() => { navigate('/friends'); onClose(); }} className="text-accent-purple text-xs font-bold uppercase hover:text-white transition-colors">{t('notifications.view_all')}</button>
                </div>
            </div>
        </>
    );
};

export default NotificationDropdown;
