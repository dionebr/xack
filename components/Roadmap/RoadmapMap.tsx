import React, { useEffect, useState } from 'react';
import { Database } from '../../database.types';
import { supabase } from '../../lib/supabase';
import { LevelNode } from './LevelNode';
import { ModuleDetail } from './ModuleDetail';

type Level = Database['public']['Tables']['roadmap_levels']['Row'];

export const RoadmapMap: React.FC = () => {
    const [levels, setLevels] = useState<Level[]>([]);
    const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

    // Hardcoded progress for now (would come from user_roadmap_progress joins ideally)
    const currentLevelIndex = 0;

    useEffect(() => {
        async function fetchLevels() {
            const { data } = await supabase
                .from('roadmap_levels')
                .select('*')
                .order('order_index');
            if (data) setLevels(data);
        }
        fetchLevels();
    }, []);

    return (
        <div className="relative py-20 min-h-[800px] flex justify-center">
            {/* Background Decorative Line */}
            <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent left-1/2 transform -translate-x-1/2 hidden md:block"></div>

            <div className="relative z-10 flex flex-col gap-24 md:gap-32 w-full max-w-2xl px-4">
                {levels.map((level, index) => {
                    // Basic logic for locked/active
                    const isLocked = index > currentLevelIndex;
                    const isCompleted = index < currentLevelIndex;
                    const isActive = index === currentLevelIndex;

                    return (
                        <div
                            key={level.id}
                            className={`flex w-full ${index % 2 === 0 ? 'justify-start md:justify-end' : 'justify-end md:justify-start'} md:translate-x-0 relative`}
                        >
                            {/* Mobile centering override implicitly via flex behavior if we want, but let's stick to zig-zag for desktop */}
                            <div className={`w-full md:w-1/2 flex ${index % 2 === 0 ? 'justify-center md:justify-start md:pl-12' : 'justify-center md:justify-end md:pr-12'}`}>
                                <LevelNode
                                    level={level}
                                    index={index}
                                    isActive={isActive}
                                    isLocked={isLocked}
                                    isCompleted={isCompleted}
                                    progress={isActive ? 10 : 0} // Mock progress
                                    onClick={(l) => setSelectedLevel(l)}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedLevel && (
                <ModuleDetail level={selectedLevel} onClose={() => setSelectedLevel(null)} />
            )}
        </div>
    );
};
