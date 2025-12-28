import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

interface TestimonialBoardProps {
    userId: string;
    canPost: boolean;
    isOwner: boolean;
}

const TestimonialBoard: React.FC<TestimonialBoardProps> = ({ userId, canPost, isOwner }) => {
    const { user } = useAuth();
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [pendingTestimonials, setPendingTestimonials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTestimonial, setNewTestimonial] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadTestimonials();
    }, [userId]);

    const loadTestimonials = async () => {
        setLoading(true);
        // Load approved
        const { data: approved } = await supabase
            .from('testimonials')
            .select(`*, sender:sender_id(id, full_name, username, avatar_url)`)
            .eq('receiver_id', userId)
            .eq('approved', true)
            .order('created_at', { ascending: false });

        setTestimonials(approved || []);

        // Load pending if owner
        if (isOwner) {
            const { data: pending } = await supabase
                .from('testimonials')
                .select(`*, sender:sender_id(id, full_name, username, avatar_url)`)
                .eq('receiver_id', userId)
                .eq('approved', false)
                .order('created_at', { ascending: false });
            setPendingTestimonials(pending || []);
        }
        setLoading(false);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTestimonial.trim()) return;

        setSending(true);
        try {
            const { error } = await supabase.from('testimonials').insert({
                sender_id: user?.id,
                receiver_id: userId,
                content: newTestimonial,
                approved: false // Always requires approval
            });

            if (error) throw error;
            toast.success('Testimonial sent! Waiting for validation.');
            setNewTestimonial('');
        } catch (e) {
            toast.error('Failed to submit testimonial');
        }
        setSending(false);
    };

    const handleApprove = async (id: string) => {
        try {
            await supabase.from('testimonials').update({ approved: true }).eq('id', id);
            toast.success('Testimonial approved');
            loadTestimonials();
        } catch (e) {
            toast.error('Failed to approve');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await supabase.from('testimonials').delete().eq('id', id);
            toast.success('Testimonial removed');
            loadTestimonials();
        } catch (e) {
            toast.error('Failed to remove');
        }
    };

    return (
        <div className="bg-bg-card rounded-[2.5rem] border border-white/5 p-10 shadow-card">
            <h3 className="text-xl font-display font-bold text-white mb-2 uppercase italic flex items-center gap-2">
                <span className="material-symbols-outlined text-accent-purple">rate_review</span>
                Endorsements <span className="text-text-muted text-sm not-italic ml-2">({testimonials.length})</span>
            </h3>
            <p className="text-text-muted text-xs mb-8">Professional validations and character references.</p>

            {/* Compose Area */}
            {canPost && !isOwner && (
                <div className="mb-8 bg-[#161718] p-4 border border-white/10 rounded-xl">
                    <form onSubmit={handleSend}>
                        <textarea
                            className="w-full bg-black border border-white/10 rounded-lg p-3 text-white text-sm focus:border-accent-purple outline-none resize-none h-24 mb-2 font-mono"
                            placeholder="Write an endorsement for this operative..."
                            value={newTestimonial}
                            onChange={e => setNewTestimonial(e.target.value)}
                        />
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-text-muted italic">* Requires approval from receiver</span>
                            <button
                                type="submit"
                                disabled={sending || !newTestimonial.trim()}
                                className="bg-accent-purple text-white px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider hover:brightness-110 disabled:opacity-50"
                            >
                                {sending ? 'Sending...' : 'Endorse'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Pending List (Owner Only) */}
            {isOwner && pendingTestimonials.length > 0 && (
                <div className="mb-8 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                    <h4 className="text-yellow-500 text-xs font-bold uppercase tracking-widest mb-4">Pending Approval ({pendingTestimonials.length})</h4>
                    <div className="space-y-3">
                        {pendingTestimonials.map(t => (
                            <div key={t.id} className="bg-black/40 p-3 rounded-lg border border-white/5 flex gap-3">
                                <div className="flex-1">
                                    <div className="text-xs font-bold text-white mb-1">{t.sender?.full_name}</div>
                                    <p className="text-text-muted text-xs italic">"{t.content}"</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleApprove(t.id)} className="p-2 hover:bg-green-500/20 text-green-500 rounded transition-colors" title="Approve">
                                        <span className="material-symbols-outlined text-lg">check</span>
                                    </button>
                                    <button onClick={() => handleDelete(t.id)} className="p-2 hover:bg-red-500/20 text-red-500 rounded transition-colors" title="Reject">
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Approved List */}
            <div className="space-y-6">
                {testimonials.map(t => (
                    <div key={t.id} className="bg-[#161718]/50 p-6 rounded-2xl border border-white/5 relative group">
                        <div className="absolute -top-3 -left-2 text-4xl text-white/5 font-serif">"</div>
                        <p className="text-white/90 text-sm italic leading-relaxed mb-4 relative z-10 pl-4 border-l-2 border-accent-purple/30">
                            {t.content}
                        </p>
                        <div className="flex items-center gap-3 pl-4">
                            <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden">
                                <img src={t.sender?.avatar_url} className="w-full h-full object-cover" />
                            </div>
                            <div className="text-xs">
                                <div className="text-white font-bold">{t.sender?.full_name}</div>
                                <div className="text-text-muted text-[10px]">{t.sender?.username}</div>
                            </div>
                        </div>
                        {isOwner && (
                            <button onClick={() => handleDelete(t.id)} className="absolute top-4 right-4 text-white/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                        )}
                    </div>
                ))}
                {!loading && testimonials.length === 0 && (
                    <div className="text-center text-text-muted text-xs italic py-8 border border-dashed border-white/10 rounded-xl">
                        No endorsements yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestimonialBoard;
