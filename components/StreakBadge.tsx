import React from 'react';

interface StreakBadgeProps {
    currentStreak: number;
    longestStreak?: number;
    size?: 'sm' | 'md' | 'lg';
}

const StreakBadge: React.FC<StreakBadgeProps> = ({ currentStreak, longestStreak, size = 'md' }) => {
    if (currentStreak === 0) return null;

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5'
    };

    const iconSizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    };

    const getStreakColor = (days: number) => {
        if (days >= 30) return 'from-orange-500 to-red-500';
        if (days >= 7) return 'from-yellow-500 to-orange-500';
        return 'from-yellow-400 to-yellow-500';
    };

    return (
        <div
            className={`inline-flex items-center gap-1 bg-gradient-to-r ${getStreakColor(currentStreak)} rounded font-bold text-white ${sizeClasses[size]}`}
            title={longestStreak ? `Current: ${currentStreak} days | Longest: ${longestStreak} days` : `${currentStreak} day streak`}
        >
            <span className={iconSizes[size]}>🔥</span>
            <span>{currentStreak}</span>
        </div>
    );
};

export default StreakBadge;
