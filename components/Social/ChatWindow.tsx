import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useSocial } from '../../context/SocialContext';
import { ASSETS } from '../../constants';

const ChatWindow: React.FC = () => {
    const { activeChat, closeChat, minimizeChat } = useSocial();
    const [friend, setFriend] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [friendTyping, setFriendTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isShaking, setIsShaking] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const channelRef = useRef<any>(null);
    const [friendPrivacy, setFriendPrivacy] = useState<any>({ allow_nudge: true, allow_messages: true });

    // UseCallback para playNotificationSound
    const playNotificationSound = useCallback(() => {
        try {
            const audio = new Audio(ASSETS.notificationSound);
            audio.volume = 1.0; // Volume máximo
            audio.play().catch(e => {
                console.error('Audio play failed', e);
            });
        } catch (e) {
            console.error('Audio error:', e);
        }
    }, []);

    // Carregar dados do usuário atual e do amigo
    useEffect(() => {
        const loadUsers = async () => {
            if (!activeChat) return;

            // Carregar usuário atual
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setCurrentUser(profile);
            }

            // Carregar dados do amigo
            const { data: friendData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', activeChat)
                .single();
            setFriend(friendData);

            // Carregar configurações de privacidade do amigo
            if (friendData?.privacy_settings) {
                setFriendPrivacy(friendData.privacy_settings);
            }
        };

        loadUsers();
    }, [activeChat]);

    // Carregar mensagens e subscrever a Realtime
    useEffect(() => {
        if (!activeChat || !currentUser) return;

        const loadMessages = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('direct_messages')
                .select('*')
                .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${activeChat}),and(sender_id.eq.${activeChat},receiver_id.eq.${currentUser.id})`)
                .order('created_at', { ascending: true });

            setMessages(data || []);
            setLoading(false);
        };

        loadMessages();

        // Subscrever a novas mensagens e eventos de digitação
        const channel = supabase
            .channel(`chat:${activeChat}:${currentUser.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'direct_messages',
                filter: `receiver_id=eq.${currentUser.id}`
            }, (payload) => {
                if (payload.new.sender_id === activeChat) {
                    setMessages(prev => [...prev, payload.new]);

                    // Tocar som e shake se for nudge
                    if (payload.new.is_nudge) {
                        triggerShake();
                    } else {
                        playNotificationSound();
                    }
                }
            })
            .on('broadcast', { event: 'typing' }, (payload) => {
                // Receber evento de digitação do amigo
                if (payload.payload.user_id === activeChat) {
                    setFriendTyping(true);

                    // Limpar timeout anterior
                    if (typingTimeoutRef.current) {
                        clearTimeout(typingTimeoutRef.current);
                    }

                    // Remover indicador após 2 segundos
                    typingTimeoutRef.current = setTimeout(() => {
                        setFriendTyping(false);
                    }, 2000);
                }
            })
            .subscribe();

        // Armazenar canal no ref para uso no handleTyping
        channelRef.current = channel;

        return () => {
            channelRef.current = null;
            supabase.removeChannel(channel);
        };
    }, [activeChat, currentUser, playNotificationSound]);

    const triggerShake = () => {
        // Shake the entire page
        document.body.style.animation = 'shake-screen 0.5s';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);

        setIsShaking(true);

        // Play nudge sound from MP3 file
        try {
            const audio = new Audio(ASSETS.nudgeSound);
            audio.volume = 0.7;
            audio.play().catch(e => {
                console.log('Nudge sound error:', e);
            });
        } catch (e) {
            console.log('Nudge audio error:', e);
        }

        setTimeout(() => setIsShaking(false), 500);
    };

    const handleTyping = () => {
        if (!isTyping && activeChat && currentUser && channelRef.current) {
            setIsTyping(true);
            // Enviar broadcast no canal existente
            channelRef.current.send({
                type: 'broadcast',
                event: 'typing',
                payload: { user_id: currentUser.id }
            });
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
        }, 2000);
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !activeChat || !currentUser) return;

        const msg = {
            sender_id: currentUser.id,
            receiver_id: activeChat,
            content: newMessage,
            is_nudge: false
        };

        // Optimistic UI
        const tempMsg = { ...msg, id: Date.now(), created_at: new Date().toISOString() };
        setMessages(prev => [...prev, tempMsg]);
        setNewMessage('');

        const { error } = await supabase.from('direct_messages').insert(msg);
        if (error) {
            console.error('Send error:', error);
            setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
        }
    };

    const triggerBuzz = async () => {
        if (!activeChat || !currentUser) return;
        const { error } = await supabase.from('direct_messages').insert({
            sender_id: currentUser.id,
            receiver_id: activeChat,
            content: '⚡ NUDGE',
            is_nudge: true
        });
        if (!error) {
            setMessages(prev => [...prev, {
                id: Date.now(),
                sender_id: currentUser.id,
                receiver_id: activeChat,
                content: '⚡ NUDGE',
                is_nudge: true,
                created_at: new Date().toISOString()
            }]);
        }
    };

    if (!activeChat) return null;

    return (
        <div className={`fixed bottom-0 right-8 w-[380px] bg-bg-card border border-white/10 rounded-t-2xl shadow-2xl z-[1000] flex flex-col ${isShaking ? 'animate-shake' : ''}`}>
            <audio ref={audioRef} src={ASSETS.buzzSound} />

            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-accent-purple/10 to-transparent">
                <div className="flex items-center gap-3">
                    <img src={friend?.avatar_url || ASSETS.creatorPhoto} className="w-8 h-8 rounded-full object-cover border border-accent-purple" />
                    <div>
                        <div className="text-white font-bold text-sm">{friend?.full_name || 'User'}</div>
                        {friendTyping && (
                            <div className="text-[10px] text-accent-purple italic flex items-center gap-1">
                                <span className="animate-pulse">typing</span>
                                <span className="flex gap-0.5">
                                    <span className="w-1 h-1 bg-accent-purple rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-1 h-1 bg-accent-purple rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-1 h-1 bg-accent-purple rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={triggerBuzz} className="text-yellow-400 hover:text-yellow-300 transition-colors" title="Buzz">
                        <span className="material-symbols-outlined text-lg">bolt</span>
                    </button>
                    <button onClick={() => minimizeChat(activeChat)} className="text-text-muted hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-lg">remove</span>
                    </button>
                    <button onClick={() => closeChat(activeChat)} className="text-text-muted hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px] bg-black/20">
                {loading ? (
                    <div className="text-center text-text-muted text-sm py-8">Loading...</div>
                ) : (
                    <>
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] px-3 py-2 rounded-lg ${msg.is_nudge
                                    ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 text-center font-bold animate-pulse'
                                    : msg.sender_id === currentUser?.id
                                        ? 'bg-accent-purple text-white'
                                        : 'bg-white/10 text-white'
                                    }`}>
                                    <div className="text-sm break-words">{msg.content}</div>
                                    <div className="text-[9px] opacity-50 mt-1">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10 bg-black/30">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-purple transition-all"
                    />
                    <button
                        onClick={sendMessage}
                        className="px-4 py-2 bg-accent-purple text-white rounded-lg hover:brightness-110 transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">send</span>
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
                    20%, 40%, 60%, 80% { transform: translateX(10px); }
                }
                .animate-shake {
                    animation: shake 0.5s;
                }
                @keyframes shake-screen {
                    0%, 100% { transform: translate(0, 0); }
                    10%, 30%, 50%, 70%, 90% { transform: translate(-10px, -5px); }
                    20%, 40%, 60%, 80% { transform: translate(10px, 5px); }
                }
            `}</style>
        </div>
    );
};

export default ChatWindow;
