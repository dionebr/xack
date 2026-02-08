
import React from 'react';
import { ARENA_MATCHES } from '../constants';
import { useTranslation } from '../contexts/LanguageContext';

const ArenaView: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-6">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-5xl font-display font-black text-white dark:text-white tracking-tighter italic">{t('arena_title')} <span className="text-rose-500">1v1</span></h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">{t('arena_subtitle')}</p>
        </div>
        <button className="px-8 py-5 bg-rose-600 hover:bg-rose-500 text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl shadow-[0_0_30px_rgba(225,29,72,0.3)] transition-all flex items-center gap-4 group">
          <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">swords</span>
          {t('arena_challenge')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {ARENA_MATCHES.map((match) => (
          <div key={match.id} className="glass rounded-[3rem] p-8 border border-slate-200 dark:border-white/5 relative overflow-hidden group hover:border-rose-500/30 transition-all duration-500 shadow-2xl">
            <div className="absolute top-0 right-0 p-6">
              <span className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-rose-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                {match.status}
              </span>
            </div>

            <div className="flex flex-col gap-10">
              <div className="text-center">
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-1">{t('arena_target')}</h3>
                <p className="text-2xl font-display font-black text-slate-900 dark:text-white italic underline decoration-rose-500/50 underline-offset-8">{match.machine_name}</p>
                <p className="text-slate-600 font-mono text-[11px] mt-4">{match.time_elapsed} elapsed</p>
              </div>

              <div className="flex items-center justify-between gap-6 relative">
                {/* Player A */}
                <div className="flex-1 flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-[2rem] border-4 border-primary/30 p-1 bg-slate-900 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                    <img src={match.player_a.avatar} className="w-full h-full object-cover rounded-[1.5rem]" alt="" />
                  </div>
                  <div className="text-center">
                    <p className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">{match.player_a.name}</p>
                    <p className="text-primary font-mono text-[10px] mt-1">{match.player_a.progress}% Ready</p>
                  </div>
                </div>

                {/* VS Divider */}
                <div className="absolute left-1/2 top-10 -translate-x-1/2 z-10">
                  <div className="w-12 h-12 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-rose-500 font-black italic text-xl">VS</span>
                  </div>
                </div>

                {/* Player B */}
                <div className="flex-1 flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-[2rem] border-4 border-accent/30 p-1 bg-slate-900 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                    <img src={match.player_b.avatar} className="w-full h-full object-cover rounded-[1.5rem]" alt="" />
                  </div>
                  <div className="text-center">
                    <p className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">{match.player_b.name}</p>
                    <p className="text-accent font-mono text-[10px] mt-1">{match.player_b.progress}% Ready</p>
                  </div>
                </div>
              </div>

              {/* Combined Progress Bar */}
              <div className="space-y-4">
                <div className="h-4 w-full bg-slate-100 dark:bg-slate-950 rounded-full border border-slate-200 dark:border-white/5 p-1 relative overflow-hidden flex shadow-inner">
                  <div className="h-full bg-primary rounded-l-full transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: `${match.player_a.progress}%` }}></div>
                  <div className="h-full bg-slate-200 dark:bg-slate-800 flex-1"></div>
                  <div className="h-full bg-accent rounded-r-full transition-all duration-1000 shadow-[0_0_15px_rgba(45,212,191,0.5)] absolute right-1" style={{ width: `${match.player_b.progress}%` }}></div>
                </div>
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-600">
                  <span>{t('arena_status')}</span>
                  <span>Rooting Process</span>
                </div>
              </div>

              <button className="w-full py-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                {t('arena_spectate')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArenaView;
