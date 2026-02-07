
import React from 'react';
import { BADGES_DATA } from '../constants';

const ProfileView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Page Heading */}
      <div className="flex items-center justify-between mb-8 px-2">
        <h2 className="text-3xl font-display font-black text-white tracking-tight">Operative Settings</h2>
        <div className="flex gap-4">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent"></span>
            Profile Verified
          </span>
        </div>
      </div>

      {/* Badges Matrix - NEW HIGH FIDELITY SECTION */}
      <section className="glass rounded-[2.5rem] p-10 border border-white/5 shadow-2xl bg-primary/5">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Badge Matrix</h3>
            <p className="text-xs font-medium text-slate-500 tracking-tight">Your lifetime achievements and recognized pwnage.</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-display font-black text-primary italic tracking-tighter">4 / 128</p>
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Unlocked Medals</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BADGES_DATA.map((badge) => (
            <div key={badge.id} className="relative group perspective">
              <div className={`p-6 rounded-[2rem] border transition-all duration-500 transform-gpu flex flex-col items-center text-center h-full ${
                badge.unlockedAt 
                  ? 'bg-slate-900/80 border-white/10 shadow-2xl group-hover:scale-105 group-hover:-translate-y-2' 
                  : 'bg-black/20 border-white/5 opacity-40 grayscale pointer-events-none'
              }`}>
                {/* 3D Medal Effect */}
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 relative shadow-inner ${
                  badge.rarity === 'Legendary' ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                  badge.rarity === 'Epic' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' :
                  badge.rarity === 'Rare' ? 'bg-gradient-to-br from-slate-200 to-slate-400' :
                  'bg-gradient-to-br from-slate-700 to-slate-900'
                }`}>
                  <div className="absolute inset-2 border-2 border-white/20 rounded-full border-dashed animate-[spin_10s_linear_infinite]"></div>
                  <span className="material-symbols-outlined text-4xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                    {badge.icon}
                  </span>
                  
                  {/* Glow Effect */}
                  {badge.unlockedAt && (
                    <div className={`absolute -inset-1 rounded-full blur-xl opacity-20 ${
                      badge.rarity === 'Legendary' ? 'bg-amber-400' :
                      badge.rarity === 'Epic' ? 'bg-indigo-500' : 'bg-white'
                    }`}></div>
                  )}
                </div>

                <h4 className="text-xs font-black text-white uppercase tracking-widest mb-2">{badge.name}</h4>
                <p className="text-[9px] text-slate-500 leading-relaxed font-medium mb-4 line-clamp-2">{badge.description}</p>
                
                {badge.unlockedAt && (
                  <p className="text-[8px] font-mono text-primary/60 uppercase mt-auto">Captured {badge.unlockedAt}</p>
                )}
              </div>
              
              {/* Rarity Tag */}
              {badge.unlockedAt && (
                <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter shadow-xl z-20 ${
                  badge.rarity === 'Legendary' ? 'bg-amber-400 text-black' :
                  badge.rarity === 'Epic' ? 'bg-indigo-600 text-white' :
                  'bg-slate-700 text-slate-300'
                }`}>
                  {badge.rarity}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Public Profile Section */}
      <section className="glass rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Public Profile</h3>
            <p className="text-xs font-medium text-slate-500 tracking-tight">Manage how you appear to others on the platform.</p>
          </div>
          <button className="px-8 py-3 bg-primary hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all">Save Changes</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-slate-900 shadow-2xl relative">
                <img src="https://picsum.photos/seed/user/200/200" alt="Avatar" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="material-icons-round text-white">photo_camera</span>
                </div>
              </div>
              <button className="absolute -bottom-3 -right-3 p-3 bg-primary text-white rounded-2xl shadow-2xl hover:scale-110 transition-transform">
                <span className="material-icons-round text-lg">edit</span>
              </button>
            </div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Operative ID</p>
          </div>

          <div className="md:col-span-3 space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Display Name</label>
                <input className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary/50 text-white shadow-inner" type="text" defaultValue="CyberGhost" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Bio / Mission Directive</label>
                <textarea className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-sm font-medium min-h-[120px] resize-none focus:ring-2 focus:ring-primary/50 text-white shadow-inner" placeholder="Explain your hacking methodology..." defaultValue="Security enthusiast and CTF player. Passionate about web exploitation and reverse engineering. Always searching for the next zero-day." />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Account Security Section */}
      <section className="glass rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-8">Security Matrix</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] flex flex-col justify-between group hover:bg-white/[0.04] transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <span className="material-icons-round text-amber-500 text-2xl">lock</span>
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-widest">Authentication</h4>
                <p className="text-[10px] font-medium text-slate-500 tracking-tight">Last changed 42 days ago</p>
              </div>
            </div>
            <button className="w-full py-3.5 bg-slate-900 border border-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-white hover:border-primary transition-all">Reset Password</button>
          </div>

          <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] flex flex-col justify-between group hover:bg-white/[0.04] transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
                  <span className="material-icons-round text-accent text-2xl">verified_user</span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-widest">Two-Factor Auth</h4>
                  <p className="text-[10px] font-medium text-slate-500 tracking-tight">Enhanced protection active</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-[9px] font-black uppercase tracking-widest border border-accent/20">Enabled</span>
            </div>
            <button className="w-full py-3.5 bg-slate-900 border border-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-white hover:border-primary transition-all">Manage MFA</button>
          </div>
        </div>
      </section>

      {/* Preferences Section */}
      <section className="glass rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-10">Interface Preferences</h3>
        
        <div className="space-y-12">
          <div>
            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-6 ml-1">UI Visual Mode</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { name: 'Light Node', icon: 'light_mode', desc: 'Standard visibility' },
                { name: 'Dark Void', icon: 'dark_mode', desc: 'Optimal contrast', active: true },
                { name: 'Ghost Protocol', icon: 'grid_3x3', desc: 'High saturation' }
              ].map((theme, i) => (
                <button key={i} className={`flex flex-col items-center gap-5 p-6 rounded-[2rem] border-2 transition-all group ${theme.active ? 'border-primary bg-primary/5 shadow-2xl' : 'border-white/5 hover:border-primary/40 hover:bg-white/5'}`}>
                  <div className={`w-full aspect-video rounded-2xl flex items-center justify-center shadow-inner ${theme.active ? 'bg-slate-900' : 'bg-slate-950'}`}>
                    <span className={`material-icons-round text-3xl ${theme.active ? 'text-primary' : 'text-slate-700'} group-hover:scale-110 transition-transform`}>{theme.icon}</span>
                  </div>
                  <div className="text-center">
                    <p className={`text-xs font-black uppercase tracking-widest mb-1 ${theme.active ? 'text-white' : 'text-slate-500'}`}>{theme.name}</p>
                    <p className="text-[10px] font-medium text-slate-600 italic tracking-tight">{theme.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-10 border-t border-white/5">
            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-8 ml-1">Mission Alerts</label>
            <div className="space-y-6">
              {[
                { label: 'Secure Email Notifications', desc: 'Receive alerts about machine releases and team events.', active: true },
                { label: 'Real-time Browser Push', desc: 'Immediate feedback for flag captures and rank changes.', active: false }
              ].map((opt, i) => (
                <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                  <div>
                    <p className="text-sm font-bold text-white tracking-tight">{opt.label}</p>
                    <p className="text-[11px] font-medium text-slate-600 mt-1">{opt.desc}</p>
                  </div>
                  <button className={`w-14 h-8 rounded-full relative transition-all shadow-inner border border-white/5 ${opt.active ? 'bg-primary' : 'bg-slate-900'}`}>
                    <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-xl ${opt.active ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfileView;
