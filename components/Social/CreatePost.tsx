import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { ASSETS } from '../../constants';

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
    const { user, profile } = useAuth();
    const [content, setContent] = useState('');
    const [type, setType] = useState<string>('explain');
    const [area, setArea] = useState<string>('general');
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [showCodeEditor, setShowCodeEditor] = useState(false);
    const [gifs, setGifs] = useState<any[]>([]);
    const [selectedGif, setSelectedGif] = useState<string | null>(null);
    const [codeSnippet, setCodeSnippet] = useState({ language: 'python', content: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

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

            toast.success('Posted to network');
            setContent('');
            setIsExpanded(false);
            onPostCreated();
        } catch (error) {
            console.error(error);
            toast.error('Failed to post');
        } finally {
            setLoading(false);
        }
    };

    const loadGifs = async () => {
        const { data } = await supabase.from('hacking_gifs').select('*');
        setGifs(data || []);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    return (
        <div className={`bg-[#161718] border border-white/5 rounded-xl p-4 mb-6 transition-all duration-300 ${isExpanded ? 'shadow-lg ring-1 ring-white/10' : 'hover:bg-white/[0.02]'}`}>
            <form onSubmit={handleSubmit}>
                <div className="flex gap-4">
                    {/* User Avatar (Real Profile Phase) */}
                    <div className="pt-1">
                        <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-br from-accent-purple/50 to-transparent">
                            <img
                                src={profile?.avatar_url || ASSETS.creatorPhoto}
                                className="w-full h-full rounded-full object-cover bg-black"
                                alt="User"
                            />
                        </div>
                    </div>

                    <div className="flex-1">
                        {/* Input Area */}
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onFocus={() => setIsExpanded(true)}
                            placeholder="Share your knowledge..."
                            className="w-full bg-transparent border-none text-white text-base placeholder:text-white/30 focus:ring-0 p-0 resize-none min-h-[48px] leading-relaxed custom-scrollbar"
                            style={{ height: isExpanded ? '120px' : '48px' }}
                        />

                        {/* Expanded Controls: Type/Area Selectors (Matching Screenshot) */}
                        {isExpanded && (
                            <div className="flex flex-wrap gap-2 mb-4 animate-in fade-in slide-in-from-top-1 items-center">
                                <div className="relative">
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="appearance-none bg-accent-purple/10 text-[10px] text-accent-purple uppercase font-bold border border-accent-purple/30 rounded px-3 py-1.5 outline-none cursor-pointer hover:bg-accent-purple/20 pr-6"
                                        style={{ colorScheme: 'dark' }}
                                    >
                                        {POST_TYPES.map(t => <option key={t.id} value={t.id} className="bg-bg-card text-white">{t.label.toUpperCase()}</option>)}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-1 top-1.5 text-[14px] text-accent-purple pointer-events-none">expand_more</span>
                                </div>

                                {/* Area Selector (Gray Pill) */}
                                <div className="relative">
                                    <select
                                        value={area}
                                        onChange={(e) => setArea(e.target.value)}
                                        className="appearance-none bg-white/5 text-[10px] text-white/60 uppercase font-bold border border-white/10 rounded px-3 py-1.5 outline-none cursor-pointer hover:bg-white/10 pr-6"
                                        style={{ colorScheme: 'dark' }}
                                    >
                                        {AREAS.map(a => <option key={a} value={a} className="bg-bg-card text-white">#{a.toUpperCase()}</option>)}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-1 top-1.5 text-[14px] text-white/40 pointer-events-none">expand_more</span>
                                </div>
                            </div>
                        )}

                        {/* Toolbar / Footer */}
                        {isExpanded && (
                            <div className="border-t border-white/5 pt-3 flex items-center justify-between animate-in fade-in">
                                <div className="flex items-center gap-4 text-accent-purple">
                                    <label className="hover:bg-accent-purple/10 p-1.5 rounded-full transition-colors flex items-center justify-center cursor-pointer" title="Add Image">
                                        <span className="material-symbols-outlined text-[20px]">add_circle</span>
                                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                    </label>
                                    <button type="button" onClick={() => setShowCodeEditor(true)} className="hover:bg-accent-purple/10 p-1.5 rounded-full transition-colors flex items-center justify-center" title="Code Snippet">
                                        <span className="material-symbols-outlined text-[20px]">code</span>
                                    </button>
                                    <button type="button" className="hover:bg-accent-purple/10 p-1.5 rounded-full transition-colors flex items-center justify-center" title="Mention">
                                        <span className="material-symbols-outlined text-[20px]">alternate_email</span>
                                    </button>
                                    <button type="button" onClick={() => { loadGifs(); setShowGifPicker(true); }} className="hover:bg-accent-purple/10 p-1.5 rounded-full transition-colors flex items-center justify-center" title="GIF">
                                        <span className="material-symbols-outlined text-[20px] font-black scale-75">gif</span>
                                    </button>
                                    <button type="button" className="hover:bg-accent-purple/10 p-1.5 rounded-full transition-colors flex items-center justify-center" title="Schedule">
                                        <span className="material-symbols-outlined text-[20px]">schedule</span>
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !content.trim()}
                                    className="bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed w-8 h-8 rounded-full flex items-center justify-center transition-all border border-white/10 hover:border-white/30"
                                >
                                    {loading ? (
                                        <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-sm rotate-0 translate-x-[1px]">send</span> // Adjusted icon visually
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Collapsed State Icons (Just for show) */}
                        {!isExpanded && (
                            <div className="flex items-center gap-4 text-accent-purple/50 mt-1 pl-1">
                                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                                <span className="material-symbols-outlined text-[20px]">code</span>
                                <span className="material-symbols-outlined text-[16px] font-black border border-accent-purple/50 rounded px-0.5 text-[10px] leading-tight opacity-70">GIF</span>
                                <span className="material-symbols-outlined text-[20px]">schedule</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Image Preview */}
                {imagePreview && (
                    <div className="relative mt-3 rounded-lg overflow-hidden border border-white/10">
                        <img src={imagePreview} alt="Preview" className="w-full max-h-64 object-cover" />
                        <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5">
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>
                )}

                {/* Selected GIF Preview */}
                {selectedGif && (
                    <div className="relative mt-3 rounded-lg overflow-hidden border border-white/10">
                        <img src={selectedGif} alt="GIF" className="w-full max-h-64 object-cover" />
                        <button type="button" onClick={() => setSelectedGif(null)} className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5">
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>
                )}

                {/* Code Snippet Preview */}
                {codeSnippet.content && (
                    <div className="mt-3 bg-black/40 rounded-lg p-4 border border-white/10 relative">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-accent-purple uppercase font-mono">{codeSnippet.language}</span>
                            <button type="button" onClick={() => setCodeSnippet({ language: 'python', content: '' })} className="text-white/50 hover:text-white">
                                <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                        </div>
                        <pre className="text-sm text-gray-300 font-mono overflow-x-auto">{codeSnippet.content}</pre>
                    </div>
                )}
            </form>

            {/* GIF Picker Modal */}
            {showGifPicker && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowGifPicker(false)}>
                    <div className="bg-bg-card rounded-xl border border-white/10 p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">Select Hacking GIF</h3>
                            <button onClick={() => setShowGifPicker(false)} className="text-white/50 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {gifs.map((gif) => (
                                <div key={gif.id} onClick={() => { setSelectedGif(gif.url); setShowGifPicker(false); }} className="cursor-pointer rounded-lg overflow-hidden border border-white/10 hover:border-accent-purple transition-all">
                                    <img src={gif.url} alt={gif.title} className="w-full h-40 object-cover" />
                                    <div className="p-2 bg-black/40">
                                        <p className="text-xs text-white/70">{gif.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Code Editor Modal */}
            {showCodeEditor && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowCodeEditor(false)}>
                    <div className="bg-bg-card rounded-xl border border-white/10 p-6 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">Add Code Snippet</h3>
                            <button onClick={() => setShowCodeEditor(false)} className="text-white/50 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <select value={codeSnippet.language} onChange={(e) => setCodeSnippet({ ...codeSnippet, language: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white mb-4">
                            <option value="python">Python</option>
                            <option value="javascript">JavaScript</option>
                            <option value="bash">Bash</option>
                            <option value="php">PHP</option>
                            <option value="sql">SQL</option>
                            <option value="c">C</option>
                        </select>
                        <textarea value={codeSnippet.content} onChange={(e) => setCodeSnippet({ ...codeSnippet, content: e.target.value })} placeholder="Paste your code here..." className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm min-h-[300px] resize-none" />
                        <button onClick={() => setShowCodeEditor(false)} className="mt-4 w-full bg-accent-purple hover:bg-accent-purple/80 text-white py-2 rounded-lg font-bold">
                            Add Code
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatePost;
