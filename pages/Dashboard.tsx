import React from 'react';
import { Link } from 'react-router-dom';
import { ASSETS, MOCK_MACHINES, MOCK_LEADERBOARD } from '../constants';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { profile, loading } = useAuth();

  return (
    <div className="max-w-[1800px] mx-auto grid grid-cols-12 gap-8">
      {/* Left Main Column */}
      <div className="col-span-12 lg:col-span-9 flex flex-col gap-8">

        {/* Featured Hero */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider pl-1">Events and News</h3>
          <div className="relative w-full h-[340px] rounded-[2rem] overflow-hidden group shadow-card bg-bg-card border border-[#2a2a2c]/50">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${ASSETS.eventHero})` }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-bg-main via-bg-main/40 to-transparent opacity-90"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-bg-main/90 via-bg-main/20 to-transparent"></div>

            <div className="absolute inset-0 p-10 flex flex-col justify-between">
              <div className="flex justify-end">
                <div className="px-8 py-2.5 rounded-xl glass-panel border border-white/20 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                  <img src={ASSETS.LOGO} alt="XACK" className="h-8 w-auto" />
                </div>
              </div>

              <div className="flex items-end justify-between w-full">
                <div className="max-w-xl">
                  <h2 className="text-4xl md:text-5xl font-display font-bold text-white leading-[1.1] mb-2 neon-text tracking-wide uppercase italic">
                    Legends Arena<br />Championship
                  </h2>
                </div>

                <div className="glass-panel rounded-2xl py-3 px-8 border border-white/10 backdrop-blur-xl">
                  <div className="flex items-center gap-6 text-center">
                    <div>
                      <div className="text-3xl font-display font-bold text-white">12</div>
                      <div className="text-[9px] uppercase text-text-muted mt-0.5 tracking-wider">Hours</div>
                    </div>
                    <div className="text-xl font-bold text-white/50 mb-3">:</div>
                    <div>
                      <div className="text-3xl font-display font-bold text-white">25</div>
                      <div className="text-[9px] uppercase text-text-muted mt-0.5 tracking-wider">Minutes</div>
                    </div>
                    <div className="text-xl font-bold text-white/50 mb-3">:</div>
                    <div>
                      <div className="text-3xl font-display font-bold text-white">50</div>
                      <div className="text-[9px] uppercase text-text-muted mt-0.5 tracking-wider">Seconds</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tracks Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Featured Tracks</h3>
            <Link to="/machines" className="text-[10px] border border-[#333] px-3 py-1.5 rounded-full text-text-muted hover:text-white flex items-center gap-1 transition-colors hover:bg-white/5">
              View All <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
            </Link>
          </div>

          <div className="bg-bg-card p-6 rounded-[2rem] border border-[#2a2a2c] shadow-card">
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <button className="px-5 py-2 rounded-full border border-white/20 bg-white/5 text-[11px] font-bold tracking-wide text-white hover:bg-white/10 transition uppercase">Get Started</button>
              <button className="px-5 py-2 rounded-full border border-[#333] text-[11px] font-bold tracking-wide text-text-muted hover:text-white hover:border-white/20 transition uppercase">Cyber Attacks</button>
              <button className="px-5 py-2 rounded-full border border-[#333] text-[11px] font-bold tracking-wide text-text-muted hover:text-white hover:border-white/20 transition uppercase">Blue Hat</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {MOCK_MACHINES.slice(0, 3).map((track, idx) => (
                <Link key={track.id} to={`/machines/${track.id}`} className="group cursor-pointer">
                  <div className="h-44 rounded-2xl bg-cover bg-center mb-4 relative overflow-hidden border border-[#333] group-hover:border-accent-purple/40 transition-all" style={{ backgroundImage: `url(${track.image})` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80 group-hover:opacity-40 transition-opacity"></div>
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/60 border border-white/10 text-[8px] font-black uppercase text-white tracking-widest">{track.difficulty}</div>
                  </div>
                  <h4 className="text-white font-display font-bold text-lg mb-2 uppercase italic tracking-tighter">TRACK {idx + 1}: {track.name}</h4>
                  <p className="text-text-muted text-[11px] leading-relaxed line-clamp-2 opacity-80 font-light">{track.description}</p>
                </Link>
              ))}
            </div>

            <div className="mt-8 h-1.5 w-full bg-[#111] rounded-full overflow-hidden flex items-center p-[1px]">
              <div className="h-full w-2/3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar Column */}
      <div className="col-span-12 lg:col-span-3 space-y-6">

        {/* Profile Card */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider pl-1">Agent Profile</h3>
          <div className="bg-bg-card rounded-[2rem] p-6 border border-[#2a2a2c] flex flex-col items-center relative shadow-card overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/5 blur-[60px] rounded-full"></div>

            <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
              <div className="w-1.5 h-1.5 bg-status-green rounded-full shadow-[0_0_8px_#22c55e]"></div>
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Active</span>
            </div>

            <div className="relative mt-4 mb-4 z-10">
              {profile?.avatar_url ? (
                <div className="w-28 h-28 rounded-full p-[3px] bg-gradient-to-tr from-[#1c2f2d] to-[#2d6078] shadow-glow">
                  <div className="w-full h-full rounded-full bg-cover bg-center border-[4px] border-bg-card" style={{ backgroundImage: `url(${profile.avatar_url})` }}></div>
                </div>
              ) : (
                <div className="w-28 h-28 rounded-full p-[3px] bg-gradient-to-tr from-[#1c2f2d] to-[#2d6078] shadow-glow flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-neutral-900 border-[4px] border-bg-card flex items-center justify-center text-4xl font-black text-white uppercase">
                    {profile?.full_name ? profile.full_name.charAt(0) : (profile?.username ? profile.username.charAt(0) : '?')}
                  </div>
                </div>
              )}

              <div className="absolute -bottom-1 -right-1 bg-accent-purple text-white rounded-full p-1 border-4 border-bg-card shadow-lg">
                <span className="material-symbols-outlined text-[12px] font-bold block">verified</span>
              </div>
            </div>

            <h2 className="text-2xl font-display font-black text-white mb-2 tracking-wide italic uppercase z-10 text-center">
              {loading ? '...' : (profile?.full_name || profile?.username || 'Unknown Agent')}
            </h2>
            <div className="px-3 py-1 rounded-full bg-accent-purple/10 border border-accent-purple/30 text-accent-purple text-[9px] font-black uppercase tracking-[0.2em] mb-6">
              {profile?.role || 'Operative'} • Lv {Math.floor((profile?.score || 0) / 1000) + 1}
            </div>

            <div className="flex items-center gap-0 w-full justify-center mb-8 px-4 z-10">
              <div className="text-center flex-1">
                <div className="text-xl font-bold text-white font-display">{Math.floor((profile?.score || 0) / 1000) + 1}</div>
                <div className="text-[9px] text-text-muted uppercase mt-1 tracking-widest font-black">Lvl</div>
              </div>
              <div className="w-px h-8 bg-white/5"></div>
              <div className="text-center flex-1">
                <div className="text-xl font-bold text-white font-display">
                  {/* Placeholder for badges count until we mock or have relation */}
                  {Object.keys(profile?.certifications || {}).length + 3}
                </div>
                <div className="text-[9px] text-text-muted uppercase mt-1 tracking-widest font-black">Badges</div>
              </div>
            </div>

            <Link to="/settings" className="w-full py-3.5 rounded-xl border border-white/5 bg-white/5 text-text-muted hover:text-white hover:border-white/20 hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-[0.2em] text-center z-10">
              Tactical Analysis / Edit Profile
            </Link>
          </div>
        </div>

        {/* Leaderboard Summary */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Leaderboard</h3>
            <Link to="/leaderboard" className="text-[10px] border border-[#333] px-3 py-1.5 rounded-full text-text-muted hover:text-white flex items-center gap-1 transition-colors hover:bg-white/5">
              View All <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
            </Link>
          </div>

          <div className="bg-bg-card rounded-[2rem] p-5 pr-3 border border-[#2a2a2c] shadow-card flex gap-3 h-[280px]">
            <div className="flex-1 space-y-5 overflow-y-auto pr-2 py-2 custom-scrollbar">
              {MOCK_LEADERBOARD.map((user, i) => (
                <div key={user.username} className="flex items-center gap-3 group cursor-pointer">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-cover bg-center border-2 border-accent-purple/30 group-hover:border-accent-purple transition-all" style={{ backgroundImage: `url(${user.avatar})` }}></div>
                    {i === 0 && (
                      <div className="absolute -top-1 -right-1 bg-yellow-500 text-[#111] rounded-full p-0.5 border border-bg-card">
                        <span className="material-symbols-outlined text-[8px] font-bold block">crown</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-[11px] font-black text-white group-hover:text-accent-purple transition-colors italic uppercase truncate">{user.username}</h5>
                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-tighter">Rank #{user.rank} • {user.score} XP</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="w-1.5 h-full bg-[#111] rounded-full relative overflow-hidden shrink-0">
              <div className="absolute top-0 w-full h-1/2 bg-accent-purple rounded-full shadow-glow"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
