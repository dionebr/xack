
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { api } from '../api';
import { Activity } from '../types';

const DashboardView: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [hacktivity, setHacktivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, hackData] = await Promise.all([
          api.get('/api/dashboard'),
          api.get('/api/hacktivity')
        ]);
        setStats(statsData);
        setHacktivity(hackData.hacktivity || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const user = stats?.user;
  const currentMachine = stats?.activeMachine || {
    name: "No Active Target",
    difficulty: "N/A",
    os: "N/A",
    ip: "---",
    progress: 0,
    xp: 0
  };

  return (
    <div className="grid grid-cols-12 gap-8 animate-[fadeIn_0.5s_ease-out]">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Current Machine Status */}
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
        <div className="glass rounded-[2.5rem] p-10 shadow-xl dark:shadow-2xl relative overflow-hidden bg-white/80 dark:bg-slate-900/60">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
              <div className="flex gap-10 items-center">
                <div className="relative flex items-center justify-center w-28 h-28 shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(99,102,241,0.2)] dark:drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                    <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100 dark:text-slate-900" />
                    <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray="276.46" strokeDashoffset={276.46 - (276.46 * currentMachine.progress) / 100} strokeLinecap="round" className="text-primary transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black text-slate-900 dark:text-white font-display">{currentMachine.progress}%</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-5xl font-display font-black tracking-tighter text-slate-900 dark:text-white mb-2 italic">{currentMachine.name}</h2>
                  <div className="flex items-center gap-3">
                    <span className="px-3.5 py-1 rounded-full text-[10px] font-black bg-accent/10 text-accent border border-accent/20 uppercase tracking-[0.2em]">{currentMachine.difficulty}</span>
                    <span className="px-3.5 py-1 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase tracking-[0.2em]">{currentMachine.os}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                <div className="flex items-center gap-4 bg-white dark:bg-[#080b14]/80 backdrop-blur-md text-primary px-6 py-3 rounded-2xl border border-slate-200 dark:border-primary/20 font-mono text-base hover:border-primary transition-all cursor-pointer group shadow-lg">
                  <span className="tracking-widest">{currentMachine.ip}</span>
                  <span className="material-icons-round text-lg opacity-50 group-hover:opacity-100">content_copy</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  <span className="material-icons-round text-sm text-amber-500 animate-pulse">timer</span>
                  <span>{t('dash_time_remaining')}: 00:55:57</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {[
                { label: 'Total XP', value: `${user?.total_xp || 0}xp`, color: 'text-primary' },
                { label: 'Rank', value: user?.rank_title || 'Novice', color: 'text-accent' },
                { label: 'Level', value: `LVL ${user?.level || 1}`, color: 'text-white' },
                { label: 'Flags', value: '1/4', color: 'text-slate-900 dark:text-white' }
              ].map((stat, i) => (
                <div key={i} className="p-6 rounded-3xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all shadow-sm">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600 mb-2">{stat.label}</p>
                  <div className="flex items-center gap-3">
                    <p className={`text-xl font-black ${stat.color || 'text-slate-900 dark:text-white'}`}>{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
              <button className="flex-1 flex items-center justify-center gap-3 px-8 py-5 rounded-[1.25rem] bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-rose-500/20">
                <span className="material-icons-round text-xl">power_settings_new</span>
                {t('dash_shutdown')}
              </button>
              <button className="flex-1 flex items-center justify-center gap-3 px-8 py-5 rounded-[1.25rem] bg-primary hover:bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-primary/20">
                <span className="material-icons-round text-xl">add_alarm</span>
                {t('dash_add_time')}
              </button>
              <button className="flex-1 flex items-center justify-center gap-3 px-8 py-5 rounded-[1.25rem] bg-accent hover:bg-teal-600 text-slate-950 font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-accent/20">
                <span className="material-icons-round text-xl">flag</span>
                {t('dash_submit_flag')}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass rounded-[2rem] p-8 border border-slate-200 dark:border-white/5 bg-white/60 dark:bg-slate-900/40 shadow-lg">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">description</span>
              {t('dash_user_access')}
            </h3>
            <div className="flex items-center gap-5 p-5 rounded-2xl bg-accent/5 dark:bg-accent/10 border border-accent/20 text-accent group cursor-pointer hover:bg-accent/10 dark:hover:bg-accent/20 transition-all">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                <span className="material-icons-round">check_circle</span>
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-widest">Captured User Flag</p>
                <p className="text-[10px] font-bold opacity-60">Verified Mission</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-[2rem] p-8 border border-slate-200 dark:border-white/5 bg-white/60 dark:bg-slate-900/40 shadow-lg">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined">admin_panel_settings</span>
              {t('dash_root_privileges')}
            </h3>
            <div className="flex items-center gap-5 p-5 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 dark:text-slate-600">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <span className="material-icons-round">lock</span>
              </div>
              <p className="text-sm font-black uppercase tracking-widest italic">{t('dash_not_captured')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Hacktivity */}
      <div className="col-span-12 lg:col-span-4 h-full">
        <div className="glass rounded-[2.5rem] p-10 border border-slate-200 dark:border-white/5 flex flex-col h-full shadow-xl dark:shadow-2xl bg-white dark:bg-slate-900/80">
          <div className="mb-10">
            <h3 className="text-2xl font-display font-black text-slate-900 dark:text-white mb-2">{t('dash_hacktivity')}</h3>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">{t('dash_total_owns')}: {hacktivity.length}</p>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto custom-scrollbar pr-2">
            {hacktivity.map((act: any) => (
              <div key={act.id} className="flex gap-5 p-5 rounded-[1.5rem] bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 hover:border-primary/20 transition-all group shadow-sm">
                <div className="relative shrink-0">
                  <img src={act.avatar || `https://picsum.photos/seed/${act.user}/40/40`} className="w-12 h-12 rounded-2xl ring-2 ring-white dark:ring-white/5 shadow-md" alt="" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-accent rounded-full border-2 border-white dark:border-[#101424] flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-[12px] text-slate-950 font-black">bolt</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-black text-slate-900 dark:text-white truncate">{act.user}</p>
                    <span className="text-[9px] text-slate-400 dark:text-slate-600 font-mono">{new Date(act.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{act.machine} - {act.flag_type}</p>
                    <span className="px-2 py-0.5 rounded-lg bg-accent/10 text-accent text-[9px] font-black">+{act.points}XP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-10 w-full py-4 rounded-2xl border border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all">
            {t('dash_logs')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
