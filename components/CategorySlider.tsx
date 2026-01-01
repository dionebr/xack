
import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CATEGORIES = [
    'All',
    'Web',
    'Crypto',
    'Reverse',
    'Pwn',
    'Forensics',
    'OSINT',
    'Stego',
    'Mobile',
    'Cloud',
    'DevOps',
    'Malware',
    'Network',
    'Active Directory'
];

interface CategorySliderProps {
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

const CategorySlider: React.FC<CategorySliderProps> = ({ selectedCategory, onSelectCategory }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to selected item if needed could be added here

    return (
        <div className="sticky top-4 z-30 w-full mb-8 group bg-[#0a0a0b]/80 backdrop-blur-xl border border-white/5 rounded-full shadow-2xl">
            <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#0a0a0b] to-transparent z-10 pointer-events-none rounded-l-full" />
            <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#0a0a0b] to-transparent z-10 pointer-events-none rounded-r-full" />

            <div
                ref={scrollRef}
                className="flex overflow-x-auto gap-4 py-4 px-4 scrollbar-hide snap-x"
                style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
            >
                {CATEGORIES.map((cat) => {
                    const isActive = selectedCategory.toLowerCase() === cat.toLowerCase() || (selectedCategory === '' && cat === 'All');

                    return (
                        <button
                            key={cat}
                            onClick={() => onSelectCategory(cat === 'All' ? '' : cat)}
                            className={`
                            relative px-6 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-300
                            snap-center shrink-0 border border-transparent
                            ${isActive
                                    ? 'bg-accent-purple/20 text-accent-cyan border-accent-purple/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white hover:border-white/20'
                                }
                        `}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeCategory"
                                    className="absolute inset-0 rounded-full bg-accent-purple/10"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 uppercase">{cat}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CategorySlider;
