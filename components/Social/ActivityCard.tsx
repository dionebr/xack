import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ASSETS } from '../../constants';

interface ActivityCardProps {
    activity: any;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
    const navigate = useNavigate();
    const { user, type, content, metadata, created_at } = activity;
    const author = user || {};

    const getIcon = () => {
        switch (type) {
            case 'MACHINE_SOLVED': return 'flag';
            case 'QUIZ_SOLVED': return 'school';
            case 'COINS_EARNED': return 'monetization_on'; // Yellow
            case 'LEVEL_UP': return 'upgrade';
            default: return 'notifications';
        }
    };

    const getColor = () => {
        switch (type) {
            case 'MACHINE_SOLVED': return 'text-red-500';
            case 'QUIZ_SOLVED': return 'text-accent-cyan';
            case 'COINS_EARNED': return 'text-yellow-500';
            default: return 'text-white';
        }
    };

    return (
        <div className="relative pl-12 py-4 group animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Timeline Connector Line */}
            <div className="absolute left-[22px] top-0 bottom-0 w-[2px] bg-white/5 group-last:bottom-auto group-last:h-4"></div>

            {/* Avatar (Left) */}
            <div className="absolute left-0 top-4 cursor-pointer" onClick={() => navigate(`/profile/${author.short_id || author.username}`)}>
                <img
                    src={author.avatar_url || ASSETS.creatorPhoto}
                    className="w-11 h-11 rounded-full border-2 border-[#161718] object-cover relative z-10 transition-transform hover:scale-105"
                />

                {/* Type Icon Badge */}
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#161718] flex items-center justify-center border border-white/10 z-20`}>
                    <span className={`material-symbols-outlined text-[10px] ${getColor()}`}>{getIcon()}</span>
                </div>
            </div>

            {/* Content (Right) */}
            <div className="bg-transparent group-hover:bg-white/[0.02] p-2 -my-2 rounded-xl transition-colors">
                {/* Header */}
                <div className="flex items-center gap-2 mb-0.5">
                    <span
                        className="font-bold text-sm text-white hover:underline cursor-pointer"
                        onClick={() => navigate(`/profile/${author.short_id || author.username}`)}
                    >
                        {author.full_name || author.username || 'Unknown Agent'}
                    </span>
                    <span className="text-[11px] text-text-muted font-mono">@{author.short_id || author.username}</span>
                    <span className="text-[10px] text-white/20">•</span>
                    <span className="text-[10px] text-text-muted hover:underline cursor-pointer">
                        {new Date(created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                {/* Body */}
                <div className="text-[13px] text-white/80 leading-snug mb-2">
                    {/* System Badge */}
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider mr-2 align-middle border ${type === 'MACHINE_SOLVED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                            type === 'QUIZ_SOLVED' ? 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20' :
                                'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        }`}>
                        <span className="material-symbols-outlined text-[10px]">{getIcon()}</span>
                        {type.replace('_', ' ')}
                    </span>

                    {content}
                </div>

                {/* Rewards / Metadata */}
                {metadata?.coins && (
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-400 bg-yellow-400/5 px-2 py-1 rounded-md border border-yellow-400/10">
                            <span className="material-symbols-outlined text-xs">monetization_on</span>
                            +{metadata.coins} COINS
                        </div>
                    </div>
                )}

                {/* Footer (Mock Interactions) */}
                <div className="flex items-center gap-6 mt-2">
                    <button className="flex items-center gap-1.5 text-text-muted/50 hover:text-red-400 transition-colors group/act">
                        <span className="material-symbols-outlined text-[14px] group-hover/act:scale-110 transition-transform">favorite</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-text-muted/50 hover:text-accent-cyan transition-colors group/act">
                        <span className="material-symbols-outlined text-[14px] group-hover/act:scale-110 transition-transform">chat_bubble</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-text-muted/50 hover:text-green-400 transition-colors group/act">
                        <span className="material-symbols-outlined text-[14px] group-hover/act:scale-110 transition-transform">ios_share</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActivityCard;
