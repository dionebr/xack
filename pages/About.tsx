
import React, { useState, useEffect, useRef } from 'react';
import { ASSETS } from '../constants';

const About: React.FC = () => {
  const [terminalText, setTerminalText] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  const commands = [
    { cmd: "whoami", output: "Founder | Cyber Security Architect | CEO" },
    { cmd: "cat about.txt", output: "Passionate about building secure systems through a balanced approach of offense and defense. Post-graduate in Offensive Cybersecurity (ACADI-TI). Dedicated to advancing the field of cybersecurity through education, platform development, and practical research." },
    { cmd: "ls -la ./certs/", output: "-rw-r--r-- 1 root root CNSE (Network Security Expert)\n-rw-r--r-- 1 root root CSAE (Security Architect)\n-rw-r--r-- 1 root root CEH v12 (Ethical Hacker)\n-rw-r--r-- 1 root root CPTE (Pen Testing)" }
  ];

  useEffect(() => {
    let currentCommandIndex = 0;
    let charIndex = 0;
    let isTyping = true;

    const type = () => {
      if (currentCommandIndex >= commands.length) return;

      const current = commands[currentCommandIndex];
      const cmdPrefix = `dione@xack ~ % `;

      if (isTyping) {
        const fullLine = cmdPrefix + current.cmd.slice(0, charIndex + 1);
        setTerminalText(prev => {
          const newArr = [...prev];
          if (charIndex === 0) {
            newArr.push(fullLine);
          } else {
            newArr[newArr.length - 1] = fullLine;
          }
          return newArr;
        });

        charIndex++;
        if (charIndex >= current.cmd.length) {
          isTyping = false;
          setTimeout(() => {
            setTerminalText(prev => [...prev, current.output]);
            currentCommandIndex++;
            charIndex = 0;
            isTyping = true;
            setTimeout(type, 1000);
          }, 500);
        } else {
          setTimeout(type, 50);
        }
      }
    };

    const timer = setTimeout(type, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalText]);

  return (
    <div className="max-w-[1400px] mx-auto py-6 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Left Column: Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-bg-card rounded-[2.5rem] p-10 flex flex-col items-center border border-white/5 shadow-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#2d6078]/10 blur-[80px] rounded-full"></div>

            {/* Avatar with Custom Instagram-style Ring Effect (#1c2f2d and #2d6078) */}
            <div className="relative mb-12 group cursor-pointer">
              {/* Outer Outer Glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#1c2f2d] to-[#2d6078] rounded-full blur-2xl opacity-10 group-hover:opacity-30 transition-opacity"></div>

              {/* The "Instagram" Ring - Larger and more prominent */}
              <div className="w-48 h-48 rounded-full p-[4px] bg-gradient-to-tr from-[#1c2f2d] to-[#2d6078] relative z-10">
                {/* The "Gap" effect */}
                <div className="w-full h-full rounded-full p-1.5 bg-bg-card">
                  {/* The actual image container */}
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/5">
                    <img
                      src={ASSETS.creatorPortrait}
                      alt="Profile"
                      className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* "Active" indicator with custom color */}
              <div className="absolute bottom-2 right-4 w-8 h-8 bg-[#2d6078] border-4 border-bg-card rounded-full flex items-center justify-center shadow-glow z-20">
                <span className="material-symbols-outlined text-white text-[14px] font-black">verified</span>
              </div>
            </div>

            <div className="text-center space-y-2 mb-10 relative z-10">
              <h1 className="text-5xl font-display font-black text-white italic tracking-tighter uppercase leading-tight">Dione<br />Lima</h1>
              <div className="text-[#2d6078] font-black text-[10px] uppercase tracking-[0.3em] font-display mb-2">Founder & CEO</div>
              <div className="text-text-muted text-[11px] font-medium tracking-wide">Cyber Security Architect</div>
            </div>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-2 rounded-full mb-12 relative z-10">
              <span className="material-symbols-outlined text-[#2d6078] text-lg">location_on</span>
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">São Paulo, Brazil</span>
            </div>

            <div className="w-full flex items-center justify-between px-4 mb-12 border-t border-b border-white/5 py-8 relative z-10">
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-white tracking-tighter italic leading-none">500+</div>
                <div className="text-[9px] text-text-muted uppercase tracking-widest mt-1 font-black">Connections</div>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-white tracking-tighter italic leading-none">1.5k+</div>
                <div className="text-[9px] text-text-muted uppercase tracking-widest mt-1 font-black">Followers</div>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-4 relative z-10">
              <button className="py-3.5 rounded-2xl bg-[#0077b5]/10 border border-[#0077b5]/30 text-[#0077b5] text-[10px] font-black uppercase tracking-widest hover:bg-[#0077b5] hover:text-white transition-all">LinkedIn</button>
              <button className="py-3.5 rounded-2xl bg-[#e4405f]/10 border border-[#e4405f]/30 text-[#e4405f] text-[10px] font-black uppercase tracking-widest hover:bg-[#e4405f] hover:text-white transition-all">Instagram</button>
            </div>
          </div>

          <div className="bg-bg-card rounded-[2.5rem] p-10 border border-white/5 shadow-card">
            <h3 className="text-xs font-black text-white mb-8 uppercase tracking-[0.25em] flex items-center gap-3">
              <span className="material-symbols-outlined text-[#2d6078] text-lg">code</span>
              Core Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Linux / Unix', 'Firewalls', 'Offensive Security', 'Penetration Testing', 'TCP/IP', 'Cloud Security', 'DevSecOps', 'Python'].map(skill => (
                <span key={skill} className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] text-text-muted hover:text-white hover:border-white/20 transition-all cursor-default uppercase font-bold tracking-wider">{skill}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Terminal & Content */}
        <div className="lg:col-span-8 space-y-10">

          {/* Animated Terminal */}
          <div className="bg-[#0a0a0b] rounded-3xl border border-white/10 shadow-2xl overflow-hidden group">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-status-red/60"></div>
                <div className="w-3 h-3 rounded-full bg-status-yellow/60"></div>
                <div className="w-3 h-3 rounded-full bg-status-green/60"></div>
              </div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">home</span>
                dione — -zsh — 80x24
              </div>
              <div className="w-10"></div>
            </div>
            <div
              ref={terminalRef}
              className="p-8 font-mono text-sm leading-relaxed h-[360px] overflow-y-auto custom-scrollbar bg-[#0d0e0f]/80 backdrop-blur-sm"
            >
              {terminalText.map((line, i) => (
                <div key={i} className={`mb-2 whitespace-pre-wrap ${line.startsWith('dione@') ? 'text-status-green' : 'text-text-muted opacity-80'}`}>
                  {line.startsWith('dione@') ? (
                    <>
                      <span className="text-status-green font-bold">dione@xack</span>
                      <span className="text-white mx-1">~</span>
                      <span className="text-accent-purple font-bold">%</span>
                      <span className="text-white ml-2">{line.split('%')[1]}</span>
                    </>
                  ) : line}
                </div>
              ))}
              <div className="w-2 h-5 bg-white/40 animate-pulse inline-block ml-1 align-middle"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h2 className="text-4xl font-display font-black text-white italic uppercase tracking-tighter">About</h2>
              <p className="text-text-muted text-base font-light leading-relaxed">
                With a deep foundation in network infrastructure and a specialized focus on offensive security, I architect platforms that challenge and educate the next generation of security professionals. My background includes rigorous academic study at <span className="text-white font-bold">ACADI-TI</span> and hands-on experience in penetrating complex environments to secure them better.
              </p>
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl font-display font-black text-white italic uppercase tracking-tighter">Philosophy</h2>
              <p className="text-text-muted text-base font-light leading-relaxed">
                Security is not a product, but a process. I believe in <span className="text-[#2d6078] font-bold">"Security by Design"</span> and the importance of understanding the attacker's mindset. At XACK, we don't just simulate attacks; we build resilience by exposing weaknesses in controlled environments.
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-white/5"></div>

          <div className="space-y-8">
            <h2 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="w-8 h-px bg-accent-purple"></span>
              Certifications & Achievements
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'CNSE', desc: 'Expert' },
                { name: 'CSAE', desc: 'Architect' },
                { name: 'CEH v12', desc: 'Ethical Hacker' },
                { name: 'CPTE', desc: 'Pen Testing' }
              ].map(cert => (
                <div key={cert.name} className="p-6 rounded-[1.5rem] bg-bg-card border border-white/5 hover:border-[#2d6078]/30 transition-all group flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-text-muted group-hover:text-[#2d6078]">workspace_premium</span>
                  </div>
                  <div className="text-white font-display font-bold uppercase tracking-widest">{cert.name}</div>
                  <div className="text-[9px] text-text-muted uppercase mt-1 tracking-tighter">{cert.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
