
import React, { useState, useEffect } from 'react';

interface ChallengeCardImageProps {
    machineId: string;
    category: string;
    className?: string;
}

const ChallengeCardImage: React.FC<ChallengeCardImageProps> = ({ machineId, category, className }) => {
    // Priority: Specific -> Category -> Default
    const [imgSrc, setImgSrc] = useState<string>(`/assets/challenges/${machineId.toLowerCase()}.jpg`);
    const [stage, setStage] = useState<'SPECIFIC' | 'CATEGORY' | 'DEFAULT'>('SPECIFIC');

    const handleError = () => {
        if (stage === 'SPECIFIC') {
            setStage('CATEGORY');
            // Try category image (generated ones are png)
            setImgSrc(`/assets/categories/${category?.toLowerCase() || 'misc'}.png`);
        } else if (stage === 'CATEGORY') {
            setStage('DEFAULT');
            setImgSrc('/assets/images/default_challenge.jpg');
        }
    };

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg-card z-10" />

            {/* Background Image */}
            <img
                src={imgSrc}
                alt={category}
                onError={handleError}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-80"
                style={{ filter: stage === 'DEFAULT' ? 'grayscale(100%) sepia(20%) hue-rotate(240deg)' : 'none' }}
            />

            {/* Category Tag */}
            <div className="absolute bottom-4 left-6 z-20">
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent-cyan bg-accent-cyan/10 px-2 py-1 rounded border border-accent-cyan/20">
                    {category?.replace(/_/g, ' ') || 'Unknown'}
                </span>
            </div>
        </div>
    );
};

export default ChallengeCardImage;
