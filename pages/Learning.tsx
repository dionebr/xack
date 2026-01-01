import React from 'react';
import { RoadmapMap } from '../components/Roadmap/RoadmapMap';

const Learning: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-main text-white pb-20 overflow-x-hidden">

      {/* Hero Section */}
      <div className="relative pt-20 pb-12 px-6">
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-accent-purple/5 to-transparent pointer-events-none"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-accent-cyan/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-[1600px] mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/5 pb-12">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase font-black tracking-widest text-accent-cyan">
                  Beta Protocol
                </span>
                <span className="h-px w-12 bg-white/10"></span>
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-black text-white italic tracking-tighter uppercase leading-[0.9]">
                Operator <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-cyan">Roadmap</span>
              </h1>
              <p className="text-text-muted text-sm font-light tracking-wide leading-relaxed max-w-xl">
                Execute the structured progression path. Master the fundamentals, penetrate hardened systems,
                and evolve from <span className="text-white font-medium">Script Kiddie</span> to <span className="text-white font-medium">Red Team Operator</span>.
              </p>
            </div>

            {/* Stats Block */}
            <div className="flex gap-6">
              <div className="p-6 bg-bg-card border border-white/5 rounded-2xl backdrop-blur-sm min-w-[140px] group hover:border-white/10 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="material-symbols-outlined text-white/20">flag</span>
                  <span className="text-xs font-black text-accent-green">+12%</span>
                </div>
                <div className="text-3xl font-display font-black text-white italic">0/6</div>
                <div className="text-[9px] text-text-muted uppercase tracking-widest mt-1">Levels Cleared</div>
              </div>

              <div className="p-6 bg-bg-card border border-white/5 rounded-2xl backdrop-blur-sm min-w-[140px] group hover:border-white/10 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="material-symbols-outlined text-white/20">military_tech</span>
                </div>
                <div className="text-3xl font-display font-black text-white italic">Novice</div>
                <div className="text-[9px] text-text-muted uppercase tracking-widest mt-1">Current Rank</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-accent-green anim-pulse"></div>
            <span className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-black">Live Progression</span>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/5 hover:bg-white/5 transition-all text-[10px] uppercase font-bold tracking-widest text-text-muted hover:text-white">
            <span className="material-symbols-outlined text-sm">view_list</span>
            Switch to List View
          </button>
        </div>

        <RoadmapMap />
      </div>

      {/* Footer Quote */}
      <div className="text-center py-20 opacity-30">
        <p className="font-display font-black italic uppercase text-lg tracking-widest">"Cyber Security is not a destination"</p>
        <p className="font-mono text-xs mt-2 text-accent-cyan">It's a continuous integration loop.</p>
      </div>

    </div>
  );
};

export default Learning;
