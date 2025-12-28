
import React from 'react';
import { MOCK_PATHS, ASSETS } from '../constants';

const Learning: React.FC = () => {
  return (
    <div className="max-w-[1600px] mx-auto py-6 space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-black text-white italic tracking-tighter uppercase">Learning Hub</h1>
          <p className="text-text-muted text-sm font-light tracking-wide max-w-xl">Master specific domains with our architected learning paths. Gain experience, unlock badges, and track your tactical evolution.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-bg-card p-4 rounded-2xl border border-white/5 text-center min-w-[120px]">
              <div className="text-2xl font-display font-black text-accent-cyan italic">85%</div>
              <div className="text-[8px] text-text-muted uppercase font-black tracking-widest">Global Progress</div>
           </div>
           <div className="bg-bg-card p-4 rounded-2xl border border-white/5 text-center min-w-[120px]">
              <div className="text-2xl font-display font-black text-accent-purple italic">12</div>
              <div className="text-[8px] text-text-muted uppercase font-black tracking-widest">Paths Finished</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Paths Grid */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.25em] pl-1">Curated Paths</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_PATHS.map(path => (
              <div key={path.id} className="bg-bg-card border border-white/5 rounded-[2.5rem] p-8 group hover:border-white/20 transition-all shadow-card relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 rounded-full" style={{ backgroundColor: path.color }}></div>
                <div className="flex items-start justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 bg-white/5 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl" style={{ color: path.color }}>{path.icon}</span>
                  </div>
                  <span className="text-[9px] font-black text-white uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full border border-white/10">{path.level}</span>
                </div>
                <h4 className="text-2xl font-display font-black text-white mb-2 italic uppercase tracking-tighter">{path.title}</h4>
                <p className="text-[10px] text-text-muted uppercase tracking-widest mb-8">{path.challenges} Targeted Challenges</p>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-[9px] font-black text-text-muted uppercase tracking-widest">
                    <span>Path Evolution</span>
                    <span>{path.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${path.progress}%`, backgroundColor: path.color }}></div>
                  </div>
                </div>
                
                <button className="w-full mt-8 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Continue Mission</button>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Learning Info */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-bg-card rounded-[2.5rem] p-8 border border-white/5 shadow-card">
            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.25em] mb-8">Special Badges</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: 'First Blood', icon: 'colorize', color: '#ef4444' },
                { name: 'Sys Breaker', icon: 'bolt', color: '#eab308' },
                { name: 'Persistent', icon: 'all_inclusive', color: '#00f0ff' },
                { name: 'Elite Reporter', icon: 'description', color: '#b946e9' },
                { name: 'Stealth Ops', icon: 'visibility_off', color: '#fff' },
                { name: 'Web Slayer', icon: 'language', color: '#22c55e' }
              ].map(badge => (
                <div key={badge.name} className="flex flex-col items-center gap-3 group">
                   <div className="w-16 h-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center transition-all group-hover:border-white/20 group-hover:scale-105 shadow-glow">
                      <span className="material-symbols-outlined text-2xl" style={{ color: badge.color }}>{badge.icon}</span>
                   </div>
                   <span className="text-[8px] font-black text-text-muted uppercase tracking-tighter text-center">{badge.name}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-10 py-3 rounded-xl border border-white/5 bg-white/5 text-text-muted text-[9px] font-black uppercase tracking-widest hover:text-white transition-all">View All Achievements (42)</button>
          </div>

          <div className="bg-bg-card rounded-[2.5rem] p-8 border border-white/5 shadow-card relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/5 blur-3xl rounded-full"></div>
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.25em] mb-4 italic">Writeups Repository</h3>
            <p className="text-[10px] text-text-muted font-light leading-relaxed mb-6">Review elite methodologies from solved machines to refine your offensive tactics.</p>
            <button className="w-full py-4 bg-bg-main border border-white/10 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest hover:border-accent-purple transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-base">auto_stories</span>
              Open Repository
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learning;
