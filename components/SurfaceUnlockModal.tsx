import React, { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

interface Question {
    q: string;
    a: string;
}

interface SurfaceUnlockModalProps {
    onUnlock: () => void;
    onClose: () => void;
    machineQuestions?: Question[]; // Contextual questions from machine
    machineName?: string;
    machineId?: string;
}

const DEFAULT_CHALLENGES: Question[] = [
    { q: "Which Nmap scan type (flag) is known as 'Half-open' or Stealth scan?", a: "-sS" },
    { q: "What is the 4-byte Hex Magic Number (signature) for a Linux ELF binary?", a: "7f454c46" },
    { q: "Which specific sshd_config directive must be set to 'no' to prevent direct root login?", a: "PermitRootLogin" },
    { q: "What Linux capability allows a binary to bind to privileged ports (<1024) without being root?", a: "CAP_NET_BIND_SERVICE" },
    { q: "In Buffer Overflow, what specific CPU register points to the next instruction to be executed (x86)?", a: "EIP" },
    { q: "What is the name of the attack that exploits the way a web application processes XML input? (Acronym)", a: "XXE" },
    { q: "Which Burp Suite Intruder attack type uses a single payload set and iterates through them one by one?", a: "Sniper" },
    { q: "What flag is used in Hashcat to specify the attack mode as 'Brute-Force'?", a: "-a 3" }
];

export const SurfaceUnlockModal: React.FC<SurfaceUnlockModalProps> = ({ onUnlock, onClose, machineQuestions, machineName, machineId }) => {
    const { profile, refreshProfile } = useAuth();
    const [step, setStep] = useState<'QUIZ' | 'PURCHASE'>('QUIZ');

    // Use machine specific questions if available, otherwise default pool
    const [challenge] = useState<Question>(() => {
        const pool = (machineQuestions && machineQuestions.length > 0) ? machineQuestions : DEFAULT_CHALLENGES;
        return pool[Math.floor(Math.random() * pool.length)];
    });
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);

    const playSuccessSound = () => {
        const audio = new Audio('/assets/sounds/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => { });
    };

    const handleQuizSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const normalizedInput = answer.trim().toLowerCase();
        const normalizedTarget = challenge.a.toLowerCase();

        if (normalizedInput === normalizedTarget) {
            try {
                // 1. Reward Coins (Intel Bonus)
                if (profile) {
                    const { error } = await supabase.from('coin_transactions').insert({
                        user_id: profile.id,
                        amount: 25,
                        type: 'INTEL_UNLOCK',
                        description: `Bypassed Firewall on ${machineName || 'Unknown Host'}`
                    });
                    if (error) throw error;

                    // 2. Ensure Activity is Logged (if trigger doesn't catch it, let's be safe or rely on trigger)
                    // We'll insert activity explicitly to be sure for the Feed
                    await supabase.from('activities').insert({
                        user_id: profile.id,
                        type: 'achievement',
                        content: `bypassed the firewall on ${machineName}`,
                        metadata: {
                            machine_id: machineId,
                            coins: 25,
                            badge: 'security'
                        }
                    });

                    // 3. Broadcast to ALL users via Realtime Broadcast (bypasses RLS)
                    const channel = supabase.channel('global-activities');
                    await channel.send({
                        type: 'broadcast',
                        event: 'new_achievement',
                        payload: {
                            user_id: profile.id,
                            username: profile.username || profile.full_name || 'Unknown',
                            avatar_url: profile.avatar_url,
                            type: 'achievement',
                            content: `bypassed the firewall on ${machineName}`,
                            metadata: {
                                machine_id: machineId,
                                coins: 25,
                                badge: 'security'
                            },
                            created_at: new Date().toISOString()
                        }
                    });

                    await refreshProfile();
                }

                playSuccessSound();
                toast.success("FIREWALL BYPASSED! +25 COINS");
                confetti({
                    particleCount: 150,
                    spread: 90,
                    origin: { y: 0.6 },
                    colors: ['#22c55e', '#a855f7', '#ffffff']
                });
                onUnlock();
            } catch (err: any) {
                console.error("Unlock Error:", err);
                toast.error(`Unlock failed: ${err.message || 'Unknown error'}`);
                // onUnlock(); // Do NOT unlock if DB fails, to prevent exploit without record? Or keep it? 
                // Let's keep strict for now to debug. If it fails, user can't unlock.
            }
        } else {
            toast.error("ACCESS DENIED. Incorrect protocol.");
            setStep('PURCHASE');
        }
        setLoading(false);
    };

    const handlePurchase = async () => {
        if (!profile) return;
        if (profile.coins < 50) {
            toast.error("INSUFFICIENT FUNDS. Earn more coins by solving challenges.");
            return;
        }

        setLoading(true);
        try {
            const newBalance = profile.coins - 50;

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ coins: newBalance })
                .eq('id', profile.id);

            if (updateError) throw updateError;

            // Log transaction
            await supabase.from('coin_transactions').insert({
                user_id: profile.id,
                amount: -50,
                type: 'SURFACE_UNLOCK',
                description: `Purchased Exploit for ${machineName}`
            });

            // Log Activity
            await supabase.from('activities').insert({
                user_id: profile.id,
                type: 'purchase',
                content: `deployed a paid exploit against ${machineName}`,
                metadata: {
                    machine_id: machineId,
                    cost: 50,
                    badge: 'shopping_cart'
                }
            });

            await refreshProfile();
            toast.success("EXPLOIT PURCHASED. Surface Decrypted.");
            onUnlock();

        } catch (error: any) {
            toast.error("Transaction Failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="max-w-md w-full bg-bg-card border border-white/10 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse"></div>

                <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20 animate-pulse">
                        <span className="material-symbols-outlined text-red-500 text-3xl">lock</span>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-xl font-display font-black text-white italic uppercase tracking-widest">
                            {step === 'QUIZ' ? 'FIREWALL DETECTED' : 'ACCESS DENIED'}
                        </h3>
                        <p className="text-xs text-text-muted font-light px-4">
                            {step === 'QUIZ'
                                ? "Answer the security verification question to bypass the firewall for free."
                                : "Manual override failed. Purchase an exploit to force decryption."}
                        </p>
                    </div>

                    {step === 'QUIZ' ? (
                        <form onSubmit={handleQuizSubmit} className="space-y-4">
                            <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-left">
                                <span className="text-[10px] text-accent-purple font-bold uppercase tracking-wider block mb-2">Security Question</span>
                                <p className="text-sm font-mono text-white">{challenge.q}</p>
                            </div>

                            <input
                                autoFocus
                                value={answer}
                                onChange={e => setAnswer(e.target.value)}
                                className="w-full bg-bg-main border border-white/10 text-white rounded-xl py-3 px-4 font-mono text-center uppercase placeholder:text-white/10 focus:border-accent-purple outline-none transition-all"
                                placeholder="TYPE ANSWER..."
                                disabled={loading}
                            />

                            <button type="submit" disabled={loading} className="w-full py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-accent-purple hover:text-white transition-all disabled:opacity-50">
                                {loading ? 'VERIFYING...' : 'ATTEMPT BYPASS'}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/20 flex justify-between items-center">
                                <span className="text-[10px] text-red-500 font-bold uppercase">Exploit Cost</span>
                                <span className="text-lg font-mono font-bold text-white">50 <span className="text-[10px] text-text-muted">COINS</span></span>
                            </div>

                            <div className="flex justify-between items-center px-2 text-[10px] text-text-muted">
                                <span>Your Balance:</span>
                                <span className={profile && profile.coins >= 50 ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                                    {profile?.coins || 0} COINS
                                </span>
                            </div>

                            <button
                                onClick={handlePurchase}
                                disabled={loading || (profile?.coins || 0) < 50}
                                className="w-full py-4 bg-accent-cyan text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 disabled:hover:bg-accent-cyan"
                            >
                                {loading ? "TRANSACTING..." : "PURCHASE EXPLOIT (-50 COINS)"}
                            </button>

                            <button onClick={() => setStep('QUIZ')} className="text-[10px] text-text-muted hover:text-white underline decoration-dotted">
                                Try Quiz Again
                            </button>
                        </div>
                    )}

                    <button onClick={onClose} className="text-[10px] text-text-muted hover:text-white uppercase tracking-widest">
                        ABORT OPERATION
                    </button>
                </div>
            </div>
        </div>
    );
};
