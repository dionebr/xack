
import React, { useState } from 'react';

const Cheats: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('Reconnaissance');
  const [activeCheat, setActiveCheat] = useState('Nmap Cheatsheet');

  const library = [
    {
      title: 'Reconnaissance',
      icon: 'personal_video',
      items: ['Nmap Cheatsheet', 'Subdomain Enum', 'Directory Brute'],
    },
    {
      title: 'Exploitation',
      icon: 'settings_input_component',
      items: ['Reverse Shells', 'Buffer Overflow', 'Web Attacks'],
    },
    {
      title: 'Privilege Esc.',
      icon: 'lock_open',
      items: ['Linux PrivEsc', 'Windows PrivEsc'],
    },
    {
      title: 'Cloud Security',
      icon: 'cloud',
      items: ['AWS Security', 'Azure Pentest'],
    },
    {
      title: 'Methodology',
      icon: 'menu_book',
      items: ['Report Writing', 'Pentest Lifecycle'],
    },
  ];

  const getCheatContent = () => {
    switch(activeCheat) {
      case 'Nmap Cheatsheet':
        return (
          <>
            <section id="basic-scanning" className="scroll-mt-24">
              <h2 className="text-2xl font-display font-bold text-white mb-6 tracking-wide italic uppercase">Basic Scanning Techniques</h2>
              <p className="text-text-muted text-sm mb-6 leading-relaxed font-light">
                The following are the most common scanning types used during initial reconnaissance phase.
              </p>
              
              <div className="bg-[#141516] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-black/20">
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em]">Target Specification</span>
                  <span className="text-[8px] font-black text-accent-cyan uppercase bg-accent-cyan/10 px-2 py-0.5 rounded border border-accent-cyan/20">BASH</span>
                </div>
                <div className="p-8 font-mono text-sm leading-relaxed overflow-x-auto space-y-2">
                  <div className="flex gap-4">
                    <span className="text-accent-purple font-bold">nmap</span>
                    <span className="text-green-400">192.168.1.1</span>
                    <span className="text-text-muted opacity-30 italic ml-auto"># Scan a single IP</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-accent-purple font-bold">nmap</span>
                    <span className="text-green-400">192.168.1.1-254</span>
                    <span className="text-text-muted opacity-30 italic ml-auto"># Scan a range</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-accent-purple font-bold">nmap</span>
                    <span className="text-pink-400">-iL</span>
                    <span className="text-green-400">targets.txt</span>
                    <span className="text-text-muted opacity-30 italic ml-auto"># Scan from list</span>
                  </div>
                </div>
              </div>
            </section>

            <section id="port-discovery" className="scroll-mt-24">
              <h2 className="text-2xl font-display font-bold text-white mb-6 tracking-wide italic uppercase">Port Discovery</h2>
              <p className="text-text-muted text-sm mb-6 leading-relaxed font-light">
                By default, Nmap scans the top 1000 most popular ports. Use these flags to modify behavior.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-6 p-4 rounded-xl border border-white/5 hover:bg-white/5 transition-all">
                   <span className="min-w-[70px] text-center px-3 py-1.5 rounded-lg bg-accent-purple/10 border border-accent-purple/20 text-accent-purple font-mono font-bold text-xs">-p-</span>
                   <span className="text-sm text-text-muted font-light">Scan all 65535 ports (Deep discovery).</span>
                </div>
                <div className="flex items-center gap-6 p-4 rounded-xl border border-white/5 hover:bg-white/5 transition-all">
                   <span className="min-w-[70px] text-center px-3 py-1.5 rounded-lg bg-accent-purple/10 border border-accent-purple/20 text-accent-purple font-mono font-bold text-xs">-p 80</span>
                   <span className="text-sm text-text-muted font-light">Scan specific port (e.g. 80, 443, 22).</span>
                </div>
                <div className="flex items-center gap-6 p-4 rounded-xl border border-white/5 hover:bg-white/5 transition-all">
                   <span className="min-w-[70px] text-center px-3 py-1.5 rounded-lg bg-accent-purple/10 border border-accent-purple/20 text-accent-purple font-mono font-bold text-xs">-F</span>
                   <span className="text-sm text-text-muted font-light">Fast scan (Top 100 ports).</span>
                </div>
              </div>
            </section>
          </>
        );
      case 'Subdomain Enum':
        return (
          <section id="subdomain" className="scroll-mt-24 animate-in fade-in duration-500">
             <h2 className="text-2xl font-display font-bold text-white mb-6 tracking-wide italic uppercase">Subdomain Enumeration</h2>
             <p className="text-text-muted text-sm mb-6 leading-relaxed font-light">Discovering hidden subdomains is the first step in expanding attack surface.</p>
             <div className="bg-[#141516] border border-white/5 rounded-2xl overflow-hidden mb-8">
                <div className="px-6 py-3 border-b border-white/5 bg-black/20 text-[9px] font-bold text-text-muted uppercase tracking-widest">Subfinder / Assetfinder</div>
                <div className="p-8 font-mono text-sm text-accent-purple space-y-2">
                   <div>subfinder -d example.com -o subs.txt</div>
                   <div className="text-text-muted opacity-40"># Aggregates results from multiple passive sources</div>
                </div>
             </div>
             <div className="bg-[#141516] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-3 border-b border-white/5 bg-black/20 text-[9px] font-bold text-text-muted uppercase tracking-widest">Amass</div>
                <div className="p-8 font-mono text-sm text-accent-purple space-y-2">
                   <div>amass enum -d example.com</div>
                   <div className="text-text-muted opacity-40"># Heavyweight reconnaissance tool</div>
                </div>
             </div>
          </section>
        );
      case 'Directory Brute':
        return (
          <section id="dir-brute" className="scroll-mt-24 animate-in fade-in duration-500">
             <h2 className="text-2xl font-display font-bold text-white mb-6 tracking-wide italic uppercase">Directory Brute Forcing</h2>
             <p className="text-text-muted text-sm mb-6 leading-relaxed font-light">Search for hidden files and directories on web servers using wordlists.</p>
             <div className="bg-[#141516] border border-white/5 rounded-2xl overflow-hidden mb-8">
                <div className="px-6 py-3 border-b border-white/5 bg-black/20 text-[9px] font-bold text-text-muted uppercase tracking-widest">ffuf (Fuzz Faster U Fool)</div>
                <div className="p-8 font-mono text-sm text-accent-purple space-y-2">
                   <div>ffuf -u http://TARGET/FUZZ -w /wordlist.txt</div>
                </div>
             </div>
             <div className="bg-[#141516] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-3 border-b border-white/5 bg-black/20 text-[9px] font-bold text-text-muted uppercase tracking-widest">GoBuster</div>
                <div className="p-8 font-mono text-sm text-accent-purple space-y-2">
                   <div>gobuster dir -u http://TARGET -w /wordlist.txt</div>
                </div>
             </div>
          </section>
        );
      default:
        return <p className="text-text-muted italic">Intelligence report coming soon...</p>;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-10 pt-6 h-full">
      
      {/* Center Content Column */}
      <div className="col-span-12 lg:col-span-8 space-y-10">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-[0.15em]">
          <span className="hover:text-white cursor-pointer transition-colors">Library</span>
          <span className="material-symbols-outlined text-[10px] opacity-40">chevron_right</span>
          <span className="hover:text-white cursor-pointer transition-colors opacity-60">{activeCategory}</span>
          <span className="material-symbols-outlined text-[10px] opacity-40">chevron_right</span>
          <span className="text-accent-purple italic font-bold">{activeCheat}</span>
        </nav>

        {/* Article Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-6">
            <h1 className="text-5xl font-display font-black text-white italic tracking-tight leading-tight uppercase">
              {activeCheat.split(' ')[0]} <br/>
              <span className="text-white opacity-80">{activeCheat.split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="text-lg text-text-muted leading-relaxed font-light max-w-2xl border-l border-white/10 pl-8">
              Intelligence summary for offensive operations involving {activeCheat.split(' ')[0]}. Reference these flags and methodologies during active engagements.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="w-11 h-11 rounded-xl bg-bg-card border border-white/5 flex items-center justify-center text-text-muted hover:text-white transition-all hover:border-white/20">
               <span className="material-symbols-outlined text-lg">link</span>
            </button>
            <button className="w-11 h-11 rounded-xl bg-bg-card border border-white/5 flex items-center justify-center text-text-muted hover:text-white transition-all hover:border-white/20">
               <span className="material-symbols-outlined text-lg">edit</span>
            </button>
          </div>
        </div>

        <div className="h-px w-full bg-white/5"></div>

        {/* Article Sections */}
        <article className="space-y-16 pb-20">
           {getCheatContent()}
        </article>
      </div>

      {/* Right Navigation & Library Column */}
      <aside className="col-span-12 lg:col-span-4 space-y-10 pb-10">
        
        {/* Library Widget */}
        <div className="bg-bg-card rounded-[2.5rem] border border-white/5 p-8 shadow-card relative overflow-hidden">
          <div className="flex items-center gap-3 mb-8 pl-1">
            <span className="material-symbols-outlined text-lg text-text-muted opacity-40">library_books</span>
            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Repository Explorer</h3>
          </div>
          
          <div className="space-y-3">
            {library.map((category) => (
              <div key={category.title} className="space-y-1">
                <button 
                  onClick={() => setActiveCategory(category.title)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all ${activeCategory === category.title ? 'bg-white/5 text-white' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`material-symbols-outlined text-lg ${activeCategory === category.title ? 'text-accent-purple' : 'opacity-20'}`}>{category.icon}</span>
                    <span className="text-[11px] font-black uppercase tracking-[0.15em] italic font-display">{category.title}</span>
                  </div>
                  <span className={`material-symbols-outlined text-xs transition-transform ${activeCategory === category.title ? 'rotate-180' : 'opacity-20'}`}>expand_more</span>
                </button>
                
                {activeCategory === category.title && (
                  <div className="ml-8 my-2 space-y-1 border-l border-white/5">
                    {category.items.map((item) => (
                      <button 
                        key={item}
                        onClick={() => setActiveCheat(item)}
                        className={`w-full text-left py-2.5 px-6 text-[10px] font-bold uppercase tracking-widest transition-all relative ${activeCheat === item ? 'text-accent-purple bg-accent-purple/5 border-l-2 border-accent-purple' : 'text-text-muted hover:text-white'}`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* On This Page Widget */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-3">
            <span className="material-symbols-outlined text-lg text-text-muted opacity-40">list_alt</span>
            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Navigator</h3>
          </div>
          <div className="space-y-5 ml-4">
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-1 h-6 bg-accent-purple"></div>
              <span className="text-[11px] font-black text-white uppercase tracking-wider italic font-display">Overview</span>
            </div>
            <div className="pl-5 space-y-5 border-l border-white/5 ml-[1px]">
              <button className="block text-[10px] font-bold text-text-muted hover:text-white transition-all uppercase tracking-widest text-left">Advanced Usage</button>
              <button className="block text-[10px] font-bold text-text-muted hover:text-white transition-all uppercase tracking-widest text-left">Case Studies</button>
              <button className="block text-[10px] font-bold text-text-muted hover:text-white transition-all uppercase tracking-widest text-left">Known Exploits</button>
            </div>
          </div>
        </div>

        {/* Contribute Box - Dashboard Style */}
        <div className="bg-bg-card rounded-[2.5rem] border border-white/5 p-8 shadow-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/5 blur-3xl rounded-full"></div>
          <div className="relative z-10">
            <h4 className="text-xs font-black text-white mb-3 uppercase italic tracking-widest">SUBMIT INTEL</h4>
            <p className="text-[10px] text-text-muted leading-relaxed mb-6 font-light opacity-60">Help the collective by contributing new findings or methodology updates to the repository.</p>
            <button className="w-full py-4 rounded-2xl bg-bg-main border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:border-white/30 transition-all flex items-center justify-center gap-3">
              <span className="material-symbols-outlined text-sm">code</span>
              Fork Repository
            </button>
          </div>
        </div>

      </aside>
    </div>
  );
};

export default Cheats;
