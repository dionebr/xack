
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

const POST_TYPES = [
    { id: 'explain', label: 'Explain', icon: 'school', color: 'text-blue-400' },
    { id: 'question', label: 'Question', icon: 'help', color: 'text-yellow-400' },
    { id: 'guide', label: 'Guide', icon: 'book', color: 'text-green-400' },
    { id: 'payload', label: 'Payload', icon: 'code', color: 'text-red-400' },
    { id: 'insight', label: 'Insight', icon: 'lightbulb', color: 'text-purple-400' },
];

const AREAS = [
    'web', 'ad', 'cloud', 'crypto', 'mobile', 'reverse', 'general'
];

interface CreatePostProps {
    onPostCreated: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [type, setType] = useState<string>('explain');
    const [area, setArea] = useState<string>('general');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        if (!user) return toast.error('You must be logged in');

        setLoading(true);
        try {
            const { error } = await supabase.from('posts').insert({
                author_id: user.id,
                content,
                type,
                area
            });

            if (error) throw error;

            toast.success('Knowledge shared successfully');
            setContent('');
            onPostCreated();
        } catch (error) {
            console.error(error);
            toast.error('Failed to post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#161718] p-4 border border-white/10 rounded-lg mb-6">
            <h3 className="text-white text-sm font-bold uppercase mb-4">Share Knowledge</h3>
            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Selectors */}
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="text-[10px] text-text-muted uppercase font-bold block mb-1">Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 text-xs text-white p-2 rounded focus:border-accent-purple outline-none uppercase"
                        >
                            {POST_TYPES.map(t => (
                                <option key={t.id} value={t.id}>{t.label.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="text-[10px] text-text-muted uppercase font-bold block mb-1">Area</label>
                        <select
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 text-xs text-white p-2 rounded focus:border-accent-purple outline-none uppercase"
                        >
                            {AREAS.map(a => (
                                <option key={a} value={a}>{a.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Content */}
                <div>
                    <label className="text-[10px] text-text-muted uppercase font-bold block mb-1">Content</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Share your knowledge, ask a deep technical question, or provide an insight..."
                        className="w-full h-24 bg-black/40 border border-white/10 text-sm text-white p-3 rounded focus:border-accent-purple outline-none resize-none placeholder:text-white/20"
                    />
                </div>

                {/* Footer */}
                <div className="flex justify-end items-center gap-4">
                    <span className="text-[10px] text-text-muted italic">
                        Reputation is built on quality, not quantity.
                    </span>
                    <button
                        type="submit"
                        disabled={loading || !content.trim()}
                        className="bg-accent-purple text-white px-6 py-2 text-xs font-bold uppercase rounded hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Posting...' : (
                            <>
                                <span className="material-symbols-outlined text-sm">send</span>
                                Publish
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;
