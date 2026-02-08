
import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';

const ScoreboardView: React.FC = () => {
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const topThree = [
    { rank: 2, name: 'r00t_kit', xp: '14,250', avatar: 'https://picsum.photos/seed/root/120/120', color: 'border-slate-300' },
    { rank: 1, name: 'm4n1p', xp: '18,900', avatar: 'https://picsum.photos/seed/m4n1p/140/140', color: 'border-amber-400' },
    { rank: 3, name: 'CarlosVieira', xp: '12,100', avatar: 'https://picsum.photos/seed/carlos/120/120', color: 'border-amber-700/50' }
  ];

  const players = [
    { rank: '04', name: 'bruno_castelo', title: 'Pro Hacker', flags: 142, xp: '10,850', trend: 'up', avatar: 'https://picsum.photos/seed/bruno/40/40' },
    { rank: '05', name: 'LeonardoR', title: 'Script Kid', flags: 128, xp: '9,420', trend: 'none', avatar: 'https://picsum.photos/seed/leo/40/40' },
    { rank: '06', name: user.username || 'Operative', title: 'Rising Star', flags: 96, xp: '8,120', trend: 'up', avatar: user.avatar_url || 'https://picsum.photos/seed/user/40/40', isYou: true },
    { rank: '07', name: 'Alkarramax', title: 'Pwn Lord', flags: 88, xp: '7,650', trend: 'down', avatar: 'https://picsum.photos/seed/alk/40/40' },
    { rank: '08', name: 'NullPointer', title: 'Security Auditor', flags: 72, xp: '6,900', trend: 'none', avatar: 'https://picsum.photos/seed/null/40/40' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-6">
      <div className="text-center space-y-2">
        <h2 className="text-5xl font-display font-black text-white tracking-tight leading-tight">{t('score_title')}</h2>
        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">{t('score_subtitle')}</p>
      </div>

      {/* Podium Section */}
      <div className="grid grid-cols-3 gap-8 items-end px-4 pt-12">
        {/* 2nd Place */}
        <div className="flex flex-col items-center group transition-transform hover:-translate-y-2 duration-500">
          <div className="relative mb-6">
            <div className={`w-24 h-24 rounded-3xl border-4 ${topThree[0].color} overflow-hidden shadow-2xl relative z-10 bg-slate-900`}>
              <img src={topThree[0].avatar} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-300 dark:bg-slate-600 text-slate-950 font-black px-4 py-1 rounded-full border-2 border-slate-900 text-[10px] uppercase tracking-widest z-20 shadow-xl">
              2nd
            </div>
          </div>
          <div className="text-center mb-8">
            <h3 className="font-bold text-lg text-white mb-1 tracking-tight">{topThree[0].name}</h3>
            <p className="text-primary font-mono text-sm font-bold">{topThree[0].xp} XP</p>
          </div>
          <div className="w-full h-32 glass bg-slate-200/5 dark:bg-slate-800/20 rounded-t-[2.5rem] border-b-0 shadow-2xl"></div>
        </div>

        {/* 1st Place */}
        <div className="flex flex-col items-center group transition-transform hover:-translate-y-3 duration-500">
          <div className="relative mb-6">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-0">
              <span className="material-icons-round text-amber-400 text-5xl drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">workspace_premium</span>
            </div>
            <div className={`w-32 h-32 rounded-[2.5rem] border-4 ${topThree[1].color} overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.2)] relative z-10 bg-slate-900`}>
              <img src={topThree[1].avatar} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-amber-400 text-[#080b14] text-xs font-black px-6 py-2 rounded-full border-4 border-slate-900 uppercase tracking-widest z-20 shadow-2xl">
              1st
            </div>
          </div>
          <div className="text-center mb-10">
            <h3 className="font-display font-black text-2xl text-white tracking-tight mb-1 uppercase">{topThree[1].name}</h3>
            <p className="text-primary font-mono text-lg font-bold">{topThree[1].xp} XP</p>
          </div>
          <div className="w-full h-44 glass bg-amber-400/5 rounded-t-[2.5rem] border-amber-400/20 border-b-0 shadow-2xl"></div>
        </div>

        {/* 3rd Place */}
        <div className="flex flex-col items-center group transition-transform hover:-translate-y-2 duration-500">
          <div className="relative mb-6">
            <div className={`w-20 h-20 rounded-[1.5rem] border-4 ${topThree[2].color} overflow-hidden shadow-2xl relative z-10 bg-slate-900`}>
              <img src={topThree[2].avatar} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-800 text-white font-black px-4 py-1 rounded-full border-2 border-slate-900 text-[9px] uppercase tracking-widest z-20 shadow-xl">
              3rd
            </div>
          </div>
          <div className="text-center mb-6">
            <h3 className="font-bold text-base text-white mb-1 tracking-tight">{topThree[2].name}</h3>
            <p className="text-primary font-mono text-xs font-bold">{topThree[2].xp} XP</p>
          </div>
          <div className="w-full h-24 glass bg-slate-200/5 dark:bg-slate-800/20 rounded-t-[2.5rem] border-b-0 shadow-2xl"></div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="glass rounded-[2rem] overflow-hidden border border-white/5 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-white/5">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 w-24 text-center">{t('score_rank')}</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('score_hacker')}</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">{t('score_trend')}</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">{t('score_flags')}</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right pr-12">{t('mach_total_xp')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {players.map((p) => (
                <tr key={p.rank} className={`transition-all hover:bg-white/[0.03] group ${p.isYou ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}>
                  <td className={`px-8 py-6 text-center font-mono font-black ${p.isYou ? 'text-primary' : 'text-slate-500 group-hover:text-slate-400'}`}>
                    {p.rank}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <img src={p.avatar} className={`w-11 h-11 rounded-xl border ${p.isYou ? 'border-primary/50 ring-4 ring-primary/10' : 'border-white/10 group-hover:border-white/20'}`} alt="" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-bold text-sm text-white">{p.name}</p>
                          {p.isYou && <span className="px-1.5 py-0.5 rounded bg-primary text-white text-[8px] font-black uppercase tracking-tighter">You</span>}
                        </div>
                        <p className={`text-[10px] font-black uppercase tracking-widest italic ${p.isYou ? 'text-primary/60' : 'text-slate-600 group-hover:text-slate-500'}`}>{p.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {p.trend === 'up' && <span className="material-icons-round text-emerald-500 text-lg">trending_up</span>}
                    {p.trend === 'down' && <span className="material-icons-round text-rose-500 text-lg">trending_down</span>}
                    {p.trend === 'none' && <span className="material-icons-round text-slate-700">remove</span>}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-sm font-black text-white font-mono tracking-tight">{p.flags}</span>
                  </td>
                  <td className="px-8 py-6 text-right pr-12">
                    <span className="text-sm font-black text-primary font-mono tracking-tight">{p.xp}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-6 bg-slate-950/40 border-t border-white/5 flex justify-between items-center">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{t('score_showing')} 1-8 {t('score_of')} 1,240 hackers</p>
          <div className="flex gap-2">
            <button className="p-2 rounded-xl border border-white/5 hover:bg-white/5 text-slate-500 transition-colors">
              <span className="material-icons-round text-sm">chevron_left</span>
            </button>
            <button className="w-10 h-10 rounded-xl bg-primary text-white font-black text-xs shadow-lg shadow-primary/20">1</button>
            <button className="w-10 h-10 rounded-xl border border-white/5 hover:bg-white/5 text-slate-500 font-black text-xs transition-colors">2</button>
            <button className="w-10 h-10 rounded-xl border border-white/5 hover:bg-white/5 text-slate-500 font-black text-xs transition-colors">3</button>
            <button className="p-2 rounded-xl border border-white/5 hover:bg-white/5 text-slate-500 transition-colors">
              <span className="material-icons-round text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreboardView;
