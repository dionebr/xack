import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface BreachSuccessProps {
    onComplete: () => void;
    timeTaken: number; // seconds
    attempts: number;
}

export const BreachSuccess: React.FC<BreachSuccessProps> = ({ onComplete, timeTaken, attempts }) => {
    const [phase, setPhase] = useState<'breach' | 'stats' | 'rewards'>('breach');
    const [visibleStats, setVisibleStats] = useState<string[]>([]);
    const [xpGained, setXpGained] = useState(0);

    const totalXP = 150;
    const stealthLevel = attempts <= 3 ? 'GHOST' : attempts <= 5 ? 'NINJA' : 'DETECTED';
    const timeBonus = timeTaken < 120 ? 50 : timeTaken < 300 ? 25 : 0;

    const stats = [
        { label: 'Time to Breach', value: `${Math.floor(timeTaken / 60)}:${(timeTaken % 60).toString().padStart(2, '0')}`, icon: 'schedule' },
        { label: 'Attempts', value: attempts.toString(), icon: 'target' },
        { label: 'Stealth Level', value: stealthLevel, icon: 'visibility_off' },
        { label: 'Time Bonus', value: `+${timeBonus} XP`, icon: 'bolt' },
    ];

    const badges = [
        { name: 'Recon Master', icon: 'search', color: 'text-accent-cyan', unlocked: true },
        { name: 'PoC Validator', icon: 'verified', color: 'text-status-green', unlocked: true },
        { name: 'Speed Hacker', icon: 'bolt', color: 'text-status-yellow', unlocked: timeTaken < 120 },
    ];

    useEffect(() => {
        // Confetti on mount
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#22c55e', '#ffffff', '#22d3ee']
        });

        // Phase 1: Breach message (6s)
        setTimeout(() => setPhase('stats'), 6000);
    }, []);

    useEffect(() => {
        if (phase === 'stats') {
            // Reveal stats one by one (600ms each = 2.4s)
            stats.forEach((_, index) => {
                setTimeout(() => {
                    setVisibleStats(prev => [...prev, stats[index].label]);
                }, index * 600);
            });

            // Total 5s for stats phase
            setTimeout(() => setPhase('rewards'), stats.length * 600 + 2600);
        }
    }, [phase]);

    useEffect(() => {
        if (phase === 'rewards') {
            // Animate XP counter (~2s)
            const interval = setInterval(() => {
                setXpGained(prev => {
                    if (prev >= totalXP + timeBonus) {
                        clearInterval(interval);
                        setTimeout(onComplete, 4000); // 4s delay = total 6s for this phase
                        return prev;
                    }
                    return prev + 5;
                });
            }, 60);

            return () => clearInterval(interval);
        }
    }, [phase]);

    return (
        <div className="relative w-full min-h-[500px] bg-gradient-to-br from-bg-main via-bg-card to-bg-main rounded-3xl border border-accent-cyan/20 overflow-hidden flex items-center justify-center p-8">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.2),transparent_50%)] animate-pulse" />
            </div>

            <div className="relative z-10 w-full max-w-2xl">
                {/* Phase 1: Breach Success */}
                {phase === 'breach' && (
                    <div className="text-center animate-in zoom-in duration-500">
                        {/* Broken Shield Icon */}
                        <div className="mb-6 relative inline-block">
                            <div className="absolute inset-0 bg-status-green/30 rounded-full blur-3xl animate-pulse" />
                            <div className="relative">
                                <span className="material-symbols-outlined text-9xl text-status-green drop-shadow-[0_0_30px_rgba(34,197,94,0.8)]">
                                    shield_with_heart
                                </span>
                                {/* Crack Effect */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-1 h-full bg-status-red rotate-45 opacity-80" />
                                    <div className="w-1 h-full bg-status-red -rotate-45 opacity-80 absolute" />
                                </div>
                            </div>
                        </div>

                        <h1 className="text-5xl font-display font-black text-white italic uppercase mb-4 tracking-wider animate-in slide-in-from-bottom duration-700" style={{ animationDelay: '200ms' }}>
                            FIREWALL BYPASSED
                        </h1>
                        <p className="text-lg text-status-green font-mono animate-in fade-in duration-700" style={{ animationDelay: '400ms' }}>
                            Access Granted • Security Compromised
                        </p>
                    </div>
                )}

                {/* Phase 2: Stats */}
                {phase === 'stats' && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                        <h2 className="text-2xl font-display font-black text-white italic uppercase text-center mb-6">
                            BREACH STATISTICS
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            {stats.map((stat, index) => (
                                <div
                                    key={stat.label}
                                    className={`bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 transition-all duration-500 ${visibleStats.includes(stat.label) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="material-symbols-outlined text-accent-cyan text-2xl">{stat.icon}</span>
                                        <span className="text-xs text-text-muted uppercase font-bold tracking-widest">{stat.label}</span>
                                    </div>
                                    <div className="text-2xl font-mono font-bold text-white">{stat.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Phase 3: Rewards */}
                {phase === 'rewards' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {/* XP Gained */}
                        <div className="text-center bg-gradient-to-r from-accent-cyan/20 via-status-green/20 to-accent-cyan/20 rounded-3xl border border-accent-cyan/30 p-8">
                            <div className="mb-4">
                                <span className="material-symbols-outlined text-7xl text-accent-cyan animate-bounce">stars</span>
                            </div>
                            <h3 className="text-xl font-bold text-white uppercase mb-2">XP GAINED</h3>
                            <div className="text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-status-green italic">
                                +{xpGained}
                            </div>
                        </div>

                        {/* Badges */}
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase mb-4 text-center">BADGES UNLOCKED</h3>
                            <div className="flex justify-center gap-4">
                                {badges.map((badge, index) => (
                                    <div
                                        key={badge.name}
                                        className={`relative group transition-all duration-500 ${badge.unlocked ? 'opacity-100 scale-100' : 'opacity-30 scale-90 grayscale'
                                            }`}
                                        style={{ animationDelay: `${index * 200}ms` }}
                                    >
                                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 ${badge.unlocked
                                                ? 'bg-gradient-to-br from-accent-cyan/20 to-status-green/20 border-accent-cyan shadow-[0_0_20px_rgba(34,211,238,0.5)]'
                                                : 'bg-white/5 border-white/10'
                                            }`}>
                                            <span className={`material-symbols-outlined text-5xl ${badge.unlocked ? badge.color : 'text-white/20'}`}>
                                                {badge.icon}
                                            </span>
                                        </div>
                                        {badge.unlocked && (
                                            <div className="absolute -top-2 -right-2">
                                                <span className="material-symbols-outlined text-status-green text-2xl drop-shadow-glow">check_circle</span>
                                            </div>
                                        )}
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <div className="bg-black/90 px-3 py-2 rounded-lg border border-accent-cyan/30 whitespace-nowrap">
                                                <div className="text-xs font-bold text-white">{badge.name}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Next Objectives */}
                        <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-accent-cyan/20 p-6">
                            <h3 className="text-xs font-bold text-accent-cyan uppercase mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">flag</span>
                                NEXT OBJECTIVES
                            </h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 text-sm text-white">
                                    <span className="material-symbols-outlined text-accent-cyan text-lg">radio_button_unchecked</span>
                                    <span>Capture User Flag</span>
                                    <span className="ml-auto text-xs text-accent-cyan font-mono">+20 XP</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-white">
                                    <span className="material-symbols-outlined text-accent-cyan text-lg">radio_button_unchecked</span>
                                    <span>Escalate to Root</span>
                                    <span className="ml-auto text-xs text-accent-cyan font-mono">+50 XP</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
