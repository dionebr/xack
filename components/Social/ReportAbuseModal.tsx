import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useTranslation } from '../../context/TranslationContext';
import { useAuth } from '../../context/AuthContext';

interface ReportAbuseModalProps {
    communityId: string;
    onClose: () => void;
}

const ReportAbuseModal: React.FC<ReportAbuseModalProps> = ({ communityId, onClose }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [reason, setReason] = useState('spam');
    const [details, setDetails] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error(t('actions.actionFailed'));
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.from('community_reports').insert({
                community_id: communityId,
                reporter_id: user.id,
                reason,
                details: details.trim() || null
            });

            if (error) throw error;

            toast.success(t('community.report.submit'));
            onClose();
        } catch (error) {
            console.error('Error submitting report:', error);
            toast.error(t('actions.actionFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-bg-card w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <h2 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500">flag</span>
                    {t('community.report.title')}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">
                            {t('community.report.reason_label')}
                        </label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full bg-[#161718] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-purple/50 transition-all appearance-none cursor-pointer"
                            required
                        >
                            <option value="spam">{t('community.report.reasons.spam')}</option>
                            <option value="harassment">{t('community.report.reasons.harassment')}</option>
                            <option value="inappropriate">{t('community.report.reasons.inappropriate')}</option>
                            <option value="other">{t('community.report.reasons.other')}</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">
                            {t('community.report.details_label')}
                        </label>
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder={t('community.report.details_placeholder')}
                            className="w-full bg-[#161718] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-purple/50 transition-all min-h-[100px] resize-none placeholder:text-text-muted/50"
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all"
                        >
                            {t('community.report.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? t('community.manage.saving') : t('community.report.submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportAbuseModal;
