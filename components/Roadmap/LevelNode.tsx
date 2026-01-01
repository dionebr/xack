import React from 'react';
import { Database } from '../../database.types';

type Level = Database['public']['Tables']['roadmap_levels']['Row'];

interface LevelNodeProps {
    level: Level;
    isLocked: boolean;
    isCompleted: boolean;
    isActive: boolean;
    progress: number;
    onClick: (level: Level) => void;
    index: number;
}

export const LevelNode: React.FC<LevelNodeProps> = ({
    level,
    isLocked,
    isCompleted,
    isActive,
    progress,
    onClick,
    index
}) => {
    // Hacky dynamic positioning/snake layout logic could go into the parent, 
    // but here we focus on the node design itself.

    return (
        <div
            className={`relative group flex flex-col items-center justify-center cursor-pointer transition-all duration-500
        ${isLocked ? 'grayscale opacity-50' : 'opacity-100'}
        ${isActive ? 'scale-110' : 'hover:scale-105'}
      `}
            onClick={() => !isLocked && onClick(level)}
        >
            {/* Connector Line (Top) - logic handled by parent grid usually, or pseudoelements */}

            {/* Node Circle */}
            <div
                className={`w-24 h-24 rounded-full flex items-center justify-center border-2 overflow-hidden relative
          ${isCompleted ? 'border-accent-green bg-accent-green/10 box-shadow-green' : 'bg-bg-card'}
          ${isActive ? 'border-white animate-pulse-slow shadow-glow' : 'border-white/10'}
          ${isLocked ? 'border-white/5 bg-black/20' : ''}
        `}
                style={{ borderColor: !isLocked && !isCompleted ? level.color || '#fff' : undefined }}
            >
                {/* Background Glow */}
                {isActive && (
                    <div className="absolute inset-0 bg-white/10 blur-xl rounded-full"></div>
                )}

                {/* Icon */}
                <span
                    className="material-symbols-outlined text-4xl z-10 transition-colors duration-300"
                    style={{ color: isCompleted ? '#22c55e' : (isLocked ? '#666' : level.color || '#fff') }}
                >
                    {isCompleted ? 'check_circle' : (isLocked ? 'lock' : level.icon)}
                </span>

                {/* Progress Ring (SVG) if active and not completed */}
                {!isCompleted && !isLocked && progress > 0 && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                            cx="50" cy="50" r="48"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeDasharray="301.59"
                            strokeDashoffset={301.59 * (1 - progress / 100)}
                            className="text-white/30 transition-all duration-1000 ease-out"
                        />
                    </svg>
                )}
            </div>

            {/* Label */}
            <div className={`mt-4 text-center max-w-[200px] transition-all duration-300 ${isActive ? 'translate-y-0' : 'translate-y-2'}`}>
                <h4
                    className="text-lg font-display font-black uppercase tracking-tighter"
                    style={{ color: isLocked ? '#666' : '#fff' }}
                >
                    {level.title}
                </h4>
                {isActive && (
                    <p className="text-[10px] text-accent-cyan font-mono mt-1 animate-fadeIn">
                        &gt; CURRENT OBJECTIVE
                    </p>
                )}
            </div>
        </div>
    );
};
