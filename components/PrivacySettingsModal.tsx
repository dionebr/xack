import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface PrivacySettings {
    public_profile: boolean;
    show_ranking: boolean;
    show_online: boolean;
    show_visitors: boolean;
    allow_nudge: boolean;
    allow_messages: boolean;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    currentSettings: PrivacySettings;
    onUpdate: () => void;
}

const PrivacySettingsModal: React.FC<Props> = ({ isOpen, onClose, currentSettings, onUpdate }) => {
    const [settings, setSettings] = useState<PrivacySettings>({
        public_profile: true,
        show_ranking: true,
        show_online: true,
        show_visitors: true,
        allow_nudge: true,
        allow_messages: true,
        ...currentSettings
    });
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('profiles')
                .update({ privacy_settings: settings })
                .eq('id', user.id);

            if (error) throw error;
            toast.success('Privacy settings updated');
            onUpdate();
            onClose();
        } catch (e) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const Toggle = ({ label, description, field }: { label: string, description: string, field: keyof PrivacySettings }) => (
        <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
            <div className="flex-1 pr-4">
                <div className="text-white font-bold text-sm mb-0.5">{label}</div>
                <div className="text-text-muted text-xs">{description}</div>
            </div>
            <button
                onClick={() => setSettings(prev => ({ ...prev, [field]: !prev[field] }))}
                className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${settings[field] ? 'bg-accent-purple' : 'bg-white/10'}`}
            >
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${settings[field] ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>
    );

    return (
        <>
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] animate-in fade-in duration-200" onClick={onClose} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#161718] border border-white/10 shadow-2xl z-[101] p-6 animate-in zoom-in-95 duration-200">

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-accent-purple">lock</span>
                        Privacy Control
                    </h2>
                    <button onClick={onClose} className="text-text-muted hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="space-y-2">
                    <Toggle
                        label="Public Profile"
                        description="Allow anyone to view your profile via ID/Link."
                        field="public_profile"
                    />
                    <Toggle
                        label="Show in Alliance Ranking"
                        description="Display your score in friends' leaderboards."
                        field="show_ranking"
                    />
                    <Toggle
                        label="Online Status"
                        description="Show green dot when you are active."
                        field="show_online"
                    />
                    <Toggle
                        label="Track Profile Visits"
                        description="Allow others to see you visited them (and see who visited you)."
                        field="show_visitors"
                    />
                    <Toggle
                        label="Alllow Buzz / Nudge"
                        description="Allow friends to shake your screen."
                        field="allow_nudge"
                    />
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-text-muted hover:text-white text-sm">Cancel</button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-accent-purple text-white text-sm font-bold hover:bg-accent-purple/90 disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving && <span className="material-symbols-outlined animate-spin text-sm">sync</span>}
                        Save Changes
                    </button>
                </div>
            </div>
        </>
    );
};

export default PrivacySettingsModal;
