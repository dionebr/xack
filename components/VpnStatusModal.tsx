
import React from 'react';
import { ASSETS } from '../constants';

interface VpnStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    vpnIp: string | null;
    isConnected: boolean;
    userId: string | null;
}

const VpnStatusModal: React.FC<VpnStatusModalProps> = ({ isOpen, onClose, vpnIp, isConnected, userId }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal Card */}
            <div className="relative w-full max-w-md bg-[#13131a] rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 animate-in zoom-in-95 duration-200">

                {/* Header Section (Dark Cyan) */}
                <div className="bg-[#1a3437] p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <h3 className="text-[#4fd1c5] font-black uppercase tracking-widest text-xs mb-4 relative z-10">Access to X-ACK Network</h3>

                    <div className="space-y-1 relative z-10">
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Your Private IP Address</p>
                        <div className="text-white font-mono text-3xl font-black drop-shadow-md">
                            {isConnected ? (vpnIp || '10.8.0.x') : 'UNASSIGNED'}
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-8 space-y-6">

                    {/* Status Items */}
                    <div className="space-y-4">
                        {/* Server Status */}
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white/40">dns</span>
                                </div>
                                <div>
                                    <div className="text-white font-bold text-sm">VPN Server</div>
                                    <div className="text-white/30 text-[10px] uppercase font-bold">AWS Cloud • us-east-1</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[#10b981]">
                                <span className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]"></span>
                                <span className="text-[10px] font-black uppercase tracking-wider">Operational</span>
                            </div>
                        </div>

                        {/* Client Status */}
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white/40">person</span>
                                </div>
                                <div>
                                    <div className="text-white font-bold text-sm">Your Connection</div>
                                    <div className="text-white/30 text-[10px] uppercase font-bold">Tunnel Interface</div>
                                </div>
                            </div>
                            <div className={`flex items-center gap-2 ${isConnected ? 'text-[#10b981]' : 'text-red-500'}`}>
                                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#10b981] shadow-[0_0_10px_#10b981]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`}></span>
                                <span className="text-[10px] font-black uppercase tracking-wider">{isConnected ? 'Connected' : 'Disconnected'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Download Button */}
                    {userId ? (
                        <a
                            href={`http://localhost:3001/api/vpn/config?userId=${userId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="block w-full py-4 bg-[#2a2b36] hover:bg-[#333442] text-white text-center rounded-xl font-bold text-xs uppercase tracking-widest transition-all border border-white/5 hover:border-white/10 flex items-center justify-center gap-2 group"
                        >
                            <span className="material-symbols-outlined text-lg group-hover:-translate-y-0.5 transition-transform">download</span>
                            Download Configuration
                        </a>
                    ) : (
                        <div className="text-center text-white/20 text-xs font-bold uppercase py-4">
                            Login required to download config
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default VpnStatusModal;
