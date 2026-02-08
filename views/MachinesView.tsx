
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Difficulty, Machine } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { api } from '../api';

const MachinesView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  // Filter states
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedOS, setSelectedOS] = useState<string[]>([]);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
  const [showOSDropdown, setShowOSDropdown] = useState(false);

  const difficultyRef = useRef<HTMLDivElement>(null);
  const osRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const data = await api.get('/api/machines');
        setMachines(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch machines:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMachines();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (difficultyRef.current && !difficultyRef.current.contains(event.target as Node)) {
        setShowDifficultyDropdown(false);
      }
      if (osRef.current && !osRef.current.contains(event.target as Node)) {
        setShowOSDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredMachines = machines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = selectedDifficulties.length === 0 || selectedDifficulties.includes(m.difficulty);
    const matchesOS = selectedOS.length === 0 || selectedOS.includes(m.os);
    return matchesSearch && matchesDifficulty && matchesOS;
  });

  const toggleDifficulty = (difficulty: string) => {
    setSelectedDifficulties(prev =>
      prev.includes(difficulty) ? prev.filter(d => d !== difficulty) : [...prev, difficulty]
    );
  };

  const toggleOS = (os: string) => {
    setSelectedOS(prev =>
      prev.includes(os) ? prev.filter(o => o !== os) : [...prev, os]
    );
  };

  const clearFilters = () => {
    setSelectedDifficulties([]);
    setSelectedOS([]);
    setSearch('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative w-full max-w-xl">
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-primary/60">search</span>
          <input
            type="text"
            placeholder={t('mach_search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-900/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-white placeholder-slate-600 glass transition-all"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Difficulty Filter */}
          <div className="relative" ref={difficultyRef}>
            <button
              onClick={() => setShowDifficultyDropdown(!showDifficultyDropdown)}
              className="flex items-center gap-3 glass border-white/5 px-6 py-3.5 rounded-2xl hover:border-primary transition-all group"
            >
              <span className="material-icons-round text-slate-500 group-hover:text-primary">equalizer</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">{t('gen_difficulty')}</span>
              {selectedDifficulties.length > 0 && (
                <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">{selectedDifficulties.length}</span>
              )}
              <span className="material-icons-round text-sm text-slate-600">expand_more</span>
            </button>

            {showDifficultyDropdown && (
              <div className="absolute top-full mt-2 left-0 w-48 glass border border-white/10 rounded-2xl p-4 shadow-2xl z-50">
                {['Easy', 'Medium', 'Hard'].map(diff => (
                  <label key={diff} className="flex items-center gap-3 py-2 cursor-pointer hover:text-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedDifficulties.includes(diff)}
                      onChange={() => toggleDifficulty(diff)}
                      className="w-4 h-4 rounded border-white/20 bg-slate-900 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{diff}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* OS Filter */}
          <div className="relative" ref={osRef}>
            <button
              onClick={() => setShowOSDropdown(!showOSDropdown)}
              className="flex items-center gap-3 glass border-white/5 px-6 py-3.5 rounded-2xl hover:border-primary transition-all group"
            >
              <span className="material-icons-round text-slate-500 group-hover:text-primary">devices</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">{t('gen_os')}</span>
              {selectedOS.length > 0 && (
                <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">{selectedOS.length}</span>
              )}
              <span className="material-icons-round text-sm text-slate-600">expand_more</span>
            </button>

            {showOSDropdown && (
              <div className="absolute top-full mt-2 left-0 w-48 glass border border-white/10 rounded-2xl p-4 shadow-2xl z-50">
                {['Linux', 'Windows'].map(os => (
                  <label key={os} className="flex items-center gap-3 py-2 cursor-pointer hover:text-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedOS.includes(os)}
                      onChange={() => toggleOS(os)}
                      className="w-4 h-4 rounded border-white/20 bg-slate-900 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{os}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="p-4 rounded-2xl glass border-white/5 text-slate-500 hover:text-white hover:border-primary transition-all shadow-xl"
            title="Clear all filters"
          >
            <span className="material-icons-round">filter_list_off</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredMachines.map(machine => (
          <Link
            key={machine.id}
            to={`/machines/${machine.id}`}
            className="group glass rounded-[2.5rem] overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-2 shadow-2xl relative"
          >
            {/* Top Banner & Avatar Overlay */}
            <div className="h-44 relative bg-slate-950">
              <img src={machine.image_url || `https://picsum.photos/seed/${machine.name}/600/300`} className="w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-1000" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/20 to-transparent"></div>

              {/* Difficulty Badge */}
              <div className="absolute top-5 left-5">
                <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] border shadow-2xl ${machine.difficulty === Difficulty.EASY ? 'bg-accent/10 text-accent border-accent/20' :
                  machine.difficulty === Difficulty.MEDIUM ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                  {machine.difficulty}
                </span>
              </div>

              {/* Centered Large Avatar Overlay */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                <div className={`w-20 h-20 rounded-full border-4 p-0.5 bg-slate-950 shadow-2xl transition-all duration-500 group-hover:scale-110 ${machine.difficulty === Difficulty.EASY ? 'border-accent/40 shadow-accent/20' :
                  machine.difficulty === Difficulty.MEDIUM ? 'border-amber-400/40 shadow-amber-500/20' :
                    'border-red-500/40 shadow-red-500/20'
                  }`}>
                  <img src={machine.image_url || `https://picsum.photos/seed/${machine.name}/200/200`} className="w-full h-full object-cover rounded-full" alt="" />
                </div>
              </div>
            </div>

            <div className="p-8 pt-12 flex-1 flex flex-col text-center">
              <div className="mb-6">
                <h3 className="text-2xl font-display font-extrabold text-white mb-1 tracking-tight">{machine.name}</h3>
                <div className="flex items-center justify-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  <span className="material-icons-round text-sm">
                    {machine.os === 'Windows' ? 'laptop_windows' : 'terminal'}
                  </span>
                  <span>{machine.os}</span>
                </div>
              </div>

              {/* Stats Block */}
              <div className="grid grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden mb-8 border border-white/5">
                <div className="p-4 bg-background-dark/40">
                  <p className={`font-black text-lg ${machine.progress === 100 ? 'text-accent' : 'text-primary'}`}>{machine.xp_reward}</p>
                  <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">{t('mach_total_xp')}</p>
                </div>
                <div className="p-4 bg-background-dark/40">
                  <p className="text-slate-200 font-black text-lg">{machine.solves}</p>
                  <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">{t('mach_solves')}</p>
                </div>
              </div>

              {/* Progress & Actions */}
              <div className="mt-auto space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('mach_progression')}</span>
                    <span className={`text-[10px] font-black ${machine.progress === 100 ? 'text-accent' : 'text-primary'}`}>{machine.progress || 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${machine.progress === 100 ? 'bg-accent' : 'bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]'}`}
                      style={{ width: `${machine.progress || 0}%` }}
                    ></div>
                  </div>
                </div>

                <button className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300 ${machine.progress === 100
                  ? 'bg-white/[0.03] border border-white/10 text-white hover:bg-white/10'
                  : 'bg-primary text-white shadow-xl shadow-primary/20 hover:bg-indigo-600 hover:shadow-primary/40'
                  }`}>
                  {machine.progress && machine.progress > 0 ? (machine.progress === 100 ? t('mach_view_report') : t('mach_continue')) : t('mach_deploy')}
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MachinesView;
