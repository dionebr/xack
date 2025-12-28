
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { ASSETS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PostCardProps {
    post: any;
    onValidationChange: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onValidationChange }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Check if current user validated
    const myValidation = post.post_validations?.find((v: any) => v.validator_id === user?.id);

    const handleValidate = async (type: 'useful' | 'well_explained' | 'incomplete') => {
        if (!user) return toast.error('Login required');
        if (loading) return;
        setLoading(true);

        try {
            if (myValidation?.type === type) {
                // Remove validation if clicking same type
                await supabase.from('post_validations').delete().eq('id', myValidation.id);
            } else {
                if (myValidation) {
                    // Update existing
                    await supabase.from('post_validations').update({ type }).eq('id', myValidation.id);
                } else {
                    // Create new
                    await supabase.from('post_validations').insert({
                        post_id: post.id,
                        validator_id: user.id,
                        type
                    });
                }
            }
            onValidationChange();
        } catch (error) {
            console.error(error);
            toast.error('Action failed');
        } finally {
            setLoading(false);
        }
    };

    // Icons/Colors for types
    const getTypeStyle = (type: string) => {
        switch (type) {
            case 'explain': return { icon: 'school', color: 'text-blue-400', border: 'border-blue-400/30' };
            case 'question': return { icon: 'help', color: 'text-yellow-400', border: 'border-yellow-400/30' };
            case 'guide': return { icon: 'book', color: 'text-green-400', border: 'border-green-400/30' };
            case 'payload': return { icon: 'code', color: 'text-red-400', border: 'border-red-400/30' };
            case 'insight': return { icon: 'lightbulb', color: 'text-purple-400', border: 'border-purple-400/30' };
            default: return { icon: 'article', color: 'text-gray-400', border: 'border-white/10' };
        }
    };

    const style = getTypeStyle(post.type);

    // Count validations
    const usefulCount = post.post_validations?.filter((v: any) => v.type === 'useful').length || 0;
    const wellExplainedCount = post.post_validations?.filter((v: any) => v.type === 'well_explained').length || 0;
    const incompleteCount = post.post_validations?.filter((v: any) => v.type === 'incomplete').length || 0;

    return (
        <div className={`bg-[#161718] border ${style.border} p-4 rounded-lg hover:bg-black/40 transition-colors group`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <img
                        src={post.author?.avatar_url || ASSETS.creatorPhoto}
                        className="w-10 h-10 rounded-full border border-white/10 cursor-pointer object-cover"
                        onClick={() => navigate(`/profile/${post.author?.short_id || post.author?.username}`)}
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <span
                                className="text-white font-bold text-sm cursor-pointer hover:underline"
                                onClick={() => navigate(`/profile/${post.author?.short_id || post.author?.username}`)}
                            >
                                {post.author?.full_name || 'Agent'}
                            </span>
                            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-text-muted uppercase font-mono">
                                Lvl {Math.floor((post.author?.reputation?.[post.area] || 0) / 100) + 1} {post.area.toUpperCase()}
                            </span>
                        </div>
                        <div className="text-[10px] text-text-muted flex items-center gap-2">
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className={`uppercase font-bold ${style.color} flex items-center gap-1`}>
                                <span className="material-symbols-outlined text-[10px]">{style.icon}</span>
                                {post.type}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="text-[10px] text-white/30 font-mono uppercase border border-white/5 px-2 py-1 rounded">
                    {post.area}
                </div>
            </div>

            {/* Content */}
            <div className="text-sm text-gray-300 mb-4 whitespace-pre-wrap leading-relaxed">
                {post.content}
            </div>

            {/* Validation Actions */}
            <div className="flex gap-2 border-t border-white/5 pt-3">
                <button
                    onClick={() => handleValidate('useful')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] uppercase font-bold transition-all border ${myValidation?.type === 'useful' ? 'bg-status-green/10 text-status-green border-status-green/30' : 'bg-transparent text-text-muted border-transparent hover:bg-white/5'}`}
                >
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Useful {usefulCount > 0 && `(${usefulCount})`}
                </button>

                <button
                    onClick={() => handleValidate('well_explained')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] uppercase font-bold transition-all border ${myValidation?.type === 'well_explained' ? 'bg-accent-purple/10 text-accent-purple border-accent-purple/30' : 'bg-transparent text-text-muted border-transparent hover:bg-white/5'}`}
                >
                    <span className="material-symbols-outlined text-sm">psychology</span>
                    Smart {wellExplainedCount > 0 && `(${wellExplainedCount})`}
                </button>

                <div className="flex-1"></div>

                <button
                    onClick={() => handleValidate('incomplete')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] uppercase font-bold transition-all border ${myValidation?.type === 'incomplete' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-transparent text-white/20 border-transparent hover:bg-white/5'}`}
                >
                    <span className="material-symbols-outlined text-sm">report_problem</span>
                    {incompleteCount > 0 && `(${incompleteCount})`}
                </button>
            </div>
        </div>
    );
};

export default PostCard;
