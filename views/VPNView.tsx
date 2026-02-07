
import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';

const VPNView: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="grid grid-cols-12 gap-8">
        {/* Status Panel */}
        <div className="col-span-12 lg:col-span-4">
          <div className="glass rounded-[2rem] p-8 h-full flex flex-col justify-between border border-white/5 shadow-2xl">
            <div>
              <h2 className="text-sm font-black text-white mb-10 flex items-center gap-3 uppercase tracking-widest">
                <span className="material-icons-round text-primary text-lg">sensors</span>
                {t('vpn_status')}
              </h2>
              
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-32 h-32 rounded-full bg-slate-900 flex items-center justify-center mb-8 relative">
                  <div className="w-4 h-4 rounded-full bg-slate-600 animate-pulse"></div>
                  <div className="absolute inset-0 border-4 border-slate-800 border-dashed rounded-full animate-[spin_15s_linear_infinite] opacity-30"></div>
                  <span className="material-symbols-outlined absolute text-5xl text-slate-700">link_off</span>
                </div>
                <span className="text-3xl font-black text-slate-600 uppercase tracking-[0.2em] font-display">{t('vpn_disconnected')}</span>
                <p className="text-[10px] font-bold text-slate-500 mt-4 text-center max-w-[220px] uppercase tracking-widest leading-relaxed">
                  {t('vpn_desc')}
                </p>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 mb-2 block">{t('vpn_interface')}</label>
              <p className="font-mono text-sm text-slate-500">tun0 — Not Available</p>
            </div>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="col-span-12 lg:col-span-8">
          <div className="glass rounded-[2rem] p-10 border border-white/5 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
              <div>
                <h2 className="text-3xl font-display font-black text-white tracking-tight mb-2">{t('vpn_config')}</h2>
                <p className="text-sm font-medium text-slate-500">{t('vpn_region')}</p>
              </div>
              <div className="relative group">
                <button className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-slate-950 border border-white/10 hover:border-primary transition-all shadow-xl">
                  <span className="text-base">🇺🇸</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">US - EAST</span>
                  <span className="material-icons-round text-slate-500">expand_more</span>
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="p-8 rounded-3xl bg-primary/5 border border-primary/20 group hover:bg-primary/10 transition-all cursor-pointer">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white mb-6 shadow-xl shadow-primary/20">
                  <span className="material-icons-round text-3xl">file_download</span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">{t('vpn_download_pack')}</h3>
                <p className="text-[10px] font-bold text-slate-500 mb-6 uppercase tracking-widest leading-relaxed">{t('vpn_ovpn_desc')}</p>
                <button className="w-full py-4 bg-primary hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-primary/10">
                  xack_cyberghost.ovpn
                  <span className="material-icons-round text-sm">download</span>
                </button>
              </div>

              <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/5">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mb-6 shadow-xl">
                  <span className="material-icons-round text-3xl">vpn_key</span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">{t('vpn_access_key')}</h3>
                <p className="text-[10px] font-bold text-slate-500 mb-6 uppercase tracking-widest leading-relaxed">{t('vpn_token_desc')}</p>
                <div className="flex items-center justify-between p-4 bg-slate-950/80 border border-white/5 rounded-xl group shadow-inner">
                  <span className="font-mono text-xs text-primary font-bold tracking-widest">A82J-7L91-P0X3-99V2</span>
                  <button className="text-slate-600 hover:text-primary transition-colors">
                    <span className="material-icons-round text-lg">content_copy</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">{t('vpn_guide')}</h3>
              <div className="space-y-8">
                <div className="flex gap-6 items-start">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0 border border-white/5">1</div>
                  <div>
                    <p className="text-sm font-black text-white mb-1">{t('vpn_step1_title')}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">{t('vpn_step1_desc')}</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0 border border-white/5">2</div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-white mb-1">{t('vpn_step2_title')}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 leading-relaxed">{t('vpn_step2_desc')}</p>
                    <div className="p-5 bg-slate-950 rounded-2xl border border-white/5 font-mono text-sm text-accent flex justify-between items-center group shadow-inner">
                      <span className="tracking-tighter italic">sudo openvpn xack_cyberghost.ovpn</span>
                      <span className="material-symbols-outlined text-slate-700 group-hover:text-accent transition-colors">terminal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VPNView;
