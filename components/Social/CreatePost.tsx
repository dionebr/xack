import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/TranslationContext';
import { ASSETS } from '../../constants';
import PrePostWarningModal from '../PrePostWarningModal';
import { moderateContent, getRemovalMessage } from '../../utils/moderation';

interface CreatePostProps {
    onPostCreated: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
    const { t } = useTranslation();
    const { user, profile } = useAuth();

    // UI States
    const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Quick Post State
    const [quickContent, setQuickContent] = useState('');
    const [quickImage, setQuickImage] = useState<File | null>(null);
    const [quickImagePreview, setQuickImagePreview] = useState<string | null>(null);
    const [quickGif, setQuickGif] = useState<string | null>(null);
    const [quickCode, setQuickCode] = useState<{ language: string, content: string }>({ language: 'python', content: '' });

    // Article Form State
    const [title, setTitle] = useState('');
    const [articleContent, setArticleContent] = useState('');
    const [articleImage, setArticleImage] = useState<string | null>(null);
    const [articleImagePreview, setArticleImagePreview] = useState<string | null>(null);
    const [articleGif, setArticleGif] = useState<string | null>(null);
    const [articleCode, setArticleCode] = useState<{ language: string, content: string }>({ language: 'python', content: '' });
    // Import State
    const [showImportModal, setShowImportModal] = useState(false);
    const [importText, setImportText] = useState('');
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [hasAgreedToGuidelines, setHasAgreedToGuidelines] = useState(false);

    // Shared / Loaders
    const [loading, setLoading] = useState(false);
    const [gifs, setGifs] = useState<any[]>([]);

    // Modal Controls for pickers (Shared reuse)
    const [activePicker, setActivePicker] = useState<'none' | 'gif' | 'code'>('none');
    const [pickerTarget, setPickerTarget] = useState<'quick' | 'article'>('quick');

    // Refs
    const quickFileRef = useRef<HTMLInputElement>(null);
    const articleFileRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // --- Helpers ---

    const insertMarkdown = (prefix: string, suffix: string = '') => {
        if (!textareaRef.current) return;

        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const text = textareaRef.current.value;
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);

        // Determine which content state to update based on pickerTarget
        const setContent = pickerTarget === 'quick' ? setQuickContent : setArticleContent;

        const newContent = `${before}${prefix}${selection}${suffix}${after} `;
        setContent(newContent);

        // Restore focus and cursor
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(
                    start + prefix.length,
                    end + prefix.length
                );
            }
        }, 0);
    };

    const loadGifs = async () => {
        if (gifs.length > 0) return;
        const { data } = await supabase.from('hacking_gifs').select('*');
        setGifs(data || []);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isArticle: boolean) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Limit size (e.g. 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image too large (Max 5MB)');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;

            if (isArticle) {
                // For Article Cover
                setArticleImage(base64String);
                setArticleImagePreview(base64String);
            } else if (pickerTarget === 'article') {
                // For Article content insertion
                insertMarkdown(`![Image](${base64String}) \n`);
            } else {
                // For Quick Post
                setQuickImage(file);
                setQuickImagePreview(base64String);
            }
        };
        reader.readAsDataURL(file);
    };

    const removeImage = (isArticle: boolean) => {
        if (isArticle) {
            setArticleImage(null);
            setArticleImagePreview(null);
            if (articleFileRef.current) articleFileRef.current.value = '';
        } else {
            setQuickImage(null);
            setQuickImagePreview(null);
            if (quickFileRef.current) quickFileRef.current.value = '';
        }
    };

    const handleImportMarkdown = () => {
        if (!importText.trim()) return;
        setArticleContent(importText);
        setShowImportModal(false);
        setImportText('');
        toast.success(t('actions.contentImported')); // Ensure this translation key exists or use hardcoded for now if unsure
    };

    const handlePostSubmit = async (e: React.FormEvent, isArticle: boolean) => {
        e.preventDefault();

        if (!user) {
            toast.error(t('actions.actionFailed'));
            return;
        }

        let finalContent = '';
        let type = 'explain'; // Default
        let area = 'general'; // Default

        if (!isArticle) { // Quick Post
            const parts = [];
            if (quickContent.trim()) parts.push(quickContent);
            if (quickCode.content) parts.push(`\`\`\`${quickCode.language}\n${quickCode.content}\n\`\`\``);
            if (quickGif) parts.push(`![GIF](${quickGif})`);
            if (quickImagePreview) parts.push(`![Image](${quickImagePreview})`); // Include quick image if present

            finalContent = parts.join('\n\n');

            if (!finalContent.trim()) return;

        } else { // Article Post
            // Construct Article Content
            const parts = [];
            // 1. Cover Image (Base64)
            if (articleImage) {
                parts.push(`![Cover Image](${articleImage})`);
            }
            // 2. Title
            if (title) {
                parts.push(`# ${title}`);
            }
            // 3. Body
            if (articleContent.trim()) {
                parts.push(articleContent);
            }

            // 4. Extras (Code, GIF)
            if (articleCode.content) parts.push(`\`\`\`${articleCode.language}\n${articleCode.content}\n\`\`\``);
            if (articleGif) parts.push(`![GIF](${articleGif})`);

            finalContent = parts.join('\n\n');

            if (!finalContent.trim() && !title.trim()) return; // Ensure there's content or a title
        }

        setLoading(true);
        try {
            const { error } = await supabase.from('posts').insert({
                author_id: user.id,
                content: finalContent,
                type,
                area
            });

            if (error) throw error;

            toast.success(t('actions.posted'));

            // Reset
            if (isArticle) {
                setTitle('');
                setArticleContent('');
                setArticleCode({ language: 'python', content: '' });
                setArticleGif(null);
                removeImage(true); // This now clears base64 and preview
                setIsArticleModalOpen(false);
            } else {
                setQuickContent('');
                setQuickCode({ language: 'python', content: '' });
                setQuickGif(null);
                removeImage(false); // This now clears base64 and preview
                setIsExpanded(false);
            }

            onPostCreated();
        } catch (error) {
            console.error(error);
            toast.error(t('actions.actionFailed'));
        } finally {
            setLoading(false);
        }
    };

    // --- Renderers ---

    return (
        <div className="mb-6">

            {/* 1. HERO BUTTON REMOVED per user request */}


            {/* 2. QUICK POST INPUT (Inline) */}
            <div className={`bg-[#161718] border border-white/5 rounded-xl p-4 transition-all duration-300 ${isExpanded ? 'shadow-lg ring-1 ring-white/10' : 'hover:bg-white/[0.02]'}`}>
                <form onSubmit={(e) => handlePostSubmit(e, false)}>
                    <div className="flex gap-4">
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
                            <textarea
                                value={quickContent}
                                onChange={(e) => setQuickContent(e.target.value)}
                                onFocus={() => setIsExpanded(true)}
                                placeholder={t('post.placeholder')}
                                className="w-full bg-transparent border-none text-white text-base placeholder:text-white/30 focus:ring-0 p-0 resize-none min-h-[48px] leading-relaxed custom-scrollbar"
                                style={{ height: isExpanded ? '100px' : '48px' }}
                            />

                            {/* Toolbar - Only visible when expanded */}
                            {isExpanded && (
                                <div className="border-t border-white/5 pt-3 flex items-center justify-between animate-in fade-in">
                                    <div className="flex items-center gap-2 text-accent-purple">
                                        <button type="button" onClick={() => quickFileRef.current?.click()} className="hover:bg-accent-purple/10 p-1.5 rounded-full transition-colors flex items-center justify-center" title="Image">
                                            <span className="material-symbols-outlined text-[20px]">image</span>
                                        </button>
                                        <button type="button" onClick={() => { setPickerTarget('quick'); setActivePicker('code'); }} className={`hover:bg-accent-purple/10 p-1.5 rounded-full transition-colors flex items-center justify-center ${quickCode.content ? 'bg-accent-purple/20' : ''}`} title="Code">
                                            <span className="material-symbols-outlined text-[20px]">code</span>
                                        </button>
                                        <button type="button" onClick={() => { loadGifs(); setPickerTarget('quick'); setActivePicker('gif'); }} className={`hover:bg-accent-purple/10 p-1.5 rounded-full transition-colors flex items-center justify-center ${quickGif ? 'bg-accent-purple/20' : ''}`} title="GIF">
                                            <span className="material-symbols-outlined text-[20px]">gif</span>
                                        </button>
                                        <div className="w-px h-6 bg-white/10 mx-1"></div>
                                        <button type="button" onClick={() => setIsArticleModalOpen(true)} className="hover:bg-accent-purple/10 p-1.5 rounded-full transition-colors flex items-center justify-center group relative" title={t('post.create_button')}>
                                            <span className="material-symbols-outlined text-[20px] text-accent-purple">article</span>
                                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">
                                                {t('post.create_button')}
                                            </span>
                                        </button>
                                        <input type="file" ref={quickFileRef} accept="image/*" onChange={(e) => handleImageUpload(e, false)} className="hidden" />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !quickContent.trim()}
                                        className="bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-1.5 rounded-full text-sm font-bold transition-all border border-white/10 hover:border-white/30 flex items-center gap-2"
                                    >
                                        {loading ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-sm">send</span>}
                                        Post
                                    </button>
                                </div>
                            )}

                            {/* Previews (Inline) */}
                            {(quickImagePreview || quickGif || quickCode.content) && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {quickImagePreview && (
                                        <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-white/10 group">
                                            <img src={quickImagePreview} className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeImage(false)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-outlined text-xs">close</span></button>
                                        </div>
                                    )}
                                    {quickGif && (
                                        <div className="relative h-20 w-auto rounded-lg overflow-hidden border border-white/10 group">
                                            <img src={quickGif} className="h-full object-cover" />
                                            <button type="button" onClick={() => setQuickGif(null)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-outlined text-xs">close</span></button>
                                        </div>
                                    )}
                                    {quickCode.content && (
                                        <div className="relative h-20 w-20 rounded-lg bg-black/40 border border-white/10 group flex items-center justify-center">
                                            <span className="material-symbols-outlined text-accent-purple">code</span>
                                            <button type="button" onClick={() => setQuickCode({ language: 'python', content: '' })} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-outlined text-xs">close</span></button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {/* --- MODALS --- */}

            {/* 3. ARTICLE MODAL (Full Featured) */}
            {isArticleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#161718] w-full max-w-3xl max-h-[90vh] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#1a1b1e]">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-accent-purple">article</span>
                                {t('post.create_button')}
                            </h2>
                            <button onClick={() => setIsArticleModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        {/* Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <form id="article-form" onSubmit={(e) => handlePostSubmit(e, true)} className="p-6 space-y-6">
                                {/* Cover Image */}
                                <div
                                    className={`relative w-full h-48 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center bg-black/20 overflow-hidden transition-all ${!articleImagePreview ? 'hover:border-accent-purple/40 hover:bg-accent-purple/5 cursor-pointer' : ''}`}
                                    onClick={() => !articleImagePreview && articleFileRef.current?.click()}
                                >
                                    {articleImagePreview ? (
                                        <>
                                            <img src={articleImagePreview} alt="Cover" className="w-full h-full object-cover" />
                                            <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(true); }} className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full hover:bg-black/80"><span className="material-symbols-outlined text-sm">delete</span></button>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-500">
                                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">add_photo_alternate</span>
                                            <span className="text-sm font-medium">{t('post.article.cover_image')}</span>
                                        </div>
                                    )}
                                    <input type="file" ref={articleFileRef} accept="image/*" onChange={(e) => handleImageUpload(e, true)} className="hidden" />
                                </div>
                                {/* Title */}
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('post.article.title_placeholder')} className="w-full bg-transparent border-none text-3xl font-bold text-white placeholder:text-white/20 focus:ring-0 p-0" />
                                {/* Editor Toolbar */}
                                <div className="flex items-center gap-1 border-b border-white/5 pb-2 mb-2 sticky top-0 bg-[#161718] z-10 pt-2 overflow-x-auto custom-scrollbar">
                                    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/5">
                                        <button type="button" onClick={() => insertMarkdown('**', '**')} className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Bold">
                                            <span className="material-symbols-outlined text-[18px]">format_bold</span>
                                        </button>
                                        <button type="button" onClick={() => insertMarkdown('*', '*')} className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Italic">
                                            <span className="material-symbols-outlined text-[18px]">format_italic</span>
                                        </button>
                                    </div>

                                    <div className="w-px h-6 bg-white/5 mx-1"></div>

                                    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/5">
                                        <button type="button" onClick={() => insertMarkdown('- ')} className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Bullet List">
                                            <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                                        </button>
                                        <button type="button" onClick={() => insertMarkdown('1. ')} className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Numbered List">
                                            <span className="material-symbols-outlined text-[18px]">format_list_numbered</span>
                                        </button>
                                    </div>

                                    <div className="w-px h-6 bg-white/5 mx-1"></div>

                                    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/5">
                                        <button type="button" onClick={() => insertMarkdown('> ')} className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Quote">
                                            <span className="material-symbols-outlined text-[18px]">format_quote</span>
                                        </button>
                                        <button type="button" onClick={() => { setPickerTarget('article'); setActivePicker('code'); }} className={`p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-accent-purple transition-colors ${articleCode.content ? 'text-accent-purple bg-accent-purple/10' : ''}`} title="Code Block">
                                            <span className="material-symbols-outlined text-[18px]">code_blocks</span>
                                        </button>
                                        <button type="button" onClick={() => insertMarkdown('`', '`')} className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Inline Code">
                                            <span className="material-symbols-outlined text-[18px]">code</span>
                                        </button>
                                    </div>

                                    <div className="w-px h-6 bg-white/5 mx-1"></div>

                                    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/5">
                                        <button type="button" onClick={() => insertMarkdown('[', '](url)')} className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Link">
                                            <span className="material-symbols-outlined text-[18px]">link</span>
                                        </button>
                                        <button type="button" onClick={() => articleFileRef.current?.click()} className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Image">
                                            <span className="material-symbols-outlined text-[18px]">image</span>
                                        </button>
                                        <button type="button" onClick={() => { loadGifs(); setPickerTarget('article'); setActivePicker('gif'); }} className={`p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-accent-purple transition-colors ${articleGif ? 'text-accent-purple bg-accent-purple/10' : ''}`} title="GIF">
                                            <span className="material-symbols-outlined text-[18px]">gif</span>
                                        </button>
                                    </div>

                                    <div className="w-px h-6 bg-white/5 mx-1"></div>

                                    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/5">
                                        <button type="button" onClick={() => setShowImportModal(true)} className="p-1.5 rounded hover:bg-white/10 text-accent-purple hover:text-white transition-colors flex items-center gap-1" title="Import Markdown">
                                            <span className="material-symbols-outlined text-[18px]">file_download</span>
                                            <span className="text-[10px] uppercase font-bold hidden sm:inline">Import</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Content Editor */}
                                <div className="min-h-[200px] relative">
                                    <textarea
                                        ref={textareaRef}
                                        value={articleContent}
                                        onChange={(e) => setArticleContent(e.target.value)}
                                        placeholder={t('post.article.content_placeholder')}
                                        className="w-full h-full min-h-[300px] bg-transparent border-none text-gray-300 text-lg leading-relaxed placeholder:text-gray-600 focus:ring-0 p-0 resize-none custom-scrollbar font-mono"
                                    />
                                </div>
                                {articleCode.content && (
                                    <div className="mt-4 p-4 bg-black/40 rounded-lg border border-white/10 relative group">
                                        <button type="button" onClick={() => setArticleCode({ language: 'python', content: '' })} className="absolute top-2 right-2 text-red-400"><span className="material-symbols-outlined text-sm">delete</span></button>
                                        <pre className="font-mono text-sm text-gray-300 overflow-x-auto">{articleCode.content}</pre>
                                    </div>
                                )}
                                {articleGif && (
                                    <div className="mt-4 relative w-fit">
                                        <img src={articleGif} className="rounded-lg max-h-48" />
                                        <button type="button" onClick={() => setArticleGif(null)} className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full"><span className="material-symbols-outlined text-sm">close</span></button>
                                    </div>
                                )}
                            </form>
                        </div>
                        {/* Footer */}
                        <div className="p-4 border-t border-white/5 bg-[#1a1b1e] flex justify-end gap-3">
                            <button onClick={() => setIsArticleModalOpen(false)} className="px-6 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white">{t('post.article.cancel')}</button>
                            <button type="submit" form="article-form" disabled={loading} className="bg-accent-purple hover:bg-accent-purple/90 text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-accent-purple/20 flex items-center gap-2">{loading && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}{t('post.article.publish')}</button>
                        </div>
                    </div>

                    {/* Import Modal Overlay */}
                    {showImportModal && (
                        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                            <div className="bg-[#1e1f20] w-full max-w-lg rounded-xl border border-white/10 shadow-2xl p-6 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-accent-purple">file_download</span>
                                    Import Article
                                </h3>
                                <p className="text-white/50 text-xs mb-4">Paste your full Markdown content below. It will replace the current editor content.</p>
                                <textarea
                                    value={importText}
                                    onChange={(e) => setImportText(e.target.value)}
                                    placeholder="# My Generated Guide..."
                                    className="w-full h-48 bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white font-mono focus:border-accent-purple/50 focus:outline-none resize-none mb-4 custom-scrollbar"
                                />
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowImportModal(false)}
                                        className="px-4 py-2 text-white/50 hover:text-white transition-colors text-xs font-bold uppercase"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleImportMarkdown}
                                        className="bg-accent-purple hover:bg-accent-purple/90 text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                                    >
                                        Import Content
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 4. SHARED PICKERS */}
            {activePicker === 'gif' && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80">
                    <div className="bg-[#161718] w-full max-w-2xl rounded-xl border border-white/10 p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-4"><h3 className="text-white font-bold">Select GIF</h3><button onClick={() => setActivePicker('none')}><span className="material-symbols-outlined text-gray-400">close</span></button></div>
                        <div className="grid grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {gifs.map((gif) => (
                                <div key={gif.id} onClick={() => {
                                    if (pickerTarget === 'article') setArticleGif(gif.url); else setQuickGif(gif.url);
                                    setActivePicker('none');
                                }} className="cursor-pointer rounded-lg overflow-hidden border border-white/10 hover:border-accent-purple relative group">
                                    <img src={gif.url} className="w-full h-32 object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activePicker === 'code' && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80">
                    <div className="bg-[#161718] w-full max-w-2xl rounded-xl border border-white/10 p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-4"><h3 className="text-white font-bold">Add Code</h3><button onClick={() => setActivePicker('none')}><span className="material-symbols-outlined text-gray-400">close</span></button></div>
                        <textarea
                            value={pickerTarget === 'article' ? articleCode.content : quickCode.content}
                            onChange={(e) => pickerTarget === 'article' ? setArticleCode({ ...articleCode, content: e.target.value }) : setQuickCode({ ...quickCode, content: e.target.value })}
                            placeholder="Paste Code..." className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm min-h-[200px]"
                        />
                        <button onClick={() => setActivePicker('none')} className="mt-4 w-full bg-accent-purple text-white py-2 rounded-lg font-bold">Save Code</button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CreatePost;
