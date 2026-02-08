
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MACHINES_DATA } from '../constants';

const MachineDetailView: React.FC = () => {
  const { id } = useParams();
  const machine = MACHINES_DATA.find(m => m.id === id);
  const [activeTab, setActiveTab] = useState('Overview');

  if (!machine) return <div className="text-center py-20 font-black uppercase tracking-widest text-slate-500">Operative, target was not found in database.</div>;

  return (
    <div className="space-y-10">
      {/* Hero Banner */}
      <div className="glass rounded-[3rem] p-10 flex flex-col lg:flex-row gap-12 items-center relative overflow-hidden shadow-2xl">
        <div className="absolute -right-16 -top-16 opacity-[0.03] pointer-events-none">
          <span className="material-symbols-outlined text-[320px] text-primary">terminal</span>
        </div>

        <div className="w-44 h-44 rounded-[2.5rem] bg-slate-950 border-2 border-white/10 p-3 shrink-0 shadow-2xl relative group">
          <div className="absolute inset-0 bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
          <img src={machine.image} className="w-full h-full object-cover rounded-[2rem] relative z-10" alt="" />
        </div>

        <div className="flex-1 space-y-6 relative z-10 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <h2 className="text-6xl font-display font-black text-white tracking-tighter italic">{machine.name}</h2>
            <span className="px-5 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-black border border-accent/20 uppercase tracking-[0.3em]">{machine.difficulty}</span>
          </div>

          <div className="flex flex-wrap justify-center lg:justify-start items-center gap-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">
            <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-950/80 rounded-2xl border border-white/5 shadow-xl">
              <span className="material-symbols-outlined text-primary text-base">router</span>
              <span className="font-mono text-white text-base tracking-widest">{machine.ip || '10.10.11.234'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">terminal</span>
              <span>{machine.os}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500">star</span>
              <span className="text-white">4.8 / 5.0</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">group</span>
              <span className="text-white">{machine.solves} SOLVES</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 min-w-[240px] relative z-10">
          <button className="w-full px-8 py-5 rounded-2xl bg-primary hover:bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
            <span className="material-icons-round text-xl">play_arrow</span>
            Spawn Machine
          </button>
          <button className="w-full px-8 py-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3">
            <span className="material-symbols-outlined text-lg">vpn_lock</span>
            Access VPN
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        {/* Content Area */}
        <div className="col-span-12 lg:col-span-8 space-y-10">
          {/* Tabs */}
          <div className="flex items-center gap-2 p-2 bg-white/5 rounded-[2rem] w-fit border border-white/5 shadow-xl">
            {['Overview', 'Tasks', 'Writeups', 'Forum'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300 ${activeTab === tab ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-500 hover:text-white'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-8">
            {activeTab === 'Overview' && (
              <div className="glass rounded-[2.5rem] p-10 border border-white/5 shadow-xl">
                <div className="flex items-start gap-6">
                  <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                    <span className="material-symbols-outlined text-4xl">info</span>
                  </div>
                  <div className="space-y-4 flex-1">
                    <h3 className="text-2xl font-black text-white">Mission Briefing</h3>
                    <div className="text-slate-400 leading-loose text-lg font-medium">
                      {machine.description || "Classified information. No detailed briefing available for this target yet."}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Target IP</h4>
                        <p className="font-mono text-white text-lg">{machine.ip || '10.10.11.xxx'}</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">OS Distribution</h4>
                        <p className="font-mono text-white text-lg">{machine.os}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Tasks' && (
              <>
                <div className="glass rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-white flex items-center gap-4">
                      <span className="material-symbols-outlined text-primary text-3xl">flag</span>
                      User Flag
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">20 Points</span>
                  </div>
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-700">key</span>
                      <input
                        type="text"
                        placeholder="XACK{user_flag_here}"
                        className="w-full bg-[#080b14] border border-white/5 rounded-2xl pl-14 pr-6 py-5 text-sm font-mono text-primary placeholder-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner"
                      />
                    </div>
                    <button className="px-10 py-5 bg-primary hover:bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all">Submit</button>
                  </div>
                </div>

                <div className="glass rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-white flex items-center gap-4">
                      <span className="material-symbols-outlined text-red-500 text-3xl">shield_person</span>
                      Root Flag
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">50 Points</span>
                  </div>
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-700">lock</span>
                      <input
                        type="text"
                        placeholder="XACK{root_flag_here}"
                        className="w-full bg-[#080b14] border border-white/5 rounded-2xl pl-14 pr-6 py-5 text-sm font-mono text-primary placeholder-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner"
                      />
                    </div>
                    <button className="px-10 py-5 bg-primary hover:bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all">Submit</button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'Writeups' && (
              <div className="relative group">
                <div className="glass rounded-[2.5rem] p-10 border border-white/5 opacity-30 select-none pointer-events-none blur-sm transition-all duration-700">
                  <h3 className="text-2xl font-black text-white mb-10">Community Solutions</h3>
                  <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-6 p-8 rounded-3xl bg-white/5 border border-white/5">
                        <div className="w-14 h-14 rounded-full bg-slate-800"></div>
                        <div className="flex-1 space-y-3">
                          <div className="h-4 bg-slate-800 w-1/3 rounded-full"></div>
                          <div className="h-3 bg-slate-800 w-2/3 rounded-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xl rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12 border border-white/10 z-20">
                  <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-[2rem] flex items-center justify-center mb-8 border border-white/10 shadow-[0_0_40px_rgba(245,158,11,0.3)]">
                    <span className="material-symbols-outlined text-white text-5xl font-black" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                  </div>
                  <h4 className="text-3xl font-display font-black text-white mb-4 tracking-tight">Access Restricted</h4>
                  <p className="text-slate-400 text-lg max-w-sm font-medium leading-relaxed mb-10">Complete both <span className="text-white font-bold">User</span> and <span className="text-white font-bold">Root</span> objectives to unlock community writeups.</p>

                  <div className="w-full max-w-xs space-y-4 mb-10">
                    <div className="flex justify-between items-end mb-1 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
                      <span>Progression</span>
                      <span className="text-amber-500">0/2 Completed</span>
                    </div>
                    <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full w-[10%] shadow-lg"></div>
                    </div>
                  </div>

                  <button onClick={() => setActiveTab('Tasks')} className="px-10 py-4 bg-primary hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl shadow-2xl transition-all flex items-center gap-3">
                    Return to Mission
                    <span className="material-icons-round text-lg">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-10">
          <section className="glass rounded-[2rem] p-8 border border-white/5 shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-8 flex items-center gap-3">
              <span className="material-symbols-outlined text-red-500 text-xl">water_drop</span>
              First Blood
            </h3>
            <div className="p-6 rounded-[2rem] bg-red-500/5 border border-red-500/10 flex items-center gap-5 group hover:bg-red-500/10 transition-all">
              <div className="w-16 h-16 rounded-[1.25rem] border-2 border-red-500/20 overflow-hidden shrink-0 group-hover:scale-110 transition-all duration-500">
                <img src="https://picsum.photos/seed/hacker1/100/100" className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white truncate">m4tr1x_r3v</p>
                <p className="text-[9px] text-slate-600 font-mono mt-1 uppercase">14m 22s recorded</p>
              </div>
              <span className="material-icons-round text-red-500 text-2xl animate-bounce">emoji_events</span>
            </div>
          </section>

          <section className="glass rounded-[2rem] p-8 border border-white/5 shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-8 flex items-center gap-3">
              <span className="material-symbols-outlined text-accent text-xl">verified</span>
              User Blood
            </h3>
            <div className="p-6 rounded-[2rem] bg-accent/5 border border-accent/10 flex items-center gap-5 group hover:bg-accent/10 transition-all">
              <div className="w-16 h-16 rounded-[1.25rem] border-2 border-accent/20 overflow-hidden shrink-0 group-hover:scale-110 transition-all duration-500">
                <img src="https://picsum.photos/seed/user/100/100" className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white truncate">CyberGhost</p>
                <p className="text-[9px] text-slate-600 font-mono mt-1 uppercase">08m 45s recorded</p>
              </div>
              <span className="material-symbols-outlined text-accent text-2xl">check_circle</span>
            </div>
          </section>

          <section className="glass rounded-[2rem] p-8 border border-white/5 shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-8 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">analytics</span>
              Mission Stats
            </h3>
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Solve Complexity</span>
                  <span className="text-[10px] font-black text-white font-mono">2h 15m</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" style={{ width: '65%' }} />
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Global Average</span>
                  <span className="text-[10px] font-black text-slate-500 font-mono">4h 32m</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MachineDetailView;
