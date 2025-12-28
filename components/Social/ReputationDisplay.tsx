
import React from 'react';

interface ReputationDisplayProps {
    reputation: Record<string, number>;
}

const ReputationDisplay: React.FC<ReputationDisplayProps> = ({ reputation }) => {
    const areas = ['web', 'ad', 'cloud', 'crypto', 'mobile', 'reverse'];

    const getLevel = (xp: number) => Math.floor((xp || 0) / 100) + 1;
    const getProgress = (xp: number) => (xp || 0) % 100;

    return (
        <div className="space-y-3 mb-6">
            <h4 className="text-[10px] text-text-muted uppercase font-bold border-b border-white/5 pb-1 mb-2">
                Specializations
            </h4>
            {areas.map(area => {
                const xp = reputation?.[area] || 0;
                const level = getLevel(xp);
                return (
                    <div key={area} className="flex items-center gap-2">
                        <div className="w-12 text-[10px] text-text-muted uppercase tracking-wider font-mono">
                            {area}
                        </div>
                        <div className="flex-1 bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-accent-purple"
                                style={{ width: `${getProgress(xp)}%` }}
                            />
                        </div>
                        <div className="w-8 text-[10px] text-white font-bold text-right font-mono">
                            Lvl {level}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ReputationDisplay;
