
import React from 'react';

interface DuelCardProps {
    type: 'explain' | 'analysis' | 'payload';
    title: string;
    challenger: string;
    reward: string;
    timeLeft: string;
}

const DuelCard: React.FC<DuelCardProps> = ({ type, title, challenger, reward, timeLeft }) => {
    return (
        <div className="bg-[#161718] border border-white/10 relative group overflow-hidden hover:border-red-500/30 transition-all">
            <div className="absolute top-0 right-0 p-2 opacity-50 font-mono text-[9px] text-text-muted">
                {timeLeft}
            </div>

            <div className="p-5 flex flex-col h-full">
                <div className="mb-4">
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 border border-white/10 rounded text-white/50">
                        {type} DUEL
                    </span>
                </div>

                <h3 className="text-white font-bold text-lg leading-tight mb-2 group-hover:text-red-400 transition-colors">
                    {title}
                </h3>

                <p className="text-text-muted text-xs mb-6">
                    Challenged by <span className="text-white font-bold">{challenger}</span>
                </p>

                <div className="mt-auto flex items-center justify-between">
                    <div className="text-[10px] font-mono text-status-yellow">
                        REWARD: {reward}
                    </div>
                    <button className="bg-white/5 hover:bg-red-500 hover:text-white text-white/60 text-[10px] font-bold uppercase px-4 py-2 rounded transition-all">
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DuelCard;
