import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { ASSETS } from '../../constants';
import { toast } from 'sonner';

interface ScrapBoardProps {
    userId: string;
    canPost: boolean;
}

const ScrapBoard: React.FC<ScrapBoardProps> = ({ userId, canPost }) => {
    const { user } = useAuth();
    const [scraps, setScraps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newScrap, setNewScrap] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadScraps();
    }, [userId]);

    const loadScraps = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('scraps')
            .select(`
                id, content, created_at,
                sender:sender_id(id, username, full_name, avatar_url)
            `)
            .eq('receiver_id', userId)
            .eq('is_private', false)
            .order('created_at', { ascending: false });

        if (error) console.error('Error loading scraps:', error);
        console.log('Scraps loaded:', data);
        setScraps(data || []);
        setLoading(false);
    };

    const handleSendScrap = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newScrap.trim()) return;

        setSending(true);
        try {
            const { error } = await supabase.from('scraps').insert({
                sender_id: user?.id,
                receiver_id: userId,
                content: newScrap,
                is_private: false
            });

            if (error) throw error;

            toast.success('Scrap sent!');
            setNewScrap('');
            loadScraps();
        } catch (e) {
            toast.error('Failed to send scrap');
        }
        setSending(false);
    };

    return (
        <div className="bg-bg-card rounded-[2.5rem] border border-white/5 p-10 shadow-card">
            <h3 className="text-xl font-display font-bold text-white mb-8 uppercase italic flex items-center gap-2">
                <span className="material-symbols-outlined text-accent-purple">sticky_note_2</span>
                Scrapbook <span className="text-text-muted text-sm not-italic ml-2">({scraps.length})</span>
            </h3>

            {/* Compose Area */}
            {canPost && (
                <div className="mb-8 bg-[#161718] p-4 border border-white/10 rounded-xl">
                    <form onSubmit={handleSendScrap}>
                        <textarea
                            className="w-full bg-black border border-white/10 rounded-lg p-3 text-white text-sm focus:border-accent-purple outline-none resize-none h-24 mb-2 font-mono"
                            placeholder="Leave a message for this operative..."
                            value={newScrap}
                            onChange={e => setNewScrap(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={sending || !newScrap.trim()}
                                className="bg-accent-purple text-white px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider hover:brightness-110 disabled:opacity-50"
                            >
                                {sending ? 'Posting...' : 'Post Scrap'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Scraps List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center text-text-muted text-xs italic">Loading scraps...</div>
                ) : scraps.length === 0 ? (
                    <div className="text-center text-text-muted text-xs italic py-8 border border-dashed border-white/10 rounded-xl">
                        No scraps yet. Be the first to say hello.
                    </div>
                ) : (
                    scraps.map(scrap => (
                        <div key={scrap.id} className="flex gap-4 p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors rounded-lg">
                            <div className="shrink-0 text-center">
                                <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden mb-1">
                                    <img src={scrap.sender?.avatar_url || ASSETS.creatorPhoto} className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="text-sm font-bold text-accent-purple hover:underline cursor-pointer">
                                        {scrap.sender?.full_name || scrap.sender?.username || 'Unknown'}
                                    </span>
                                    <span className="text-[9px] text-text-muted">
                                        {new Date(scrap.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap font-mono text-xs">
                                    {scrap.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ScrapBoard;
