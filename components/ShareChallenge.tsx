import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface ShareChallengeProps {
    challengeName: string;
    challengeId: string;
    difficulty: string;
    timeTaken: number; // seconds
    userId: string;
}

export const ShareChallenge: React.FC<ShareChallengeProps> = ({
    challengeName,
    challengeId,
    difficulty,
    timeTaken,
    userId
}) => {
    const [isSharing, setIsSharing] = useState(false);
    const [shared, setShared] = useState(false);

    const handleShare = async () => {
        setIsSharing(true);

        try {
            const timeFormatted = `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`;

            const postContent = `🎯 Just pwned ${challengeName}! 💀\n\n⚡ Difficulty: ${difficulty.toUpperCase()}\n⏱️ Time: ${timeFormatted}\n\n#CTF #Hacking #${challengeName.replace(/\s/g, '')}`;

            // Create post in feed
            const { error } = await supabase
                .from('posts')
                .insert({
                    user_id: userId,
                    content: postContent,
                    type: 'challenge_completion',
                    metadata: {
                        challenge_id: challengeId,
                        challenge_name: challengeName,
                        difficulty: difficulty,
                        time_taken: timeTaken
                    }
                });

            if (error) throw error;

            // Confetti celebration
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#22c55e', '#22d3ee', '#ffffff']
            });

            toast.success('Shared to your feed!');
            setShared(true);
        } catch (error: any) {
            console.error('Share error:', error);
            toast.error('Failed to share');
        } finally {
            setIsSharing(false);
        }
    };

    if (shared) {
        return (
            <div className="bg-gradient-to-r from-status-green/20 to-accent-cyan/20 rounded-2xl border border-status-green/30 p-6 text-center animate-in zoom-in duration-500">
                <span className="material-symbols-outlined text-6xl text-status-green mb-3 block animate-bounce">
                    check_circle
                </span>
                <h3 className="text-lg font-bold text-white mb-1">Shared Successfully!</h3>
                <p className="text-sm text-text-muted">Your achievement is now on your feed</p>
            </div>
        );
    }

    return (
        <button
            onClick={handleShare}
            disabled={isSharing}
            className="group relative w-full bg-gradient-to-r from-accent-cyan to-status-green hover:from-accent-cyan/90 hover:to-status-green/90 text-white rounded-2xl p-6 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
        >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

            <div className="relative flex items-center justify-center gap-3">
                {isSharing ? (
                    <>
                        <span className="material-symbols-outlined text-3xl animate-spin">sync</span>
                        <span className="text-lg font-black uppercase tracking-widest">Sharing...</span>
                    </>
                ) : (
                    <>
                        <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">
                            share
                        </span>
                        <div className="text-left">
                            <div className="text-lg font-black uppercase tracking-widest">Share Victory</div>
                            <div className="text-xs opacity-80">Post to your feed</div>
                        </div>
                    </>
                )}
            </div>

            {/* Pulse Effect */}
            {!isSharing && (
                <div className="absolute inset-0 rounded-2xl border-2 border-white/50 animate-ping opacity-20" />
            )}
        </button>
    );
};
