import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ASSETS } from '../constants';
import StreakBadge from '../components/StreakBadge';
import HackerPresence from '../components/HackerPresence';

const PublicProfile: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [solves, setSolves] = useState<any[]>([]);

    useEffect(() => {
        loadProfile();
    }, [slug]);

    const loadProfile = async () => {
        setLoading(true);

        // Buscar perfil por slug
        const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('public_slug', slug)
            .single();

        if (error || !profileData) {
            setLoading(false);
            return;
        }

        // Verificar se perfil é público
        if (!profileData.privacy_settings?.public_profile) {
            setLoading(false);
            return;
        }

        setProfile(profileData);

        // Buscar solves (sem spoilers)
        const { data: solvesData } = await supabase
            .from('solves')
            .select('challenge_id, flag_type, submitted_at')
            .eq('user_id', profileData.id)
            .order('submitted_at', { ascending: false });

        setSolves(solvesData || []);
        setLoading(false);
    };

    const copyProfileLink = () => {
        const url = `${window.location.origin}/profile/public/${slug}`;
        navigator.clipboard.writeText(url);
        alert('Profile link copied!');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-white text-2xl font-bold mb-2">Profile Not Found</h1>
                    <p className="text-text-muted mb-4">This profile is private or doesn't exist.</p>
                    <button onClick={() => navigate('/')} className="text-accent-purple hover:underline">
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    const uniqueChallenges = [...new Set(solves.map(s => s.challenge_id))];
    const rootFlags = solves.filter(s => s.flag_type === 'root').length;

    return (
        <div className="min-h-screen bg-bg-primary py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-bg-card border border-white/10 p-8 mb-6">
                    <div className="flex items-start gap-6">
                        <img
                            src={profile.avatar_url || ASSETS.creatorPhoto}
                            className="w-32 h-32 rounded-full object-cover border-4 border-accent-purple"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-white text-3xl font-bold">{profile.full_name}</h1>
                                {profile.streaks?.current_streak > 0 && (
                                    <StreakBadge
                                        currentStreak={profile.streaks.current_streak}
                                        longestStreak={profile.streaks.longest_streak}
                                        size="lg"
                                    />
                                )}
                            </div>
                            <div className="text-text-muted mb-4">@{profile.username || profile.short_id}</div>
                            {profile.bio && <p className="text-white/80 mb-4">{profile.bio}</p>}

                            {/* Stats */}
                            <div className="flex gap-6 mb-4">
                                <div>
                                    <div className="text-2xl font-bold text-accent-purple">{profile.score || 0}</div>
                                    <div className="text-xs text-text-muted uppercase">Points</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white">{uniqueChallenges.length}</div>
                                    <div className="text-xs text-text-muted uppercase">Labs Pwned</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white">{rootFlags}</div>
                                    <div className="text-xs text-text-muted uppercase">Root Flags</div>
                                </div>
                            </div>

                            {/* Share Button */}
                            <button
                                onClick={copyProfileLink}
                                className="px-4 py-2 bg-accent-purple text-white text-sm font-bold uppercase rounded hover:brightness-110 transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-base">share</span>
                                Share Profile
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Skills */}
                    <div className="bg-bg-card border border-white/10 p-6">
                        <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-accent-purple">code</span>
                            Skills
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {(profile.skills || []).map((skill: any, idx: number) => (
                                <div key={idx} className="px-3 py-1 bg-white/5 border border-white/10 text-white text-sm rounded">
                                    {skill.name}
                                </div>
                            ))}
                            {(!profile.skills || profile.skills.length === 0) && (
                                <div className="text-text-muted text-sm">No skills listed</div>
                            )}
                        </div>
                    </div>

                    {/* Hacker Presence */}
                    <HackerPresence userId={profile.id} />

                    {/* Social Links */}
                    {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                        <div className="bg-bg-card border border-white/10 p-6">
                            <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-accent-purple">link</span>
                                Links
                            </h2>
                            <div className="space-y-2">
                                {Object.entries(profile.social_links).map(([platform, url]: [string, any]) => (
                                    <a
                                        key={platform}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block text-accent-purple hover:text-white transition-colors text-sm"
                                    >
                                        {platform}: {url}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Activity (No Spoilers) */}
                    <div className="bg-bg-card border border-white/10 p-6 md:col-span-2">
                        <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-accent-purple">history</span>
                            Recent Activity
                        </h2>
                        <div className="space-y-2">
                            {solves.slice(0, 10).map((solve, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm py-2 border-b border-white/5">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-accent-purple text-base">
                                            {solve.flag_type === 'root' ? 'verified' : 'flag'}
                                        </span>
                                        <span className="text-white">{solve.challenge_id}</span>
                                        <span className="text-text-muted text-xs">({solve.flag_type})</span>
                                    </div>
                                    <div className="text-text-muted text-xs">
                                        {new Date(solve.submitted_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                            {solves.length === 0 && (
                                <div className="text-text-muted text-sm">No activity yet</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicProfile;
