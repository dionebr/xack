
import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';

const LearningView: React.FC = () => {
  const { t } = useTranslation();
  const tracks = [
    {
      title: 'Web Penetration',
      difficulty: 'Intermediate',
      modules: 12,
      duration: '18h',
      progress: 65,
      image: 'https://picsum.photos/seed/webtrack/600/400',
      description: 'Master OWASP Top 10, SSRF, SQLi, and advanced web infiltration techniques.'
    },
    {
      title: 'Digital Forensics',
      difficulty: 'Hard',
      modules: 8,
      duration: '22h',
      progress: 10,
      image: 'https://picsum.photos/seed/forensic/600/400',
      description: 'Memory analysis, artifact recovery, and threat hunting in enterprise environments.'
    },
    {
      title: 'Active Directory Infiltration',
      difficulty: 'Advanced',
      modules: 15,
      duration: '30h',
      progress: 0,
      image: 'https://picsum.photos/seed/adtrack/600/400',
      description: 'Privilege escalation, lateral movement, and Kerberos attacks in Windows domains.'
    },
    {
      title: 'Mobile App Security',
      difficulty: 'Intermediate',
      modules: 6,
      duration: '10h',
      progress: 0,
      image: 'https://picsum.photos/seed/mobiletrack/600/400',
      description: 'Analyze Android and iOS applications for vulnerabilities and data leaks.'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-16 py-8 pb-20">
      <section className="glass rounded-[3rem] p-12 flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none">
          <span className="material-symbols-outlined text-[240px] text-primary">school</span>
        </div>
        <div className="flex-1 space-y-6 relative z-10 text-center lg:text-left">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-[10px] font-black uppercase tracking-[0.4em] border border-accent/20">{t('learn_subtitle')}</span>
          <h2 className="text-5xl md:text-6xl font-display font-black text-white tracking-tighter leading-tight italic">{t('learn_title')}</h2>
          <p className="text-slate-400 text-lg max-w-2xl font-medium leading-relaxed">{t('learn_desc')}</p>
          <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
            <div className="flex items-center gap-3 bg-white/[0.03] px-5 py-2.5 rounded-2xl border border-white/5">
              <span className="text-xl font-bold text-white">45</span>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{t('learn_total_paths')}</span>
            </div>
            <div className="flex items-center gap-3 bg-white/[0.03] px-5 py-2.5 rounded-2xl border border-white/5">
              <span className="text-xl font-bold text-white">320h</span>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{t('learn_content')}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {tracks.map((track, i) => (
          <div key={i} className="group glass rounded-[2.5rem] overflow-hidden border border-white/5 flex flex-col shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer">
            <div className="h-56 relative bg-slate-950 overflow-hidden">
              <img src={track.image} className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-1000" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d1a] via-transparent to-transparent"></div>
              <div className="absolute top-6 left-6">
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-2xl ${
                  track.difficulty === 'Intermediate' ? 'bg-primary/10 text-primary border-primary/20' :
                  track.difficulty === 'Hard' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                  'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                  {track.difficulty === 'Intermediate' ? t('gen_medium') : track.difficulty === 'Hard' ? t('gen_hard') : 'Advanced'}
                </span>
              </div>
            </div>

            <div className="p-10 flex flex-col gap-6">
              <div>
                <h3 className="text-3xl font-display font-black text-white tracking-tight mb-3">{track.title}</h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed italic">"{track.description}"</p>
              </div>

              <div className="flex gap-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <span className="material-icons-round text-primary text-base">layers</span>
                  <span>{track.modules} {t('learn_modules')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-icons-round text-primary text-base">schedule</span>
                  <span>{track.duration} {t('learn_approx')}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('mach_progression')}</span>
                  <span className="text-[10px] font-black text-primary font-mono">{track.progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div className={`h-full bg-primary rounded-full transition-all duration-1000 ${track.progress > 0 ? 'shadow-[0_0_10px_rgba(99,102,241,0.5)]' : ''}`} style={{ width: `${track.progress}%` }} />
                </div>
              </div>

              <button className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all ${track.progress > 0 ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                {track.progress > 0 ? t('learn_continue') : t('learn_enroll')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningView;
