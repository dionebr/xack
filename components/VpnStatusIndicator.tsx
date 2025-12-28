
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface VpnStatusIndicatorProps {
    connected: boolean;
    ip?: string | null;
    onClick: () => void;
}

const VpnStatusIndicator: React.FC<VpnStatusIndicatorProps> = ({ connected, ip, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`
                group relative flex items-center gap-3 px-4 py-2 rounded-full border transition-all duration-300
                ${connected
                    ? 'bg-accent-cyan/10 border-accent-cyan/30 hover:bg-accent-cyan/20'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }
            `}
        >
            {/* Status Dot with Pulse */}
            <div className="relative flex h-2.5 w-2.5">
                {connected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${connected ? 'bg-accent-cyan' : 'bg-red-500/50'}`}></span>
            </div>

            {/* Text Info */}
            <div className="flex flex-col items-start leading-none">
                <span className={`text-[9px] font-black uppercase tracking-widest ${connected ? 'text-accent-cyan' : 'text-text-muted'}`}>
                    {connected ? 'VPN ONLINE' : 'VPN OFFLINE'}
                </span>
                {connected && ip && (
                    <span className="text-[10px] font-mono font-bold text-white mt-0.5">
                        {ip}
                    </span>
                )}
            </div>

            {/* Icon */}
            <span className={`material-symbols-outlined text-lg ${connected ? 'text-accent-cyan' : 'text-text-muted group-hover:text-white'}`}>
                {connected ? 'encrypted' : 'vpn_lock'}
            </span>
        </button>
    );
};

export default VpnStatusIndicator;
