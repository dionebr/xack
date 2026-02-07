import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OnboardingFlow: React.FC = () => {
  // Explicitly set step type to number to avoid literal type narrowing which causes overlap errors
  const [step, setStep] = useState<number>(1);
  const navigate = useNavigate();

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
    else navigate('/');
  };

  return (
    <div className="min-h-screen bg-background-dark text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="absolute top-10 left-10 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
          <span className="material-icons-round text-white text-2xl">terminal</span>
        </div>
        <h1 className="text-2xl font-display font-black tracking-tighter text-white uppercase italic">XACK</h1>
      </div>

      <main className="w-full max-w-5xl flex flex-col items-center gap-10">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Step 0{step} of 03</span>
          <div className="h-px w-12 bg-slate-800"></div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">{step === 1 ? 'Welcome' : step === 2 ? 'Security' : 'Mission'}</span>
        </div>

        <div className="glass rounded-[3rem] p-12 w-full flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden">
          {/* 
            Fix narrowing issues by using a nested ternary for mutually exclusive steps. 
            This ensures that TypeScript correctly identifies 'step' as being within the appropriate range 
            for each conditional branch.
          */}
          {step === 1 ? (
            <>
              <div className="w-full lg:w-1/2 flex justify-center">
                <div className="relative animate-pulse">
                  <img alt="Hacker" className="w-full max-w-[400px] drop-shadow-[0_0_50px_rgba(99,102,241,0.3)] rounded-3xl" src="https://picsum.photos/seed/lab/600/600" />
                  <div className="absolute -top-4 -right-4 glass px-4 py-2 rounded-lg text-[10px] font-mono text-accent">status: operational</div>
                </div>
              </div>
              <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left">
                <h2 className="text-6xl font-display font-black text-white leading-tight tracking-tighter">
                  Welcome to <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">The Lab.</span>
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed font-medium">
                  You've just stepped into the ultimate arena for cybersecurity excellence. XACK is where theory meets reality.
                </p>
                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div className="flex gap-4 items-start text-left">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-primary">psychology</span></div>
                    <div><h4 className="text-sm font-bold">Learn</h4><p className="text-[10px] text-slate-500">Guided paths for research.</p></div>
                  </div>
                  <div className="flex gap-4 items-start text-left">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-accent">trophy</span></div>
                    <div><h4 className="text-sm font-bold">Compete</h4><p className="text-[10px] text-slate-500">Global leaderboards.</p></div>
                  </div>
                </div>
              </div>
            </>
          ) : step === 2 ? (
            <>
              <div className="w-full lg:w-1/2 flex flex-col items-center">
                <div className="relative w-full aspect-square max-w-[300px] flex items-center justify-center">
                  <div className="absolute inset-0 border border-teal-500/20 rounded-full animate-ping"></div>
                  <div className="w-24 h-24 glass rounded-2xl flex items-center justify-center border-teal-500/50 shadow-[0_0_30px_rgba(45,212,191,0.3)]">
                    <span className="material-symbols-outlined text-teal-400 text-5xl">vpn_lock</span>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left">
                <h2 className="text-5xl font-display font-black text-white tracking-tighter">Secure Your <br/><span className="text-accent italic">Connection.</span></h2>
                <p className="text-slate-400 text-lg">Download your personalized OpenVPN configuration to access the target subnet.</p>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-accent/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center"><span className="material-icons-round text-slate-400">description</span></div>
                    <div className="text-left"><p className="text-xs font-bold">xack_lab_auth.ovpn</p><p className="text-[10px] text-slate-600 font-mono">Configuration File</p></div>
                  </div>
                  <span className="material-icons-round text-accent text-xl">download</span>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full text-center space-y-12">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/20 border border-primary/30 relative">
                <div className="absolute inset-0 rounded-full border border-primary/50 animate-ping opacity-25"></div>
                <span className="material-symbols-outlined text-primary text-5xl">task_alt</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-display font-black text-white tracking-tighter leading-none">
                READY FOR <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-accent italic">ACTION.</span>
              </h1>
              <p className="text-slate-400 text-xl max-w-2xl mx-auto font-light leading-relaxed">
                Identity verified. Connection secured. You have been granted <span className="text-accent font-mono">Level_01</span> status.
              </p>
            </div>
          )}
        </div>

        <div className="w-full flex items-center justify-between">
          <div className="w-32">
            {step > 1 && <button onClick={() => setStep(step - 1)} className="text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors">Back</button>}
          </div>
          <div className="flex gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-2 rounded-full transition-all duration-500 ${step === i ? 'w-10 bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'w-2 bg-slate-800'}`}></div>
            ))}
          </div>
          <div className="w-32 flex justify-end">
            <button onClick={nextStep} className="bg-primary hover:bg-indigo-600 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center gap-3 group uppercase tracking-widest text-[10px]">
              {step === 3 ? 'Start Hacking' : 'Next Step'}
              <span className="material-icons-round text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OnboardingFlow;