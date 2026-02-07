
import React from 'react';
import { HALL_OF_FAME_DATA } from '../constants';

const HallOfFameView: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-16 py-10">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 px-6 py-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full">
          <span className="material-symbols-outlined text-xl">military_tech</span>
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">The Scroll of Honor</span>
        </div>
        <h2 className="text-7xl font-display font-black text-white tracking-tighter leading-tight italic">Hall of <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-600">Fame.</span></h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">The eternal legends of XACK. Those who pushed the boundaries of infiltration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-end px-4">
        {/* Top 3 Stylized Cards */}
        {[HALL_OF_FAME_DATA[1], HALL_OF_FAME_DATA[0], HALL_OF_FAME_DATA[2]].map((h, i) => (
          <div key={h.rank} className={`flex flex-col items-center group ${i === 1 ? '-translate-y-12' : ''}`}>
            <div className="relative mb-8">
              <div className={`w-44 h-44 rounded-[3.5rem] border-8 ${h.rank === 1 ? 'border-amber-400 shadow-[0_0_60px_rgba(251,191,36,0.2)]' : h.rank === 2 ? 'border-slate-300' : 'border-amber-800'} overflow-hidden relative z-10 bg-slate-900 group-hover:scale-105 transition-transform duration-700`}>
                <img src={h.avatar} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-20">
                <div className={`px-8 py-2 rounded-2xl border-4 border-slate-950 font-black text-xs uppercase tracking-widest shadow-2xl ${h.rank === 1 ? 'bg-amber-400 text-black' : 'bg-slate-800 text-white'}`}>
                  Rank {h.rank}
                </div>
              </div>
              {h.rank === 1 && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce">
                  <span className="material-icons-round text-amber-400 text-6xl drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">workspace_premium</span>
                </div>
              )}
            </div>
            
            <div className="text-center space-y-2 mb-10">
              <h3 className="text-3xl font-display font-black text-white uppercase tracking-tighter italic">{h.name}</h3>
              <p className="text-amber-500 font-mono font-black text-xl">{h.totalXp} XP</p>
              <div className="flex gap-4 justify-center pt-2">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-600 uppercase">Achievements</p>
                  <p className="text-white font-bold">{h.achievements}</p>
                </div>
                <div className="w-px h-8 bg-white/5"></div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-600 uppercase">Joined</p>
                  <p className="text-white font-bold">{h.joinedYear}</p>
                </div>
              </div>
            </div>

            <div className={`w-full ${h.rank === 1 ? 'h-64 bg-amber-400/10 border-amber-400/20' : 'h-48 bg-white/5 border-white/10'} glass rounded-t-[4rem] border-b-0 shadow-2xl relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(251, 191, 36, 0.5) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Other Legends Table */}
      <div className="glass rounded-[3rem] p-10 border border-white/5 shadow-2xl">
        <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-600 mb-10 text-center">Lifetime Honorable Mentions</h4>
        <div className="grid gap-6">
          {HALL_OF_FAME_DATA.slice(3).map((h) => (
            <div key={h.rank} className="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
              <div className="flex items-center gap-8">
                <span className="text-2xl font-display font-black text-slate-700 group-hover:text-amber-500/50 transition-colors italic w-8 text-center">{h.rank}</span>
                <div className="flex items-center gap-4">
                  <img src={h.avatar} className="w-14 h-14 rounded-2xl grayscale group-hover:grayscale-0 transition-all border border-white/10" alt="" />
                  <div>
                    <p className="text-lg font-black text-white uppercase tracking-tight">{h.name}</p>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Enlisted since {h.joinedYear}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-12 text-right">
                <div>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Global Achievements</p>
                  <p className="text-sm font-bold text-white">{h.achievements} Medals</p>
                </div>
                <div className="min-w-[120px]">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Lifetime Prowess</p>
                  <p className="text-xl font-mono font-black text-amber-500">{h.totalXp}</p>
                </div>
                <span className="material-icons-round text-slate-700 group-hover:text-amber-500 transition-colors">chevron_right</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HallOfFameView;
