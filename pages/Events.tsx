
import React from 'react';
import { ASSETS, MOCK_EVENTS, MOCK_NEWS } from '../constants';

const Events: React.FC = () => {
  return (
    <div className="max-w-[1800px] mx-auto space-y-12 pb-10">
      <div>
        <h1 className="text-4xl font-display font-bold text-white tracking-wide mb-2 italic uppercase">Events & Announcements</h1>
        <p className="text-text-muted text-sm max-w-2xl">Stay updated with the latest tournaments, security alerts, and platform features.</p>
      </div>

      {/* Featured Event Hero */}
      <div className="relative w-full h-[400px] rounded-[3rem] overflow-hidden group shadow-card bg-bg-card border border-white/5">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${ASSETS.eventHero})` }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-bg-main via-bg-main/20 to-transparent"></div>
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500"></div>
        
        <div className="absolute inset-0 p-12 flex flex-col justify-end">
          <div className="flex items-center gap-3 mb-4">
             <span className="px-4 py-1.5 rounded-full bg-accent-purple text-white text-[10px] font-black uppercase tracking-widest shadow-glow">Active Now</span>
             <span className="text-white/60 text-xs font-bold uppercase tracking-wider">Ends in 2 days</span>
          </div>
          <h2 className="text-5xl font-display font-black text-white italic tracking-tighter uppercase mb-4 max-w-2xl leading-none">
            Legends Arena<br/>Season 2024
          </h2>
          <p className="text-text-muted text-lg font-light max-w-xl mb-8 leading-relaxed">
            The world's most intense Capture The Flag competition. $50,000 prize pool. Are you ready to prove your skills?
          </p>
          <div className="flex gap-4">
            <button className="px-8 py-3.5 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-accent-cyan hover:text-white transition-all">Register Team</button>
            <button className="px-8 py-3.5 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all">View Brackets</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Latest News Feed */}
        <div className="lg:col-span-8 space-y-8">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-[0.2em] pl-1">Latest Intelligence</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_NEWS.map((news) => (
              <div key={news.id} className="bg-bg-card border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-white/10 transition-all">
                <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${news.image})` }}></div>
                <div className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-accent-purple uppercase tracking-widest">{news.category}</span>
                    <span className="text-[10px] text-text-muted font-bold uppercase">{news.date}</span>
                  </div>
                  <h4 className="text-xl font-display font-bold text-white mb-4 group-hover:text-accent-purple transition-colors italic">{news.title}</h4>
                  <p className="text-sm text-text-muted font-light leading-relaxed mb-6 line-clamp-2">{news.summary}</p>
                  <button className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 group/btn">
                    Read Intelligence <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events List */}
        <div className="lg:col-span-4 space-y-8">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-[0.2em] pl-1">Scheduled Ops</h3>
          <div className="space-y-4">
            {MOCK_EVENTS.map(event => (
              <div key={event.id} className="p-6 rounded-[2rem] bg-bg-card border border-white/5 hover:bg-white/5 transition-all cursor-pointer group">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center shrink-0">
                    <span className="text-lg font-black text-white font-display">24</span>
                    <span className="text-[8px] text-text-muted uppercase font-bold">OCT</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-accent-purple transition-colors uppercase italic">{event.title}</h4>
                    <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wider">{event.type} • {event.prizePool}</p>
                    <div className="flex items-center gap-2 mt-4 text-[9px] text-white/40 uppercase font-black">
                       <span className="material-symbols-outlined text-sm">groups</span>
                       {event.registeredTeams} Registered
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button className="w-full py-4 rounded-2xl border border-white/5 bg-bg-card text-text-muted text-[10px] font-bold uppercase tracking-widest hover:text-white transition-all">
              View Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;
