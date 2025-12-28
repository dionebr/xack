import React, { useMemo } from 'react';

interface SeniorityBadgeProps {
    createdAt: string;
    username?: string;
}

interface BadgeStyle {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: string;
    shadow: string;
    glitch?: boolean;
    duration: string;
    joined: string;
}

const SeniorityBadge: React.FC<SeniorityBadgeProps> = ({ createdAt, username }) => {
    const badge = useMemo<BadgeStyle>(() => {
        const createdDate = new Date(createdAt);
        const now = new Date();

        // Calculate precise duration
        let years = now.getFullYear() - createdDate.getFullYear();
        let months = now.getMonth() - createdDate.getMonth();
        if (months < 0) {
            years--;
            months += 12;
        }
        const durationString = years > 0
            ? `${years} Year${years > 1 ? 's' : ''}, ${months} Month${months !== 1 ? 's' : ''}`
            : `${months} Month${months !== 1 ? 's' : ''}`;

        const joinedDate = createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const badgeInfo = { duration: durationString, joined: joinedDate };

        // SPECIAL OVERRIDE FOR CREATOR
        if (username?.toLowerCase() === 'dione') {
            return {
                label: 'PRIME ARCHITECT',
                color: 'text-amber-400',
                bg: 'bg-amber-400/10',
                border: 'border-amber-400/50',
                icon: 'architecture',
                shadow: 'shadow-[0_0_15px_rgba(251,191,36,0.5)]',
                glitch: true,
                ...badgeInfo
            };
        }

        const diffTime = Math.abs(now.getTime() - createdDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffYears = diffDays / 365;
        const diffMonths = diffDays / 30;

        let style = {
            label: 'INITIATE',
            color: 'text-gray-400',
            bg: 'bg-gray-500/10',
            border: 'border-gray-500/30',
            icon: 'person_outline',
            shadow: '',
            glitch: false
        };

        if (diffYears >= 2) {
            style = {
                label: 'LEGEND',
                color: 'text-yellow-500',
                bg: 'bg-yellow-500/10',
                border: 'border-yellow-500/30',
                icon: 'military_tech',
                shadow: 'shadow-[0_0_10px_rgba(234,179,8,0.3)]',
                glitch: false
            };
        } else if (diffYears >= 1) {
            style = {
                label: 'ELITE',
                color: 'text-purple-500',
                bg: 'bg-purple-500/10',
                border: 'border-purple-500/30',
                icon: 'workspace_premium',
                shadow: 'shadow-[0_0_10px_rgba(168,85,247,0.3)]',
                glitch: false
            };
        } else if (diffMonths >= 6) {
            style = {
                label: 'VETERAN',
                color: 'text-blue-500',
                bg: 'bg-blue-500/10',
                border: 'border-blue-500/30',
                icon: 'shield',
                shadow: 'shadow-glow-sm',
                glitch: false
            };
        } else if (diffMonths >= 1) {
            style = {
                label: 'OPERATIVE',
                color: 'text-emerald-500',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/30',
                icon: 'verified_user',
                shadow: '',
                glitch: false
            };
        }

        return { ...style, ...badgeInfo };
    }, [createdAt, username]);

    return (
        <div className="group relative inline-flex items-center">
            <div className={`
                inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${badge.border} ${badge.bg} ${badge.shadow} 
                transition-all hover:scale-105 cursor-help select-none z-10
            `}>
                <span className={`material-symbols-outlined text-[14px] ${badge.color} ${badge.glitch ? 'animate-pulse' : ''}`}>
                    {badge.icon}
                </span>
                <span className={`text-[9px] font-black tracking-widest uppercase ${badge.color} relative`}>
                    {badge.label}
                    {badge.glitch && (
                        <span className="absolute inset-0 opacity-50 blur-[2px] animate-pulse">
                            {badge.label}
                        </span>
                    )}
                </span>
            </div>

            {/* HOVER TOOLTIP */}
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 w-64 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[100] translate-x-[-10px] group-hover:translate-x-0">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                    {/* Background Noise */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>

                    {/* Connecting Line (Arrow pointing left) */}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#0a0a0a] border-b border-l border-white/10 rotate-45"></div>

                    <div className="relative z-10 space-y-3">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                            <div className={`p-2 rounded-lg bg-white/5 ${badge.color}`}>
                                <span className="material-symbols-outlined text-xl">{badge.icon}</span>
                            </div>
                            <div>
                                <div className={`text-xs font-black uppercase ${badge.color} tracking-wider`}>{badge.label}</div>
                                <div className="text-[9px] text-text-muted uppercase tracking-widest">Security Clearance</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-text-muted uppercase tracking-wider">Time in Service</span>
                                <span className="text-white font-mono">{badge.label === 'PRIME ARCHITECT' ? 'ETERNAL' : badge.duration}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-text-muted uppercase tracking-wider">Commissioned</span>
                                <span className="text-white font-mono">{badge.joined}</span>
                            </div>
                        </div>

                        {badge.label === 'PRIME ARCHITECT' && (
                            <div className="pt-2 border-t border-white/5">
                                <p className="text-[9px] text-amber-400/80 font-mono text-center italic">
                                    "The one who wrote the code."
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeniorityBadge;
