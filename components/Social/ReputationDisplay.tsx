
import React from 'react';
import { useTranslation } from '../../context/TranslationContext';

interface ReputationDisplayProps {
    reputation: Record<string, number>;
}

const ReputationDisplay: React.FC<ReputationDisplayProps> = ({ reputation }) => {
    const { t } = useTranslation();
    const areas = ['web', 'ad', 'cloud', 'crypto', 'mobile', 'reverse'];

    const getLevel = (xp: number) => Math.floor((xp || 0) / 100) + 1;
    const getProgress = (xp: number) => (xp || 0) % 100;

    return (
        <div className="space-y-2 mb-6 bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <h4 className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-3">
                {t('profile.specializations')}
            </h4>
            {areas.map(area => {
                const xp = reputation?.[area] || 0;
                const level = getLevel(xp);
                return (
                    <div key={area} className="flex items-center gap-2">
                        <div className="w-14 text-[10px] text-accent-cyan uppercase tracking-wider font-mono font-bold">
                            {t(`post.areas.${area}`)}
                        </div>
                        <div className="flex-1 bg-black/40 h-2 rounded-full overflow-hidden border border-white/10">
                            <div
                                className="h-full bg-gradient-to-r from-accent-purple to-accent-cyan shadow-glow-sm"
                                style={{ width: `${getProgress(xp)}%` }}
                            />
                        </div>
                        <div className="w-10 text-[10px] text-white font-bold text-right font-mono">
                            Lvl {level}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ReputationDisplay;
