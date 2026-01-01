import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { api } from '../services/api';
import { ASSETS } from '../constants'; // Fallback assets
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { PoCQuestionsInline } from '../components/PoCQuestionsInline';
import { BreachSuccess } from '../components/NetworkMap';
import { ShareChallenge } from '../components/ShareChallenge';
import { useTranslation } from '../context/TranslationContext';
import { useLocalizedPath } from '../utils/navigation';
import WalkthroughModal from '../components/WalkthroughModal';

const MachineDetail: React.FC = () => {
  const { t } = useTranslation();
  const getPath = useLocalizedPath();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [machine, setMachine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showWalkthroughModal, setShowWalkthroughModal] = useState(false);
  const [reportStatus, setReportStatus] = useState<'none' | 'draft' | 'pending' | 'approved' | 'rejected'>('none');

  const [status, setStatus] = useState<'OFFLINE' | 'STARTING' | 'ONLINE' | 'STOPPING' | 'RESETTING'>('OFFLINE');
  const [targetIP, setTargetIP] = useState<string | null>(null);
  const [targetPort, setTargetPort] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const { profile } = useAuth();
  const [timer, setTimer] = useState(0);
  const [userFlagFound, setUserFlagFound] = useState(false);
  const [rootFlagFound, setRootFlagFound] = useState(false);
  const [unlockedHints, setUnlockedHints] = useState<string[]>([]);
  // Start locked unless explicitly easy or user previously unlocked (needs persistence later, simplified for now)
  const [surfaceUnlocked, setSurfaceUnlocked] = useState(false);
  const [showNetworkMap, setShowNetworkMap] = useState(false);
  const [showUnlockPrompt, setShowUnlockPrompt] = useState(false);
  const [pocAttempts, setPocAttempts] = useState(0);
  const [pocStartTime, setPocStartTime] = useState<number>(Date.now());
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
        // Use translated description if available and language is PT
        overview: (t('machines.title') === 'LABORATÓRIOS DE DESAFIO' && data.description_pt)
          ? data.description_pt
          : data.description,
        attackSurface: data.config?.attackSurface || "Encrypted",
        learningGoals: data.config?.learningGoals || "TBD",
        prerequisites: data.config?.prerequisites || "None",
        toolsAllowed: data.config?.toolsAllowed || "nmap",
        hintsPolicy: " Standard",
        os: data.type === 'docker' ? 'Linux' : 'Windows'
      };

      setMachine(parsedMachine);
      // Logic for pre-unlocking can go here if we persist 'surface_unlocked' in DB
      setSurfaceUnlocked(parsedMachine.difficulty === 'easy');

      // CHECK SOLVE STATUS
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        // Check if user has already captured the root flag
        const { data: solves } = await supabase
          .from('solves')
          .select('*')
          .eq('user_id', userData.user.id)
          .eq('challenge_id', id)
          .eq('flag_type', 'root');

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

  // Polling Effect for Async Startup
  useEffect(() => {
    let pollInterval: any;

    if (status === 'STARTING' && userId && machine) {
      pollInterval = setInterval(async () => {
        const { data } = await supabase
          .from('active_instances')
          .select('*')
          .eq('user_id', userId)
          .eq('challenge_id', machine.id)
          .single();

        if (data && data.status === 'running') {
          setTargetIP(data.ip_address);
          setTargetPort(machine.internal_port || '80');
          setStatus('ONLINE');
          clearInterval(pollInterval);
          toast.success(t('machineDetail.machineOnline') || 'Machine is Online!');
        }
      }, 3000); // Check every 3 seconds
    }

    return () => clearInterval(pollInterval);
  }, [status, userId, machine]);

  useEffect(() => {
    const checkReportStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !id) return;

      const { data } = await supabase.from('reports').select('status').eq('user_id', user.id).eq('machine_id', id).single();
      if (data) {
        setReportStatus(data.status as any);
      } else {
        // Check for local draft
        if (localStorage.getItem(`xack_report_${id}`)) {
          setReportStatus('draft');
        }
      }
    }
    checkReportStatus();
  }, [id, showWalkthroughModal]);

  const handleAction = async (type: 'START' | 'STOP' | 'RESET') => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) { // Fixed auth check
      toast.error(t('machineDetail.authRequired'));
      navigate(getPath('login'));
      return;
    }

    if (type === 'START') {
      // ⚠️ VM WARNING as requested by user
      if (machine.type === 'vm' || machine.os === 'Windows') {
        toast.info(t('machineDetail.vmWarningTitle') || '⚠️ Launching Virtual Machine', {
          description: t('machineDetail.vmWarningDesc') || 'This environment runs on full Windows VMs. Boot time may take 3-5 minutes. Please be patient while we provision the infrastructure.',
          duration: 10000, // 10 seconds
        });
      }

      setStatus('STARTING');
      try {
        const res = await api.startMachine(machine.id, userId);

        // Async Boot Support
        if (res.status === 'starting') {
          // Do not set ONLINE yet. Let the useEffect polling handle it.
          // We stay in STARTING state.
          console.log("Async boot initiated, waiting for polling...");
        } else {
          // Legacy Docker (Immediate)
          setTargetIP(res.ip);
          setTargetPort(res.port);
          setStatus('ONLINE');
        }

      } catch (e: any) {
        console.error(e);
        if (e.response && e.response.status === 503) {
          alert("⚠️ DOCKER ERROR: " + e.response.data.details);
        } else {
          alert(t('machineDetail.failedStart'));
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
      // RESET LOGIC
      setStatus('RESETTING');
      try {
        // 1. Call Hard Reset (Vagrant Destroy)
        await api.resetMachine(machine.id, userId);

        toast.info("Reseting environment factory defaults...", { duration: 3000 });

        // 2. Wait a bit and Start again
        setTimeout(async () => {
          const res = await api.startMachine(machine.id, userId);

          if (res.status === 'starting') {
            console.log("Async boot initiated after reset...");
          } else {
            setTargetIP(res.ip);
            setTargetPort(res.port);
            setStatus('ONLINE');
          }
        }, 5000); // Give it some time to clear
      } catch (e) {
        console.error("Reset Failed", e);
        toast.error("Failed to reset machine");
        setStatus('OFFLINE');
      }
    }
  };

  const handleUnlockSuccess = () => {
    setShowNetworkMap(true);
    // Surface will unlock after network map animation completes
  };

  const corePorts = [21, 22, 25, 53, 80, 443, 3306, 8080, 8888];

  if (loading) return <div className="text-white p-20 text-center animate-pulse">{t('machineDetail.loading')}</div>;
  if (!machine) return <div className="text-red-500 p-20 text-center">{t('machineDetail.notFound')}</div>;

  return (
    <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-8 pb-20 pt-4 relative">

      {/* 1. OVERVIEW & HEADER (Hero Area) */}
      <div className="col-span-12 bg-bg-card/40 border border-white/5 rounded-[3rem] p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[600px] h-full bg-accent-purple/5 blur-[120px] rounded-full group-hover:bg-accent-purple/10 transition-all duration-700"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-10">
          <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full tracking-widest ${machine.difficulty === 'hard' ? 'bg-status-red/20 text-status-red' : machine.difficulty === 'medium' ? 'bg-status-yellow/20 text-status-yellow' : 'bg-status-green/20 text-status-green'}`}>
                {t(`machines.difficulty.${machine.difficulty}`)} {t('machineDetail.mission')}
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
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{t('machineDetail.difficultyGauge')}</span>
                <span className="text-accent-purple font-mono font-bold">{machine.difficulty === 'hard' ? '90%' : machine.difficulty === 'medium' ? '60%' : '20%'}</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-accent-purple shadow-glow transition-all duration-1000" style={{ width: machine.difficulty === 'hard' ? '90%' : machine.difficulty === 'medium' ? '60%' : '20%' }}></div>
              </div>
            </div>
            <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
              <div className="flex justify-between items-center mb-4 gap-4">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{t('machineDetail.estTime')}</span>
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
            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">{t('machineDetail.objectives')}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-2xl border transition-all flex items-center justify-between ${userFlagFound ? 'bg-status-green/10 border-status-green/20' : 'bg-white/5 border-white/5'}`}>
              <div className="space-y-1">
                <div className={`text-[11px] font-black uppercase tracking-widest ${userFlagFound ? 'text-status-green' : 'text-white'}`}>{t('machineDetail.userCompromise')}</div>
                <div className="text-[9px] text-text-muted uppercase font-bold tracking-tighter">{t('machineDetail.userDesc')}</div>
              </div>
              <span className={`material-symbols-outlined ${userFlagFound ? 'text-status-green' : 'text-white/10'}`}>{userFlagFound ? 'check_circle' : 'radio_button_unchecked'}</span>
            </div>
            <div className={`p-6 rounded-2xl border transition-all flex items-center justify-between ${rootFlagFound ? 'bg-accent-purple/10 border-accent-purple/20' : 'bg-white/5 border-white/5'}`}>
              <div className="space-y-1">
                <div className={`text-[11px] font-black uppercase tracking-widest ${rootFlagFound ? 'text-accent-purple' : 'text-white'}`}>{t('machineDetail.rootEscalation')}</div>
                <div className="text-[9px] text-text-muted uppercase font-bold tracking-tighter">{t('machineDetail.rootDesc')}</div>
              </div>
              <span className={`material-symbols-outlined ${rootFlagFound ? 'text-accent-purple' : 'text-white/10'}`}>{rootFlagFound ? 'verified' : 'radio_button_unchecked'}</span>
            </div>
          </div>
        </div>

        {/* 3. ATTACK SURFACE */}
        <div className="bg-bg-card p-10 rounded-[3rem] border border-white/5 space-y-8 overflow-hidden relative">
          <div className="flex items-center justify-between relative z-20">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-accent-cyan">radar</span>
              <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">{t('machineDetail.attackSurface')}</h3>
            </div>
            {status === 'ONLINE' && surfaceUnlocked && <span className="text-[9px] font-bold text-accent-cyan animate-pulse">{t('machineDetail.scanningLive')}</span>}
          </div>

          {/* Show PoC Questions or Breach Success */}
          {!surfaceUnlocked && !showNetworkMap ? (
            <PoCQuestionsInline
              challengeId={machine.id}
              onUnlock={handleUnlockSuccess}
            />
          ) : !surfaceUnlocked && showNetworkMap ? (
            <BreachSuccess
              timeTaken={Math.floor((Date.now() - pocStartTime) / 1000)}
              attempts={pocAttempts}
              onComplete={() => {
                setShowNetworkMap(false);
                setSurfaceUnlocked(true);
              }}
            />
          ) : (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-status-green mb-4 block">check_circle</span>
              <h3 className="text-xl font-bold text-white mb-2">Attack Surface Unlocked</h3>
              <p className="text-sm text-text-muted">You can now proceed with exploitation</p>
            </div>
          )}

        </div>

      </div>

      {/* RIGHT COLUMN: MISSION CONTROL */}
      <div className="col-span-12 lg:col-span-4 space-y-6">

        {/* 9. ENVIRONMENT INFO */}
        <div className="bg-bg-card rounded-[2.5rem] p-8 border border-white/5 shadow-card sticky top-24">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">{t('machineDetail.missionControl')}</h3>
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
                disabled={false}
                className="w-full py-5 bg-status-green hover:bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-50"
              >
                <span className="material-symbols-outlined">power_settings_new</span> {t('machineDetail.initEnv')}
              </button>
            ) : status === 'ONLINE' ? (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleAction('STOP')} className="py-4 bg-status-red/10 border border-status-red/30 text-status-red rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-status-red hover:text-white transition-all">{t('machineDetail.terminate')}</button>
                <button onClick={() => handleAction('RESET')} className="py-4 bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-accent-cyan hover:text-white transition-all">{t('machineDetail.reload')}</button>
              </div>
            ) : (
              <div className="w-full py-5 bg-white/5 border border-white/10 text-white/40 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 animate-pulse">
                <span className="material-symbols-outlined animate-spin">sync</span> {status === 'STARTING' ? t('machineDetail.booting') : t('machineDetail.syncing')}
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
                <span className="text-[9px] text-text-muted font-bold uppercase tracking-widest">{t('machineDetail.targetIp')}</span>
                <span className="text-xl font-mono text-white select-all">{targetIP}<span className="text-accent-purple text-sm">:{targetPort}</span></span>
              </div>
              <div className="p-4 rounded-xl bg-bg-main border border-white/5 flex justify-between items-center">
                {userId ? (
                  <a href={`http://localhost:3001/api/vpn/config?userId=${userId}`} target="_blank" rel="noreferrer" className="text-[9px] text-status-green font-black uppercase tracking-widest flex items-center gap-1 hover:underline">
                    <span className="material-symbols-outlined text-sm">download</span> {t('machineDetail.downloadVpn')}
                  </a>
                ) : (
                  <span className="text-[9px] text-white/20 font-black uppercase tracking-widest flex items-center gap-1">
                    {t('machineDetail.loginVpn')}
                  </span>
                )}
              </div>

              {/* WRITE REPORT BUTTON - ALWAYS AVAILABLE */}
              <div
                className={`p-4 rounded-xl border transition-all duration-300 group cursor-pointer
                    ${reportStatus === 'approved' ? 'bg-green-500/10 border-green-500/20 hover:bg-green-500/20 border-l-4 border-l-green-500' :
                    reportStatus === 'pending' ? 'bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20 border-l-4 border-l-yellow-500' :
                      'bg-white/5 border-white/5 hover:bg-white/10 border-l-4 border-l-accent-cyan'}
                `}
                onClick={() => setShowWalkthroughModal(true)}
              >
                <div className="flex flex-col">
                  <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors
                      ${reportStatus === 'approved' ? 'text-green-400' : reportStatus === 'pending' ? 'text-yellow-400' : 'text-white group-hover:text-accent-cyan'}
                  `}>
                    <span className="material-symbols-outlined text-sm">
                      {reportStatus === 'approved' ? 'verified' : reportStatus === 'pending' ? 'hourglass_top' : 'description'}
                    </span>
                    {reportStatus === 'approved' ? 'Verified Writeup' : reportStatus === 'pending' ? 'Submission Pending' : t('machineDetail.writeReport') || 'Write Report'}
                  </span>
                  <span className="text-[8px] text-text-muted font-medium tracking-wider mt-1 ml-6">
                    {reportStatus === 'approved' ? 'Access your official certified report' : reportStatus === 'pending' ? 'Under review by command' : 'Document your findings'}
                  </span>
                </div>
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
                    // window.open(`#${getPath(`machines/${machine.id}/report`)}`, '_blank');
                    setShowWalkthroughModal(true);
                  } else {
                    toast.error(t('machineDetail.missionIncomplete'));
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
                    {t('machineDetail.officialWriteup')}
                  </span>
                  {!rootFlagFound && (
                    <span className="text-[8px] text-red-500 font-bold uppercase tracking-wider mt-1 ml-6">
                            // ACCESS DENIED
                    </span>
                  )}
                </div>

                {rootFlagFound && (
                  <span className="bg-accent-purple/20 text-accent-purple px-2 py-0.5 rounded text-[8px] font-bold uppercase">
                    {t('machineDetail.accessGranted')}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-white/5">
            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-6">{t('machineDetail.exfiltrateFlag')}</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!flagInput) return;

              const toastId = toast.loading(t('machineDetail.verifying'));

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

                  // COIN REWARD SYSTEM
                  let reward = 0;
                  // Map legacy types and new dynamic types
                  if (res.type === 'user' || res.type === 'flag1') reward = 20;
                  else if (res.type === 'root' || res.type === 'flag5') reward = 50;
                  else if (res.type.startsWith('flag')) reward = 30; // Intermediate flags

                  if (reward > 0) {
                    // Add coins
                    const currentCoins = profile?.coins || 0;
                    await supabase.from('profiles').update({ coins: currentCoins + reward }).eq('id', userId);

                    // Log transaction
                    await supabase.from('coin_transactions').insert({
                      user_id: userId,
                      amount: reward,
                      type: 'MACHINE_SOLVE',
                      description: `Captured ${res.type.toUpperCase()} flag on ${machine.name}`
                    });

                    toast.success(`+${reward} ${t('machineDetail.coinsEarned')}!`);
                  }

                  if (res.type === 'user' || res.type === 'flag1') setUserFlagFound(true);
                  if (res.type === 'root' || res.type === 'flag5') setRootFlagFound(true);
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
                  className="w-full bg-bg-main border border-white/10 text-white rounded-xl py-4 pl-12 pr-4 font-mono text-sm uppercase placeholder:text-white focus:border-accent-purple transition-all"
                  placeholder="XACK{...}"
                />
              </div>
              <button disabled={status !== 'ONLINE'} className="w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all bg-white text-black hover:bg-accent-purple hover:text-white disabled:opacity-50">
                {t('machineDetail.submitCapture')}
              </button>
            </form>
          </div>
        </div>
      </div>

      <WalkthroughModal
        isOpen={showWalkthroughModal}
        onClose={() => setShowWalkthroughModal(false)}
        machine={machine}
      />
    </div>
  );
};

export default MachineDetail;
