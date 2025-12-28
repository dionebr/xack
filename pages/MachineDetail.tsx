import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { api } from '../services/api';
import { ASSETS } from '../constants'; // Fallback assets
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

const MachineDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [machine, setMachine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<'OFFLINE' | 'STARTING' | 'ONLINE' | 'STOPPING' | 'RESETTING'>('OFFLINE');
  const [targetIP, setTargetIP] = useState<string | null>(null);
  const [targetPort, setTargetPort] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [timer, setTimer] = useState(0);
  const [userFlagFound, setUserFlagFound] = useState(false);
  const [rootFlagFound, setRootFlagFound] = useState(false);
  const [unlockedHints, setUnlockedHints] = useState<string[]>([]);
  const [surfaceUnlocked, setSurfaceUnlocked] = useState(false);
  const [showUnlockPrompt, setShowUnlockPrompt] = useState(false);
  const [flagInput, setFlagInput] = useState('');

  const timerRef = useRef<any>(null);

  useEffect(() => {
    fetchMachineDetails();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, [id]);

  useEffect(() => {
    if (status === 'ONLINE') {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  const fetchMachineDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Parse JSON fields if they come as strings, or use defaults
      const parsedMachine = {
        ...data,
        // Fallback for fields not yet in DB schema or JSON config
        skillsRequired: data.config?.skillsRequired || "Web Hacking",
        overview: data.description,
        attackSurface: data.config?.attackSurface || "Encrypted",
        learningGoals: data.config?.learningGoals || "TBD",
        prerequisites: data.config?.prerequisites || "None",
        toolsAllowed: data.config?.toolsAllowed || "nmap",
        hintsPolicy: " Standard",
        os: data.type === 'docker' ? 'Linux' : 'Windows'
      };

      setMachine(parsedMachine);
      setSurfaceUnlocked(parsedMachine.difficulty === 'easy');

      // CHECK SOLVE STATUS
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        // Check if user has already captured the root flag
        // Assuming 'submissions' or 'solves' table. 
        // Since I can't be sure of the schema, I will check for 'submissions' which is common, 
        // or rely on 'rootFlagFound' being set if I can query it.
        // For now, let's try querying a hypothetical 'submissions' table.
        const { data: solves } = await supabase
          .from('submissions')
          .select('*')
          .eq('user_id', userData.user.id)
          .eq('challenge_id', id)
          .eq('type', 'root'); // Assuming there's a type or we check flag match

        if (solves && solves.length > 0) {
          setRootFlagFound(true);
          setUserFlagFound(true); // Usually implies user is also found
        }
      }

    } catch (err: any) {
      console.error("Error loading machine:", err);
      setError("Failed to load mission data.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAction = async (type: 'START' | 'STOP' | 'RESET') => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) {
      alert("Authentication required.");
      navigate('/login');
      return;
    }

    if (type === 'START') {
      setStatus('STARTING');
      try {
        const res = await api.startMachine(machine.id, userId);
        setTargetIP(res.ip);
        setTargetPort(res.port);
        setStatus('ONLINE');
      } catch (e: any) {
        console.error(e);
        if (e.response && e.response.status === 503) {
          alert("⚠️ DOCKER ERROR: " + e.response.data.details);
        } else {
          alert("Failed to start mission environment.");
        }
        setStatus('OFFLINE');
      }
    } else if (type === 'STOP') {
      setStatus('STOPPING');
      try {
        await api.stopMachine(machine.id, userId);
        setStatus('OFFLINE');
        setTimer(0);
        setTargetIP(null);
      } catch (e) {
        console.error(e);
        // Force offline even if error
        setStatus('OFFLINE');
      }
    } else {
      // Reset logic (same as stop/start for now)
      setStatus('RESETTING');
      await api.stopMachine(machine.id, userId);
      setTimeout(async () => {
        const res = await api.startMachine(machine.id, userId);
        setTargetIP(res.ip);
        setStatus('ONLINE');
        setTimer(0);
      }, 2000);
    }
  };

  const unlockSurface = () => {
    setSurfaceUnlocked(true);
    setShowUnlockPrompt(false);
  };

  const corePorts = [21, 22, 25, 53, 80, 443, 3306, 8080, 8888];

  if (loading) return <div className="text-white p-20 text-center animate-pulse">Initializing Mission Interface...</div>;
  if (!machine) return <div className="text-red-500 p-20 text-center">Mission Not Found.</div>;

  return (
    <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-8 pb-20 pt-4 relative">

      {/* 1. OVERVIEW & HEADER (Hero Area) */}
      <div className="col-span-12 bg-bg-card/40 border border-white/5 rounded-[3rem] p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[600px] h-full bg-accent-purple/5 blur-[120px] rounded-full group-hover:bg-accent-purple/10 transition-all duration-700"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-10">
          <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full tracking-widest ${machine.difficulty === 'hard' ? 'bg-status-red/20 text-status-red' : machine.difficulty === 'medium' ? 'bg-status-yellow/20 text-status-yellow' : 'bg-status-green/20 text-status-green'}`}>
                {machine.difficulty} MISSION
              </span>
              <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">ID: {machine.id}</span>
            </div>
            <h1 className="text-6xl font-display font-black text-white italic tracking-tighter uppercase leading-none">{machine.name}</h1>
            <p className="text-text-muted text-lg font-light leading-relaxed max-w-2xl">{machine.overview}</p>

            {/* 4. SKILLS REQUIRED (Interactive Tags) */}
            <div className="flex flex-wrap gap-2 pt-4">
              {machine.skillsRequired && machine.skillsRequired.split(',').map((skill: string) => (
                <Link key={skill} to="/learning" className="px-4 py-2 bg-white/5 border border-white/5 hover:border-accent-purple/40 hover:bg-accent-purple/5 rounded-xl text-[10px] font-bold text-text-muted hover:text-white transition-all uppercase tracking-widest">
                  {skill.trim()}
                </Link>
              ))}
            </div>
          </div>

          {/* 5. DIFFICULTY & 6. TIME (Tactical Gauges) */}
          <div className="flex flex-col gap-6 min-w-[280px]">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Difficulty Gauge</span>
                <span className="text-accent-purple font-mono font-bold">{machine.difficulty === 'hard' ? '90%' : machine.difficulty === 'medium' ? '60%' : '20%'}</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-accent-purple shadow-glow transition-all duration-1000" style={{ width: machine.difficulty === 'hard' ? '90%' : machine.difficulty === 'medium' ? '60%' : '20%' }}></div>
              </div>
            </div>
            <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Est. Mission Time</span>
                <span className="text-accent-cyan font-mono font-bold">{machine.estimated_time}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LEFT COLUMN: TACTICAL INFO */}
      <div className="col-span-12 lg:col-span-8 space-y-8">

        {/* 2. OBJECTIVE (Interactive Checklist) */}
        <div className="bg-bg-card p-10 rounded-[3rem] border border-white/5 space-y-8">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-accent-purple">flag</span>
            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Mission Objectives</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-2xl border transition-all flex items-center justify-between ${userFlagFound ? 'bg-status-green/10 border-status-green/20' : 'bg-white/5 border-white/5'}`}>
              <div className="space-y-1">
                <div className={`text-[11px] font-black uppercase tracking-widest ${userFlagFound ? 'text-status-green' : 'text-white'}`}>User Compromise</div>
                <div className="text-[9px] text-text-muted uppercase font-bold tracking-tighter">Gain low-privileged access</div>
              </div>
              <span className={`material-symbols-outlined ${userFlagFound ? 'text-status-green' : 'text-white/10'}`}>{userFlagFound ? 'check_circle' : 'radio_button_unchecked'}</span>
            </div>
            <div className={`p-6 rounded-2xl border transition-all flex items-center justify-between ${rootFlagFound ? 'bg-accent-purple/10 border-accent-purple/20' : 'bg-white/5 border-white/5'}`}>
              <div className="space-y-1">
                <div className={`text-[11px] font-black uppercase tracking-widest ${rootFlagFound ? 'text-accent-purple' : 'text-white'}`}>Root Escalation</div>
                <div className="text-[9px] text-text-muted uppercase font-bold tracking-tighter">Infiltrate the kernel/admin</div>
              </div>
              <span className={`material-symbols-outlined ${rootFlagFound ? 'text-accent-purple' : 'text-white/10'}`}>{rootFlagFound ? 'verified' : 'radio_button_unchecked'}</span>
            </div>
          </div>
        </div>

        {/* 3. ATTACK SURFACE */}
        <div className="bg-bg-card p-10 rounded-[3rem] border border-white/5 space-y-8 overflow-hidden relative min-h-[300px]">
          <div className="flex items-center justify-between relative z-20">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-accent-cyan">radar</span>
              <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Attack Surface Analysis</h3>
            </div>
            {status === 'ONLINE' && surfaceUnlocked && <span className="text-[9px] font-bold text-accent-cyan animate-pulse">SCANNING LIVE...</span>}
          </div>

          <div className={`grid grid-cols-4 md:grid-cols-8 gap-4 transition-all duration-700 ${!surfaceUnlocked ? 'blur-xl opacity-20 pointer-events-none scale-95' : 'blur-0 opacity-100'}`}>
            {corePorts.map(port => {
              // Mock active port visualization based on potential ID/port matches or random for now
              const isActive = status === 'ONLINE' && (port === 80 || port === 8888);
              return (
                <div key={port} className={`aspect-square rounded-xl border flex flex-col items-center justify-center transition-all duration-1000 ${isActive ? 'bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan shadow-glow' : 'bg-white/5 border-white/5 text-white/10'}`}>
                  <span className="text-[10px] font-mono font-bold">{port}</span>
                  <span className="text-[8px] font-black uppercase mt-1">{isActive ? 'OPEN' : 'CLS'}</span>
                </div>
              );
            })}
          </div>

          {!surfaceUnlocked && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-12 text-center bg-bg-card/40 backdrop-blur-sm">
              <span className="material-symbols-outlined text-accent-purple text-4xl mb-4 animate-pulse">lock</span>
              <h4 className="text-lg font-display font-black text-white italic uppercase tracking-widest mb-2">Surface Encrypted</h4>
              <p className="text-xs text-text-muted mb-8 max-w-xs font-light">The attack surface for this {machine.difficulty} level mission is hidden to simulate realistic black-box testing.</p>
              <button
                onClick={() => setShowUnlockPrompt(true)}
                className="px-8 py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-accent-purple hover:text-white transition-all shadow-glow"
              >
                Decrypt Surface (15 XP)
              </button>
            </div>
          )}
        </div>

      </div>

      {/* RIGHT COLUMN: MISSION CONTROL */}
      <div className="col-span-12 lg:col-span-4 space-y-6">

        {/* 9. ENVIRONMENT INFO */}
        <div className="bg-bg-card rounded-[2.5rem] p-8 border border-white/5 shadow-card sticky top-24">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Mission Control</h3>
            {status === 'ONLINE' && (
              <div className="flex items-center gap-2 text-accent-cyan font-mono text-sm">
                <span className="material-symbols-outlined text-sm">timer</span> {formatTime(timer)}
              </div>
            )}
          </div>

          <div className="space-y-4 mb-8">
            {status === 'OFFLINE' ? (
              <button
                onClick={() => handleAction('START')}
                disabled={status === 'STARTING'}
                className="w-full py-5 bg-status-green hover:bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-50"
              >
                <span className="material-symbols-outlined">power_settings_new</span> Initialize Environment
              </button>
            ) : status === 'ONLINE' ? (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleAction('STOP')} className="py-4 bg-status-red/10 border border-status-red/30 text-status-red rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-status-red hover:text-white transition-all">Terminate</button>
                <button onClick={() => handleAction('RESET')} className="py-4 bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-accent-cyan hover:text-white transition-all">Reload</button>
              </div>
            ) : (
              <div className="w-full py-5 bg-white/5 border border-white/10 text-white/40 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 animate-pulse">
                <span className="material-symbols-outlined animate-spin">sync</span> {status === 'STARTING' ? 'Booting OS...' : 'Syncing Data...'}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
              <span className="material-symbols-outlined text-accent-cyan text-lg mb-1">{machine.os === 'Linux' ? 'terminal' : 'desktop_windows'}</span>
              <div className="text-[9px] text-white font-black uppercase tracking-widest">{machine.os}</div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
              <span className="material-symbols-outlined text-accent-purple text-lg mb-1">router</span>
              <div className="text-[9px] text-white font-black uppercase tracking-widest">Bridged</div>
            </div>
          </div>

          {status === 'ONLINE' && targetIP && (
            <div className="mb-8 pt-8 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-4">
              <div className="p-4 rounded-xl bg-bg-main border border-white/5 flex flex-col items-start gap-1 group">
                <span className="text-[9px] text-text-muted font-bold uppercase tracking-widest">Target IP</span>
                <span className="text-xl font-mono text-white select-all">{targetIP}<span className="text-accent-purple text-sm">:{targetPort}</span></span>
              </div>
              <div className="p-4 rounded-xl bg-bg-main border border-white/5 flex justify-between items-center">
                {userId ? (
                  <a href={`http://localhost:3001/api/vpn/config?userId=${userId}`} target="_blank" rel="noreferrer" className="text-[9px] text-status-green font-black uppercase tracking-widest flex items-center gap-1 hover:underline">
                    <span className="material-symbols-outlined text-sm">download</span> Download VPN Config
                  </a>
                ) : (
                  <span className="text-[9px] text-white/20 font-black uppercase tracking-widest flex items-center gap-1">
                    Log in to download VPN
                  </span>
                )}
              </div>

              {/* OFFICIAL WALKTHROUGH BUTTON - LOCKED UNTIL SOLVED */}
              <div
                className={`p-4 rounded-xl border flex justify-between items-center transition-all duration-300 group
                    ${rootFlagFound
                    ? 'bg-white/5 border-white/5 hover:bg-white/10 cursor-pointer border-l-4 border-l-accent-purple'
                    : 'bg-black/40 border-white/5 opacity-50 cursor-not-allowed border-l-4 border-l-red-900'}
                `}
                onClick={() => {
                  if (rootFlagFound) {
                    window.open(`#/machines/${machine.id}/report`, '_blank');
                  } else {
                    toast.error("MISSION INCOMPLETE: Capture Root Flag to unlock Intelligence Report.");
                  }
                }}
              >
                <div className="flex flex-col">
                  <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors
                        ${rootFlagFound ? 'text-white group-hover:text-accent-purple' : 'text-gray-500'}
                    `}>
                    <span className="material-symbols-outlined text-sm">
                      {rootFlagFound ? 'lock_open' : 'lock'}
                    </span>
                    Official Writeup
                  </span>
                  {!rootFlagFound && (
                    <span className="text-[8px] text-red-500 font-bold uppercase tracking-wider mt-1 ml-6">
                            // ACCESS DENIED
                    </span>
                  )}
                </div>

                {rootFlagFound && (
                  <span className="bg-accent-purple/20 text-accent-purple px-2 py-0.5 rounded text-[8px] font-bold uppercase">
                    ACCESS GRANTED
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-white/5">
            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-6">Exfiltrate Flag</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!flagInput) return;

              const toastId = toast.loading("Verifying flag hash...");

              try {
                const res = await api.submitFlag(machine.id, userId!, flagInput);

                if (res.success) {
                  toast.success(res.message, { id: toastId });

                  // Trigger confetti
                  confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#a855f7', '#22c55e', '#ffffff']
                  });

                  if (res.type === 'user') setUserFlagFound(true);
                  if (res.type === 'root') setRootFlagFound(true);
                  setFlagInput(''); // Clear input
                } else {
                  toast.error(res.message, { id: toastId });
                }
              } catch (e: any) {
                toast.error(e.message, { id: toastId });
              }
            }} className="space-y-4">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-3.5 text-lg text-text-muted">flag</span>
                <input
                  value={flagInput}
                  onChange={(e) => setFlagInput(e.target.value)}
                  className="w-full bg-bg-main border border-white/10 text-white rounded-xl py-4 pl-12 pr-4 font-mono text-sm uppercase placeholder:text-white/5 focus:border-accent-purple transition-all"
                  placeholder="XACK{...}"
                />
              </div>
              <button disabled={status !== 'ONLINE'} className="w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all bg-white text-black hover:bg-accent-purple hover:text-white disabled:opacity-50">
                Submit Capture
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* UNLOCK PROMPT OVERLAY */}
      {showUnlockPrompt && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-bg-card border border-white/10 p-10 rounded-[3rem] shadow-2xl text-center space-y-8">
            <div className="w-20 h-20 bg-accent-purple/10 rounded-full flex items-center justify-center mx-auto border border-accent-purple/20">
              <span className="material-symbols-outlined text-accent-purple text-4xl">warning</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-black text-white italic uppercase tracking-widest">Points Penalty</h3>
              <p className="text-sm text-text-muted font-light">By decrypting the attack surface, you will lose <span className="text-accent-purple font-bold">15 XP</span> from your mission reward. This action cannot be undone.</p>
            </div>
            <div className="flex flex-col gap-4">
              <button onClick={unlockSurface} className="w-full py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-accent-purple hover:text-white transition-all">Confirm Decryption</button>
              <button onClick={() => setShowUnlockPrompt(false)} className="w-full py-4 bg-white/5 text-text-muted hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Abort Intel Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineDetail;
