
import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';

const AdminDashboardView: React.FC = () => {
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const users = [
    { name: 'm4n1p', email: 'admin@xack.io', rank: 'Top 1', status: 'Active', joins: '2023-01-15' },
    { name: 'CarlosVieira', email: 'cv@ghost.net', rank: 'Top 3', status: 'Active', joins: '2023-05-12' },
    { name: 'Sus-Hacker-42', email: 'sk@botnet.ru', rank: 'Level 1', status: 'Flagged', joins: '2024-02-10' },
    { name: user.username || 'Operative', email: user.email || 'me@xack.com', rank: 'Level 4', status: 'Active', joins: '2023-11-22' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-4xl font-display font-black text-white tracking-tight">{t('admin_title')}</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">{t('admin_integrity')}</p>
        </div>
        <button className="px-8 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 flex items-center gap-3">
          <span className="material-icons-round text-lg">add</span>
          {t('admin_deploy_new')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: t('admin_stats_operatives'), value: '1,240', icon: 'groups', color: 'text-primary' },
          { label: t('admin_stats_nodes'), value: '42', icon: 'router', color: 'text-accent' },
          { label: t('admin_stats_flags'), value: '18,432', icon: 'flag', color: 'text-amber-500' },
          { label: t('admin_stats_latency'), value: '14ms', icon: 'speed', color: 'text-emerald-500' }
        ].map((stat, i) => (
          <div key={i} className="glass rounded-3xl p-6 border border-white/5 shadow-xl flex items-center gap-5">
            <div className={`w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center ${stat.color}`}>
              <span className="material-icons-round">{stat.icon}</span>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">{stat.label}</p>
              <p className="text-2xl font-display font-black text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="glass rounded-[2.5rem] p-10 border border-white/5 shadow-2xl overflow-hidden">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="material-icons-round text-slate-500">manage_accounts</span>
              {t('admin_user_mgmt')}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Operative</th>
                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-500">{t('admin_privilege')}</th>
                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-500">{t('admin_status')}</th>
                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">{t('admin_actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u, i) => (
                    <tr key={i} className="group hover:bg-white/[0.02] transition-all">
                      <td className="py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10" />
                          <div>
                            <p className="text-sm font-bold text-white">{u.name}</p>
                            <p className="text-[10px] font-mono text-slate-600">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6"><span className="text-[10px] font-black text-primary uppercase">{u.rank}</span></td>
                      <td className="py-6">
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${u.status === 'Flagged' ? 'bg-red-500/10 text-red-400' : 'bg-accent/10 text-accent'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-slate-500 hover:text-white"><span className="material-icons-round text-sm">edit</span></button>
                          <button className="p-2 text-slate-500 hover:text-red-500"><span className="material-icons-round text-sm">block</span></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="glass rounded-[2.5rem] p-8 border border-white/5 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6">{t('admin_lab_deploy')}</h3>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Target Name</label>
                <input className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-primary" placeholder="e.g. Shadow-Kernel" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">{t('gen_difficulty')}</label>
                  <select className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-primary appearance-none">
                    <option>{t('gen_easy')}</option>
                    <option>{t('gen_medium')}</option>
                    <option>{t('gen_hard')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">{t('gen_os')}</label>
                  <select className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-primary appearance-none">
                    <option>Linux</option>
                    <option>Windows</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Image Bundle</label>
                <div className="p-4 bg-slate-950 border border-dashed border-slate-800 rounded-xl text-center cursor-pointer hover:border-primary transition-all">
                  <span className="material-icons-round text-slate-700 text-3xl mb-2">cloud_upload</span>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Upload .tar / .img</p>
                </div>
              </div>
              <button className="w-full py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-500 shadow-xl shadow-indigo-600/20">Initial Deployment</button>
            </div>
          </section>

          <section className="glass rounded-[2rem] p-8 border border-white/5 shadow-xl bg-red-500/5">
            <h4 className="text-sm font-black text-red-500 uppercase tracking-[0.3em] mb-4">{t('admin_urgent')}</h4>
            <div className="space-y-3">
              <button className="w-full py-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500/20">Purge Flag Database</button>
              <button className="w-full py-3 bg-slate-900 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl">Mainframe Backup</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardView;
