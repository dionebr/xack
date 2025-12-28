import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface SquadSelectorProps {
    userId: string;
    currentSquad?: string;
    onSquadChange?: () => void;
}

const SQUADS = [
    { name: 'Void', color: 'text-white/50', description: 'Masters of the unknown' },
    { name: 'Shadow', color: 'text-gray-500', description: 'Silent operators' },
    { name: 'Cipher', color: 'text-white/40', description: 'Code breakers' },
    { name: 'Ghost', color: 'text-gray-400', description: 'Invisible hackers' }
];

const SquadSelector: React.FC<SquadSelectorProps> = ({ userId, currentSquad = 'Void', onSquadChange }) => {
    const [selectedSquad, setSelectedSquad] = useState(currentSquad);
    const [isOpen, setIsOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setSelectedSquad(currentSquad);
    }, [currentSquad]);

    const handleSquadChange = async (squadName: string) => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ squad: squadName })
                .eq('id', userId);

            if (error) throw error;

            setSelectedSquad(squadName);
            setIsOpen(false);
            toast.success(`Joined ${squadName} squad`);

            if (onSquadChange) {
                onSquadChange();
            }
        } catch (err: any) {
            console.error('Error updating squad:', err);
            toast.error('Failed to update squad');
        } finally {
            setSaving(false);
        }
    };

    const currentSquadData = SQUADS.find(s => s.name === selectedSquad) || SQUADS[0];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-white/10 hover:border-white/20 transition-all text-sm"
                disabled={saving}
            >
                <span className="material-symbols-outlined text-white/40 text-sm">groups</span>
                <span className={`font-mono uppercase text-xs ${currentSquadData.color}`}>
                    {selectedSquad}
                </span>
                <span className="material-symbols-outlined text-white/30 text-sm">
                    {isOpen ? 'expand_less' : 'expand_more'}
                </span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full mt-1 right-0 w-64 bg-[#161718] border border-white/10 shadow-2xl z-50 overflow-hidden">
                        <div className="p-2 border-b border-white/10 bg-white/5">
                            <div className="text-white/60 text-[10px] font-mono uppercase tracking-wider">Select Squad</div>
                        </div>
                        <div className="divide-y divide-white/5">
                            {SQUADS.map(squad => (
                                <button
                                    key={squad.name}
                                    onClick={() => handleSquadChange(squad.name)}
                                    disabled={saving}
                                    className={`w-full p-3 text-left hover:bg-white/5 transition-colors ${selectedSquad === squad.name ? 'bg-white/10' : ''
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className={`font-mono text-sm font-bold ${squad.color}`}>
                                                {squad.name}
                                            </div>
                                            <div className="text-white/30 text-[10px] mt-0.5">
                                                {squad.description}
                                            </div>
                                        </div>
                                        {selectedSquad === squad.name && (
                                            <span className="material-symbols-outlined text-accent-purple text-sm">
                                                check_circle
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SquadSelector;
