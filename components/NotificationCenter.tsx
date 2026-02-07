
import React from 'react';
import { NOTIFICATIONS_DATA } from '../constants';
import { NotificationType } from '../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative w-full max-w-md bg-[#0a0d1a] border-l border-white/5 h-full shadow-2xl flex flex-col animate-[slideIn_0.3s_ease-out]">
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">Mission Updates</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operator Monitoring System</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/10"
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          <div className="flex items-center justify-between px-2 mb-4">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Recent Activity</span>
            <button className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">Mark all as read</button>
          </div>

          {NOTIFICATIONS_DATA.map((notif) => (
            <div 
              key={notif.id}
              className={`group relative p-5 rounded-[1.5rem] border transition-all duration-300 ${
                notif.read 
                  ? 'bg-white/[0.02] border-white/5 opacity-60' 
                  : 'bg-white/[0.04] border-white/10 shadow-xl'
              }`}
            >
              {!notif.read && (
                <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(99,102,241,1)]"></div>
              )}

              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  notif.type === NotificationType.RANK ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                  notif.type === NotificationType.CHALLENGE ? 'bg-primary/10 border-primary/20 text-primary' :
                  notif.type === NotificationType.SOCIAL ? 'bg-accent/10 border-accent/20 text-accent' :
                  'bg-slate-500/10 border-slate-500/20 text-slate-400'
                }`}>
                  <span className="material-icons-round text-xl">
                    {notif.type === NotificationType.RANK ? 'trending_up' :
                     notif.type === NotificationType.CHALLENGE ? 'rocket_launch' :
                     notif.type === NotificationType.SOCIAL ? 'forum' : 'bolt'}
                  </span>
                </div>

                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-black text-white uppercase tracking-widest">{notif.title}</p>
                    <span className="text-[9px] font-mono text-slate-600 uppercase">{notif.time}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    {notif.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-slate-950/40">
          <button className="w-full py-4 rounded-xl border border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] hover:bg-white/5 hover:text-white transition-all">
            Clear Neural Cache
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
