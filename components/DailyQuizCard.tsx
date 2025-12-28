import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

const QUIZ_POOL = [
    { q: "Qual a flag do SQLMap para listar bancos?", a: "--dbs" },
    { q: "Qual o nome do ataque que explora buffer cheio?", a: "buffer overflow" },
    { q: "Qual porta o protocolo RDP usa?", a: "3389" },
    { q: "Qual ferramenta intercepta tráfego HTTP?", a: "burp suite" },
    { q: "O comando 'chmod 777' dá permissão total?", a: "sim" }
];

export const DailyQuizCard: React.FC = () => {
    const { profile, refreshProfile } = useAuth();
    const [status, setStatus] = useState<'LOADING' | 'READY' | 'DONE'>('LOADING');
    const [question, setQuestion] = useState<any>(null);
    const [answer, setAnswer] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        checkDailyStatus();
    }, [profile]);

    const checkDailyStatus = async () => {
        if (!profile) return;

        try {
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase
                .from('coin_transactions')
                .select('*')
                .eq('user_id', profile.id)
                .eq('type', 'QUIZ_REWARD')
                .gte('created_at', today)
                .limit(1);

            if (data && data.length > 0) {
                setStatus('DONE');
            } else {
                // Pick random question
                const randomQ = QUIZ_POOL[Math.floor(Math.random() * QUIZ_POOL.length)];
                setQuestion(randomQ);
                setStatus('READY');
            }
        } catch (e) {
            console.error(e);
            setStatus('READY'); // Fallback
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile || !question) return;

        const normalizedInput = answer.trim().toLowerCase();
        const normalizedTarget = question.a.toLowerCase();

        if (normalizedInput === normalizedTarget) {
            setSubmitting(true);
            try {
                // 1. Add coins
                const newBalance = (profile.coins || 0) + 10;
                await supabase.from('profiles').update({ coins: newBalance }).eq('id', profile.id);

                // 2. Log transaction
                await supabase.from('coin_transactions').insert({
                    user_id: profile.id,
                    amount: 10,
                    type: 'QUIZ_REWARD',
                    description: 'Daily Quiz Solved'
                });

                toast.success("CORRECT! +10 Coins added.");
                confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.7 },
                    colors: ['#fbbf24']
                });

                await refreshProfile();
                setStatus('DONE');
            } catch (err: any) {
                toast.error("Error claiming reward: " + err.message);
            } finally {
                setSubmitting(false);
            }
        } else {
            toast.error("INCORRECT. Try again.");
            setAnswer('');
        }
    };

    if (status === 'LOADING') return <div className="animate-pulse h-40 bg-white/5 rounded-3xl"></div>;

    if (status === 'DONE') {
        return (
            <div className="bg-bg-card rounded-[2.5rem] p-8 border border-white/5 shadow-card relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-full h-1 bg-green-500/50"></div>
                <div className="flex flex-col items-center text-center space-y-4 py-4">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                        <span className="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Daily Trivia Complete</h3>
                        <p className="text-[10px] text-text-muted mt-1">Come back tomorrow for more coins.</p>
                    </div>
                    <div className="px-4 py-1 bg-white/5 rounded-full text-[10px] font-mono text-green-500 font-bold">
                        Earned +10 Coins
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-bg-card rounded-[2.5rem] p-8 border border-white/5 shadow-card relative overflow-hidden group hover:border-accent-purple/30 transition-all">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.25em] mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-500 text-sm">lightbulb</span>
                Daily Intel Trivia
            </h3>

            <div className="space-y-6">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="text-xs font-mono text-white/90 leading-relaxed text-center">
                        "{question?.q}"
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="relative">
                    <input
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                        placeholder="Type answer..."
                        className="w-full bg-bg-main border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs text-white uppercase placeholder:text-white/20 focus:border-accent-purple outline-none"
                    />
                    <button
                        type="submit"
                        disabled={submitting || !answer}
                        className="absolute right-2 top-2 p-1.5 bg-white text-black rounded-lg hover:bg-accent-purple hover:text-white transition-all disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                    </button>
                </form>

                <div className="flex justify-between items-center text-[9px] font-black uppercase text-text-muted">
                    <span>Reward</span>
                    <span className="text-yellow-500">+10 COINS</span>
                </div>
            </div>
        </div>
    );
};
