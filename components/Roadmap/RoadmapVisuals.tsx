import React from 'react';
import { Shield, Layers, Box, Cpu, Share2, Zap, Globe, Wifi, Lock, Activity, Search } from 'lucide-react';

export const KernelVisual: React.FC = () => {
    return (
        <div className="my-10 p-8 rounded-xl bg-[#0F0F0F] border border-white/10 relative overflow-hidden group hover:border-accent-purple/30 transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">

                {/* User Space Ring */}
                <div className="relative flex flex-col items-center gap-3">
                    <div className="w-32 h-32 rounded-full border-4 border-dashed border-accent-cyan/30 flex items-center justify-center relative animate-spin-slow">
                        <div className="absolute inset-0 border-2 border-white/5 rounded-full"></div>
                        <Layers size={32} className="text-accent-cyan" />
                    </div>
                    <div className="text-center">
                        <h4 className="font-display font-black text-white italic text-lg text-accent-cyan">User Space</h4>
                        <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Ring 3</span>
                    </div>
                    <p className="text-xs text-center text-white/40 max-w-[150px]">Restricted. Safe.<br />Apps live here.</p>
                </div>

                {/* The Bridge */}
                <div className="flex flex-col items-center gap-2">
                    <div className="h-px w-20 bg-gradient-to-r from-accent-cyan/50 to-accent-red/50"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/70 bg-[#111] px-2 border border-white/10 rounded-full">Syscall</span>
                    <div className="h-px w-20 bg-gradient-to-r from-accent-cyan/50 to-accent-red/50"></div>
                </div>

                {/* Kernel Space Ring */}
                <div className="relative flex flex-col items-center gap-3">
                    <div className="w-32 h-32 rounded-full border-4 border-double border-accent-red/50 flex items-center justify-center relative bg-accent-red/5 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                        <Shield size={32} className="text-accent-red" />
                    </div>
                    <div className="text-center">
                        <h4 className="font-display font-black text-white italic text-accent-red">Kernel Space</h4>
                        <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest bg-accent-red/10 px-2 py-1 rounded text-accent-red">Ring 0</span>
                    </div>
                    <p className="text-xs text-center text-white/40 max-w-[150px]">Absolute Power.<br />Hardware Access.</p>
                </div>

            </div>
        </div>
    );
};

export const ProcessVisual: React.FC = () => {
    return (
        <div className="my-10 p-8 rounded-xl bg-[#0F0F0F] border border-white/10 relative overflow-hidden group hover:border-accent-green/30 transition-all">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-green/5 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="grid md:grid-cols-2 gap-8">

                {/* Component: PROCESS */}
                <div className="bg-[#151515] rounded-xl border border-white/5 p-6 relative">
                    <div className="flex items-center gap-3 mb-4">
                        <Box className="text-accent-purple" size={20} />
                        <h4 className="font-bold text-white text-sm">Process (Container)</h4>
                    </div>
                    <div className="space-y-2">
                        <div className="h-2 w-3/4 bg-white/10 rounded animate-pulse"></div>
                        <div className="h-2 w-1/2 bg-white/10 rounded"></div>
                    </div>
                    <div className="mt-6 flex gap-2">
                        <span className="text-[9px] border border-white/10 px-2 py-1 rounded text-white/40">Own Memory</span>
                        <span className="text-[9px] border border-white/10 px-2 py-1 rounded text-white/40">Isolated</span>
                    </div>
                    <div className="absolute top-4 right-4 text-[9px] font-mono text-white/20">PID: 4120</div>
                </div>

                {/* Component: THREADS */}
                <div className="bg-[#151515] rounded-xl border border-white/5 p-6 relative">
                    <div className="flex items-center gap-3 mb-4">
                        <Share2 className="text-accent-green" size={20} />
                        <h4 className="font-bold text-white text-sm">Threads (Workers)</h4>
                    </div>

                    <div className="flex gap-4 justify-center py-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex flex-col items-center gap-2 group/thread">
                                <div className="w-1 h-8 bg-gradient-to-b from-accent-green to-transparent mx-auto"></div>
                                <Zap size={14} className="text-white/40 group-hover/thread:text-accent-green transition-colors" />
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 text-center">
                        <span className="text-[9px] bg-accent-green/10 text-accent-green px-3 py-1 rounded-full border border-accent-green/20">
                            Shared Memory Space
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export const LinuxPermissionsVisual: React.FC = () => {
    return (
        <div className="my-10 p-8 rounded-xl bg-[#0F0F0F] border border-white/10 relative overflow-hidden group hover:border-accent-yellow/30 transition-all">
            <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                {/* File Icon */}
                <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-24 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center relative">
                        <div className="absolute top-0 right-0 p-2 text-white/20 font-mono text-[10px]">.sh</div>
                        <div className="text-4xl">📄</div>
                    </div>
                    <span className="text-xs font-mono text-white/50">script.sh</span>
                </div>

                {/* Permissions Grid */}
                <div className="grid grid-cols-3 gap-4">
                    {/* User */}
                    <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-[#151515] border border-white/5">
                        <span className="text-[10px] uppercase tracking-widest text-accent-green font-bold">User</span>
                        <div className="flex gap-1">
                            <span className="w-6 h-6 flex items-center justify-center rounded bg-accent-green/20 text-accent-green font-mono text-xs font-bold ring-1 ring-accent-green/50">r</span>
                            <span className="w-6 h-6 flex items-center justify-center rounded bg-accent-green/20 text-accent-green font-mono text-xs font-bold ring-1 ring-accent-green/50">w</span>
                            <span className="w-6 h-6 flex items-center justify-center rounded bg-accent-green/20 text-accent-green font-mono text-xs font-bold ring-1 ring-accent-green/50">x</span>
                        </div>
                        <span className="text-xs font-mono text-white/40">7</span>
                    </div>

                    {/* Group */}
                    <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-[#151515] border border-white/5">
                        <span className="text-[10px] uppercase tracking-widest text-accent-yellow font-bold">Group</span>
                        <div className="flex gap-1">
                            <span className="w-6 h-6 flex items-center justify-center rounded bg-accent-yellow/20 text-accent-yellow font-mono text-xs font-bold ring-1 ring-accent-yellow/50">r</span>
                            <span className="w-6 h-6 flex items-center justify-center rounded bg-white/5 text-white/20 font-mono text-xs font-bold">-</span>
                            <span className="w-6 h-6 flex items-center justify-center rounded bg-accent-yellow/20 text-accent-yellow font-mono text-xs font-bold ring-1 ring-accent-yellow/50">x</span>
                        </div>
                        <span className="text-xs font-mono text-white/40">5</span>
                    </div>

                    {/* Others */}
                    <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-[#151515] border border-white/5">
                        <span className="text-[10px] uppercase tracking-widest text-accent-red font-bold">Others</span>
                        <div className="flex gap-1">
                            <span className="w-6 h-6 flex items-center justify-center rounded bg-accent-red/20 text-accent-red font-mono text-xs font-bold ring-1 ring-accent-red/50">r</span>
                            <span className="w-6 h-6 flex items-center justify-center rounded bg-white/5 text-white/20 font-mono text-xs font-bold">-</span>
                            <span className="w-6 h-6 flex items-center justify-center rounded bg-white/5 text-white/20 font-mono text-xs font-bold">-</span>
                        </div>
                        <span className="text-xs font-mono text-white/40">4</span>
                    </div>
                </div>
            </div>
            <div className="mt-6 text-center">
                <code className="bg-black/50 px-4 py-2 rounded-lg text-accent-cyan font-mono text-sm border border-accent-cyan/20">chmod 754 script.sh</code>
            </div>
        </div>
    );
};

export const OSIVisual: React.FC = () => {
    const layers = [
        { num: 7, name: 'Application', data: 'Data', color: 'text-purple-400' },
        { num: 6, name: 'Presentation', data: 'Data', color: 'text-purple-300' },
        { num: 5, name: 'Session', data: 'Data', color: 'text-purple-200' },
        { num: 4, name: 'Transport', data: 'Segment', color: 'text-blue-400' },
        { num: 3, name: 'Network', data: 'Packet', color: 'text-green-400' },
        { num: 2, name: 'Data Link', data: 'Frame', color: 'text-yellow-400' },
        { num: 1, name: 'Physical', data: 'Bit', color: 'text-red-400' },
    ];

    return (
        <div className="my-10 flex justify-center">
            <div className="w-full max-w-sm bg-[#0F0F0F] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                {layers.map((layer) => (
                    <div key={layer.num} className="flex items-center justify-between px-6 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group cursor-default">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-mono text-white/20 w-4">L{layer.num}</span>
                            <span className={`font-bold text-sm ${layer.color} group-hover:brightness-125 transition-all`}>{layer.name}</span>
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-white/30 group-hover:text-white/60">{layer.data}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const NetworkTopologyVisual: React.FC = () => {
    return (
        <div className="my-10 p-8 rounded-xl bg-[#0F0F0F] border border-white/10 relative overflow-hidden flex flex-col gap-8">
            {/* WAN/Internet */}
            <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center animate-pulse">
                    <Globe className="text-blue-400" size={32} />
                </div>
            </div>

            {/* Connection Lines */}
            <div className="flex justify-center -my-4">
                <div className="w-px h-12 bg-gradient-to-b from-blue-500/50 to-white/10"></div>
            </div>

            <div className="flex flex-col md:flex-row justify-center gap-12">
                {/* LAN 1: Home */}
                <div className="flex flex-col items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                    <span className="text-xs font-bold text-white/60">LAN (Home)</span>
                    <div className="flex gap-2">
                        <div className="p-2 bg-black/50 rounded-lg border border-white/10">💻</div>
                        <div className="p-2 bg-black/50 rounded-lg border border-white/10">📱</div>
                    </div>
                    <Wifi size={16} className="text-green-400" />
                </div>

                {/* VPN Tunnel */}
                <div className="flex flex-col items-center justify-center relative w-32">
                    <div className="absolute inset-x-0 top-1/2 h-2 bg-accent-green/10 -translate-y-1/2 rounded-full blur-sm"></div>
                    <div className="absolute inset-x-0 top-1/2 h-0.5 border-t border-dashed border-accent-green/50 -translate-y-1/2"></div>
                    <div className="bg-[#0F0F0F] p-2 rounded-full border border-accent-green/30 relative z-10">
                        <Lock size={16} className="text-accent-green" />
                    </div>
                    <span className="text-[9px] mt-2 font-mono text-accent-green uppercase tracking-widest">VPN TUNNEL</span>
                </div>

                {/* LAN 2: Office */}
                <div className="flex flex-col items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                    <span className="text-xs font-bold text-white/60">LAN (Office)</span>
                    <div className="flex gap-2">
                        <div className="p-2 bg-black/50 rounded-lg border border-white/10">🖥️</div>
                        <div className="p-2 bg-black/50 rounded-lg border border-white/10">🖨️</div>
                    </div>
                    <Activity size={16} className="text-orange-400" />
                </div>
            </div>
        </div>
    );
};

export const AddressingVisual: React.FC = () => {
    return (
        <div className="my-10 p-6 rounded-xl bg-[#0F0F0F] border border-white/10 relative overflow-hidden flex flex-col gap-6">

            {/* IPv4 */}
            <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">IPv4 Format</span>
                <div className="flex flex-wrap gap-2 font-mono text-xl md:text-2xl font-bold">
                    <span className="text-accent-purple">192</span>
                    <span className="text-white/20">.</span>
                    <span className="text-accent-cyan">168</span>
                    <span className="text-white/20">.</span>
                    <span className="text-accent-green">1</span>
                    <span className="text-white/20">.</span>
                    <span className="text-white">10</span>
                </div>
                <div className="flex gap-1 text-[10px] font-mono text-white/30">
                    <span className="w-12 text-center border-t border-white/10 pt-1">8 bits</span>
                    <span className="w-4"></span>
                    <span className="w-12 text-center border-t border-white/10 pt-1">8 bits</span>
                    <span className="w-4"></span>
                    <span className="w-12 text-center border-t border-white/10 pt-1">8 bits</span>
                    <span className="w-4"></span>
                    <span className="w-12 text-center border-t border-white/10 pt-1">8 bits</span>
                </div>
            </div>

            <div className="h-px bg-white/5"></div>

            {/* Subnetting */}
            <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Subnet /24</span>
                <div className="flex items-center gap-4 bg-[#151515] p-3 rounded-lg border border-white/5">
                    <div className="flex-1">
                        <div className="text-sm font-mono text-white">192.168.1.<span className="text-accent-red">0</span></div>
                        <div className="text-[10px] text-white/40">Network Address</div>
                    </div>
                    <div className="text-white/20">→</div>
                    <div className="flex-1 text-right">
                        <div className="text-sm font-mono text-white">192.168.1.<span className="text-accent-red">255</span></div>
                        <div className="text-[10px] text-white/40">Broadcast Address</div>
                    </div>
                </div>
                <div className="text-center text-[10px] text-accent-green bg-accent-green/5 py-1 rounded">
                    Hosts Available: 254
                </div>
            </div>
        </div>
    );
};

export const VirtualizationVisual: React.FC = () => {
    return (
        <div className="my-10 grid md:grid-cols-2 gap-8">
            {/* VM */}
            <div className="bg-[#151515] p-6 rounded-xl border border-white/5 flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-white/5 px-2 py-1 text-[9px] uppercase tracking-widest text-white/50 rounded-bl-lg">Virtual Machine</div>
                <div className="h-20 bg-accent-purple/20 rounded-lg flex items-center justify-center border border-accent-purple/30 text-accent-purple font-bold text-xs mb-1">App A</div>
                <div className="h-12 bg-white/10 rounded-lg flex items-center justify-center border border-white/5 text-white/60 text-[10px]">Bins/Libs</div>
                <div className="h-16 bg-accent-red/10 rounded-lg flex items-center justify-center border border-accent-red/20 text-accent-red font-bold text-xs">Guest OS (Heavy)</div>
                <div className="h-10 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20 text-blue-400 text-xs mt-2">Hypervisor</div>
                <div className="h-8 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 text-[10px]">Infrastructure</div>
            </div>

            {/* Container */}
            <div className="bg-[#151515] p-6 rounded-xl border border-white/5 flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-white/5 px-2 py-1 text-[9px] uppercase tracking-widest text-white/50 rounded-bl-lg">Docker Container</div>
                <div className="grid grid-cols-2 gap-2 mb-1">
                    <div className="h-20 bg-accent-cyan/20 rounded-lg flex items-center justify-center border border-accent-cyan/30 text-accent-cyan font-bold text-xs">App A</div>
                    <div className="h-20 bg-accent-cyan/20 rounded-lg flex items-center justify-center border border-accent-cyan/30 text-accent-cyan font-bold text-xs">App B</div>
                </div>
                <div className="h-12 bg-white/10 rounded-lg flex items-center justify-center border border-white/5 text-white/60 text-[10px]">Bins/Libs (Shared)</div>
                <div className="h-16 bg-accent-green/10 rounded-lg flex items-center justify-center border border-accent-green/20 text-accent-green font-bold text-xs mt-2">Container Engine (Docker)</div>
                <div className="h-8 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 text-[10px]">Host OS & Infra</div>
            </div>
        </div>
    );
};
