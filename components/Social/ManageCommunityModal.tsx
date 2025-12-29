import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useTranslation } from '../../context/TranslationContext';

interface ManageCommunityModalProps {
    community: any;
    onClose: () => void;
    onUpdate: () => void;
}

const ManageCommunityModal: React.FC<ManageCommunityModalProps> = ({ community, onClose, onUpdate }) => {
    const [title, setTitle] = useState(community.title);
    const [description, setDescription] = useState(community.description || '');
    const [iconUrl, setIconUrl] = useState(community.icon_url || '');
    const [category, setCategory] = useState(community.category);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const { t } = useTranslation();

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to 'community-icons' bucket
            const { error: uploadError } = await supabase.storage
                .from('community-icons')
                .upload(filePath, file);

            if (uploadError) {
                // Determine if error is "Bucket not found" - though Supabase error codes vary
                // For now, assume bucket might need creation or standard error handling
                throw uploadError;
            }

            const { data } = supabase.storage.from('community-icons').getPublicUrl(filePath);
            setIconUrl(data.publicUrl);
            toast.success('Icon uploaded successfully!');
        } catch (error: any) {
            console.error('Error uploading image:', error);
            toast.error('Error uploading image. Ensure "community-icons" bucket exists and is public.');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('communities')
                .update({
                    title,
                    description,
                    icon_url: iconUrl,
                    category
                })
                .eq('id', community.id);

            if (error) throw error;

            toast.success('Community updated successfully');
            onUpdate();
            onClose();
        } catch (error: any) {
            console.error('Error updating community:', error);
            toast.error('Failed to update community');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-bg-card w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <h2 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent-purple">settings</span>
                    {t('community.manage.title')}
                </h2>

                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">{t('community.manage.title_label')}</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-[#161718] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-purple/50 transition-all font-bold"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">{t('community.manage.description_label')}</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-[#161718] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-purple/50 transition-all min-h-[100px] resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">{t('community.manage.icon_label')}</label>
                        <div className="flex gap-4 items-start">
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                    className="w-full bg-[#161718] border border-white/10 rounded-xl px-4 py-3 text-white text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-accent-purple file:text-white hover:file:bg-accent-purple/90 cursor-pointer"
                                />
                                <p className="mt-2 text-[10px] text-text-muted">
                                    {t('community.manage.icon_hint')}
                                </p>
                                {/* Hidden URL input fallback if needed, or just keep state */}
                            </div>
                            <div className="w-20 h-20 rounded-xl bg-[#161718] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 relative group">
                                {uploading ? (
                                    <span className="material-symbols-outlined animate-spin text-accent-purple">progress_activity</span>
                                ) : iconUrl ? (
                                    <img src={iconUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-text-muted text-2xl">image</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">{t('community.manage.category_label')}</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-[#161718] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-purple/50 transition-all appearance-none cursor-pointer"
                        >
                            <option value="web">{t('community.manage.categories.web')}</option>
                            <option value="ad">{t('community.manage.categories.ad')}</option>
                            <option value="cloud">{t('community.manage.categories.cloud')}</option>
                            <option value="study">{t('community.manage.categories.study')}</option>
                            <option value="off-topic">{t('community.manage.categories.offtopic')}</option>
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all"
                        >
                            {t('community.manage.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-accent-purple hover:bg-accent-purple/90 text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? t('community.manage.saving') : t('community.manage.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManageCommunityModal;
