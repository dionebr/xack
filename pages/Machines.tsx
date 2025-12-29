
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { api } from '../services/api';
import CategorySlider from '../components/CategorySlider';
import ChallengeCardImage from '../components/ChallengeCardImage';
import { useLocalizedPath } from '../utils/navigation';

const Machines: React.FC = () => {
  const getPath = useLocalizedPath();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('points', { ascending: true }); // Sort by points nicely

      if (error) throw error;
      setMachines(data || []);
    } catch (error) {
      console.error('Error fetching machines:', error);
    } finally {
      setLoading(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');

  // Filter Logic
  const filteredMachines = machines.filter(m => {
    // Category Filter
    if (selectedCategory && m.category?.toLowerCase() !== selectedCategory.toLowerCase()) return false;

    // Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = m.name?.toLowerCase().includes(query);
      const matchDesc = m.description?.toLowerCase().includes(query);
      if (!matchName && !matchDesc) return false;
    }

    return true;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredMachines.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMachines = filteredMachines.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-xl font-display text-accent-purple animate-pulse">LOADING CHALLENGES...</div>
    </div>
  );

  return (
    <div className="max-w-[1800px] mx-auto flex flex-col gap-8 pb-20">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 tracking-tight mb-2 italic">
            CHALLENGE LABS
          </h1>
          <p className="text-text-muted text-sm uppercase tracking-widest font-mono">
            Access restricted environments. Hack responsibly.
          </p>
        </div>

        <div className="text-right hidden md:block">
          <div className="text-4xl font-mono font-bold text-accent-cyan">{machines.length}</div>
          <div className="text-[10px] uppercase tracking-widest text-text-muted">Total Targets</div>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="flex flex-col gap-6 sticky top-0 z-30 bg-[#0a0a0b]/95 backdrop-blur-xl py-6 -mx-4 px-4 border-b border-white/5 transition-all">

        {/* Search Input */}
        <div className="relative max-w-md w-full">
          <span className="material-symbols-outlined absolute left-4 top-3.5 text-text-muted">search</span>
          <input
            type="text"
            placeholder="Search challenges..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:border-accent-purple focus:bg-white/10 transition-all outline-none"
          />
        </div>

        <CategorySlider
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => { setSelectedCategory(cat); setCurrentPage(1); }}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {currentMachines.map((machine) => (
          <div key={machine.id} className="group bg-bg-card rounded-[2rem] border border-white/5 overflow-hidden hover:border-accent-purple/50 hover:shadow-[0_0_50px_rgba(139,92,246,0.15)] transition-all duration-500 hover:-translate-y-1 relative h-full flex flex-col">

            {/* Difficulty Badge */}
            <div className="absolute top-4 right-4 z-20">
              <div className={`
                 px-3 py-1.5 backdrop-blur-md border rounded-full flex items-center gap-2 font-mono text-[10px] uppercase font-bold tracking-wider
                 ${machine.difficulty === 'hard' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                  machine.difficulty === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                    'bg-green-500/10 border-green-500/20 text-green-500'}
               `}>
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${machine.difficulty === 'hard' ? 'bg-red-500' :
                  machine.difficulty === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} />
                {machine.difficulty}
              </div>
            </div>

            {/* Image Area */}
            <ChallengeCardImage
              machineId={machine.id}
              category={machine.category}
              className="h-56 bg-black/50"
            />

            {/* Content */}
            <div className="p-8 pt-2 flex-1 flex flex-col items-start gap-4">
              <div>
                <h3 className="text-2xl font-display font-black uppercase italic text-white group-hover:text-accent-purple transition-colors duration-300">
                  {machine.name}
                </h3>
              </div>

              <p className="text-sm text-text-muted leading-relaxed line-clamp-3 font-medium">
                {machine.description}
              </p>

              <div className="mt-auto pt-6 flex w-full items-center justify-between border-t border-white/5">
                <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
                  <span className="material-symbols-outlined text-base text-accent-purple">bolt</span>
                  {machine.points} PTS
                </div>

                <Link
                  to={getPath(`machines/${machine.id}`)}
                  className="flex items-center gap-2 text-white text-xs font-bold uppercase hover:gap-4 transition-all duration-300"
                >
                  Deploy <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMachines.length === 0 && (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/5">
          <span className="material-symbols-outlined text-6xl text-white/20 mb-4">search_off</span>
          <h3 className="text-xl font-bold text-white/40 uppercase">No Challenges Found</h3>
          <p className="text-sm text-white/20">Try selecting a different category.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12 bg-[#0a0a0b] p-4 rounded-full border border-white/5 w-fit mx-auto shadow-2xl">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>

          <div className="flex gap-2 font-mono text-sm px-4">
            <span className="text-accent-purple">{String(currentPage).padStart(2, '0')}</span>
            <span className="text-white/20">/</span>
            <span className="text-white/40">{String(totalPages).padStart(2, '0')}</span>
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Machines;
