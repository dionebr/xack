
import React, { useState } from 'react';
import { toast } from 'sonner';

export const CoOpRequestModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const [helpType, setHelpType] = useState('hint');
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#161718] border border-white/10 p-6 rounded-lg max-w-md w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
                    <span className="material-symbols-outlined">close</span>
                </button>

                <h3 className="text-white font-bold text-lg mb-1">Request Co-Op Support</h3>
                <p className="text-text-muted text-xs mb-6">Call for backup from the alliance. Validation required.</p>

                <div className="space-y-4 mb-6">
                    <button
                        onClick={() => setHelpType('hint')}
                        className={`w-full p-4 border rounded text-left transition-all ${helpType === 'hint' ? 'bg-accent-purple/10 border-accent-purple text-white' : 'bg-black/20 border-white/10 text-text-muted hover:bg-white/5'}`}
                    >
                        <div className="font-bold text-sm uppercase mb-1">Conceptual Hint</div>
                        <div className="text-[10px] opacity-70">Need a nudge in the right direction without spoilers.</div>
                    </button>

                    <button
                        onClick={() => setHelpType('debug')}
                        className={`w-full p-4 border rounded text-left transition-all ${helpType === 'debug' ? 'bg-status-green/10 border-status-green text-white' : 'bg-black/20 border-white/10 text-text-muted hover:bg-white/5'}`}
                    >
                        <div className="font-bold text-sm uppercase mb-1">Debug Assistance</div>
                        <div className="text-[10px] opacity-70">My exploit should work but doesn't. Help me debug.</div>
                    </button>
                </div>

                <button
                    onClick={() => { toast.success('Distress signal sent to alliance.'); onClose(); }}
                    className="w-full bg-white text-black font-bold uppercase py-3 rounded hover:bg-gray-200"
                >
                    Broadcast Request
                </button>
            </div>
        </div>
    );
};

export const CoOpChat: React.FC = () => {
    return (
        <div className="bg-black/40 border border-white/10 rounded h-[300px] flex flex-col">
            <div className="p-3 border-b border-white/5 flex justify-between items-center">
                <span className="text-[10px] text-status-green font-mono uppercase">SECURE_CHANNEL_ESTABLISHED</span>
                <span className="text-[10px] text-white/30">NO SPOILERS ALLOWED</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
                <div className="text-center text-white/20 text-xs italic my-4">
                    -- Alliance Mentor joined the channel --
                </div>
                <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent-purple/20 border border-accent-purple/50 flex items-center justify-center text-[10px] text-white font-bold">M</div>
                    <div className="bg-white/5 p-2 rounded-r-lg rounded-bl-lg text-xs text-text-muted max-w-[80%]">
                        I see you're stuck on the SQL injection. Have you checked the headers?
                    </div>
                </div>
            </div>
            <div className="p-3 border-t border-white/5">
                <input
                    type="text"
                    placeholder="Type message..."
                    className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-accent-purple outline-none"
                />
            </div>
        </div>
    );
};
