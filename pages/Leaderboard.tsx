
import React from 'react';
import { MOCK_LEADERBOARD } from '../constants';

const Leaderboard: React.FC = () => {
  return (
    <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-8">
      <div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-wide neon-text mb-2 italic">GLOBAL RANKING</h1>
        <p className="text-text-muted text-sm font-light tracking-wide">Top hackers dominating the XACK universe</p>
      </div>

      <div className="bg-bg-card rounded-[2rem] border border-[#2a2a2c] shadow-card flex flex-col overflow-hidden relative">
        <div className="grid grid-cols-12 gap-4 px-8 py-5 border-b border-[#2a2a2c] bg-[#1a1a1c]">
          <div className="col-span-1 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest">Rank</div>
          <div className="col-span-5 text-[10px] font-bold text-text-muted uppercase tracking-widest pl-2">Hacker Profile</div>
          <div className="col-span-2 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest">Level</div>
          <div className="col-span-2 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest">Badges</div>
          <div className="col-span-2 text-right text-[10px] font-bold text-text-muted uppercase tracking-widest pr-4">Total Score</div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
          {MOCK_LEADERBOARD.map((user, i) => (
            <div key={user.username} className={`grid grid-cols-12 gap-4 px-4 py-4 items-center rounded-2xl border transition-all cursor-pointer group ${i === 0 ? 'border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 to-transparent' : 'border-transparent hover:bg-white/5'}`}>
              <div className="col-span-1 flex justify-center relative">
                {i === 0 && <span className="material-symbols-outlined text-yellow-500 absolute -top-3 text-lg drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]">crown</span>}
                <div className={`text-xl font-display font-bold ${i === 0 ? 'text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'text-text-muted'}`}>{user.rank}</div>
              </div>
              <div className="col-span-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full bg-cover bg-center border-2 ${i === 0 ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'border-[#333]'}`} style={{ backgroundImage: `url(${user.avatar})` }}></div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-base tracking-wide group-hover:text-accent-purple transition-colors italic">{user.username}</h3>
                    {i === 0 && <span className="bg-yellow-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(234,179,8,0.5)]">PRO</span>}
                  </div>
                  <div className="text-text-muted text-xs mt-0.5 flex items-center gap-1 uppercase tracking-widest">{user.country}</div>
                </div>
              </div>
              <div className="col-span-2 text-center">
                <div className="text-white font-display font-bold text-lg italic">Lvl {user.level}</div>
                <div className="w-16 h-1 bg-[#333] rounded-full mx-auto mt-1 overflow-hidden">
                  <div className="h-full bg-accent-purple" style={{ width: `${user.level}%` }}></div>
                </div>
              </div>
              <div className="col-span-2 flex justify-center gap-2">
                <span className="material-symbols-outlined text-yellow-500 text-sm">trophy</span>
                <span className="material-symbols-outlined text-purple-400 text-sm">military_tech</span>
                <span className="material-symbols-outlined text-blue-400 text-sm">verified</span>
              </div>
              <div className="col-span-2 text-right pr-4">
                <div className="text-2xl font-display font-bold text-white tracking-wider tabular-nums">{user.score.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
