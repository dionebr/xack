import React, { useMemo } from 'react';

interface TrustMeterProps {
    ratings: {
        trust: number;
        cool: number;
        skill: number;
    };
    size?: 'sm' | 'md' | 'lg';
}

const TrustMeter: React.FC<TrustMeterProps> = ({ ratings, size = 'md' }) => {
    const bars = useMemo(() => [
        { label: 'Trust', icon: 'handshake', value: ratings.trust, color: 'text-amber-400', bg: 'bg-amber-400' },
        { label: 'Cool', icon: 'sentiment_satisfied', value: ratings.cool, color: 'text-blue-400', bg: 'bg-blue-400' },
        { label: 'Skill', icon: 'terminal', value: ratings.skill, color: 'text-accent-purple', bg: 'bg-accent-purple' }, // Replaced 'Sexy' with 'Skill'
    ], [ratings]);

    const sizeClasses = {
        sm: { icon: 'text-[10px]', gap: 'gap-0.5', p: 'p-1' },
        md: { icon: 'text-xs', gap: 'gap-1', p: 'p-1.5' },
        lg: { icon: 'text-sm', gap: 'gap-1.5', p: 'p-2' }
    };

    return (
        <div className={`flex items-center justify-center gap-4 select-none ${size === 'lg' ? 'scale-110' : ''}`}>
            {bars.map((bar) => (
                <div key={bar.label} className="flex flex-col items-center gap-1 group relative cursor-help">
                    <div className={`
                        flex items-center ${sizeClasses[size].gap} 
                        border border-white/10 rounded-lg ${sizeClasses[size].p} bg-[#0a0a0a]
                        group-hover:border-white/20 transition-colors
                    `}>
                        <span className={`material-symbols-outlined ${sizeClasses[size].icon} ${bar.color}`}>
                            {bar.icon}
                        </span>

                        <div className="flex gap-[1px]">
                            {[1, 2, 3].map((level) => (
                                <div
                                    key={level}
                                    className={`
                                        w-1.5 h-3 rounded-[1px] transition-all duration-300
                                        ${level <= bar.value
                                            ? `${bar.bg} shadow-[0_0_5px_currentColor] opacity-100`
                                            : 'bg-white/10 opacity-30'}
                                    `}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 border border-white/10 rounded text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        {Math.round((bar.value / 3) * 100)}% {bar.label}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TrustMeter;
