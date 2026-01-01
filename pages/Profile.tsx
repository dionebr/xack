import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ASSETS } from '../constants';

import { useSocial } from '../context/SocialContext';
import ScrapBoard from '../components/Social/ScrapBoard';
import VisualIntel from '../components/Social/VisualIntel';
import SeniorityBadge from '../components/Social/SeniorityBadge';
import TrustMeter from '../components/Social/TrustMeter';
import TestimonialBoard from '../components/Social/TestimonialBoard';

const Profile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { openChat } = useSocial(); // Remove debug log

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('General');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'pending' | 'accepted' | 'self'>('none');

    useEffect(() => {
        checkAuthAndLoad();
    }, [id]);

    const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    const checkAuthAndLoad = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        if (id) getProfile(id, user);
    };

    const getProfile = async (identifier: string, user: any) => {
        try {
            setLoading(true);

            let query = supabase.from('profiles').select('*, mood, mood_status, bio');

            const isShortId = /^\d{5}$/.test(identifier);

            if (isUUID(identifier)) {
                query = query.eq('id', identifier);
            } else if (isShortId) {
                query = query.eq('short_id', identifier);
            } else {
                query = query.eq('username', identifier);
            }

            const { data, error } = await query.single();

            if (error) throw error;

            if (data) {
                // Determine privacy and interaction
                if (data.privacy_settings?.public === false && user?.id !== data.id) {
                    setProfile(null);
                } else {
                    const profileData: any = {
                        ...data,
                        mood: data.mood,
                        mood_status: data.mood_status,
                        bio: data.bio, // Ensure bio is passed
                        social_links: data.social_links || { linkedin: '', github: '', website: '' },
                        skills: data.skills || [],
                        stats: data.stats || {
                            flags: 0,
                            machines: 0,
                            first_bloods: 0,
                            streak: 0,
                            categories: []
                        }
                    };

                    // Fetch Communities separately
                    const { data: communities } = await supabase
                        .from('community_members')
                        .select('community_id')
                        .eq('user_id', data.id)
                        .eq('status', 'approved');

                    // Buscar dados das comunidades e contagem de membros
                    if (communities && communities.length > 0) {
                        const communityIds = communities.map(c => c.community_id);

                        // Buscar dados das comunidades
                        const { data: communitiesData } = await supabase
                            .from('communities')
                            .select('id, title, icon_url, category')
                            .in('id', communityIds);

                        // Buscar contagem de membros para cada comunidade
                        const communitiesWithCount = await Promise.all(
                            (communitiesData || []).map(async (comm) => {
                                const { count } = await supabase
                                    .from('community_members')
                                    .select('*', { count: 'exact', head: true })
                                    .eq('community_id', comm.id)
                                    .neq('status', 'pending');

                                return {
                                    ...comm,
                                    members_count: count || 0
                                };
                            })
                        );

                        profileData.communities = communitiesWithCount;
                    }

                    setProfile(profileData);

                    if (user && user.id !== data.id) {
                        checkFriendship(user.id, data.id);
                        logVisit(user.id, data.id);
                    } else if (user && user.id === data.id) {
                        setFriendshipStatus('self');
                    }
                }
            }
        } catch (error: any) {
            console.error('Error loading profile:', error.message);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const checkFriendship = async (myId: string, theirId: string) => {
        const { data } = await supabase
            .from('friendships')
            .select('status')
            .or(`and(user_id.eq.${myId},friend_id.eq.${theirId}),and(user_id.eq.${theirId},friend_id.eq.${myId})`)
            .maybeSingle();

        if (data) {
            setFriendshipStatus(data.status);
        } else {
            setFriendshipStatus('none');
        }
    };

    const logVisit = async (visitorId: string, visitedId: string) => {
        // Log visit (upsert to update timestamp if recent?) 
        // For simple log, just insert. RLS protects.
        await supabase.from('profile_visits').insert({
            visitor_id: visitorId,
            visited_id: visitedId
        });
    };

    const handleConnect = async () => {
        if (!currentUser || !profile) return;
        try {
            const { error } = await supabase.from('friendships').insert({
                user_id: currentUser.id,
                friend_id: profile.id,
                status: 'pending'
            });
            if (error) throw error;
            setFriendshipStatus('pending');
            // toast.success('Connection request sent'); (Avoid toast here to keep UI clean, maybe button state changes)
        } catch (error) {
            console.error('Error connecting:', error);
        }
    };

    if (loading) return <div className="p-10 text-center text-text-muted">Loading intelligence dossier...</div>;

    if (!profile) {
        return (
            <div className="p-10 text-center space-y-4">
                <h2 className="text-2xl font-black text-white">ACCESS DENIED</h2>
                <p className="text-text-muted">This operative profile does not exist or is classified.</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 uppercase font-bold text-xs"
                >
                    Return to Base
                </button>
            </div>
        )
    }

    return (
        <div className="max-w-[1400px] mx-auto pb-10 pt-6">
            <div className="flex flex-col gap-2 mb-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-display font-black text-white italic tracking-tighter uppercase leading-none">Operative <span className="text-accent-purple">Dossier</span></h1>
                    <div className="h-px flex-1 bg-white/5"></div>
                    <button onClick={() => navigate(-1)} className="text-xs font-bold text-text-muted hover:text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-10">
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-bg-card rounded-[2.5rem] border border-white/5 p-8 flex flex-col items-center shadow-card relative z-50">
                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-accent-purple/5 to-transparent pointer-events-none"></div>

                        {/* Avatar Section */}
                        <div className="mb-6 relative z-10">
                            <div className="w-[140px] h-[140px] rounded-full p-1 border-2 border-accent-purple/30 relative">
                                <div className="w-full h-full rounded-full bg-cover bg-center bg-black/50"
                                    style={{ backgroundImage: `url(${profile.avatar_url || ASSETS.creatorPhoto})` }}
                                />
                                {/* Online Indicator (Placeholder) */}
                                {/* <div className="absolute bottom-2 right-2 w-5 h-5 bg-status-green rounded-full border-4 border-bg-card"></div> */}
                            </div>
                        </div>

                        <h2 className="text-2xl font-display font-black text-white mb-2 italic text-center">
                            {profile.full_name || profile.username || 'Operative'}
                        </h2>

                        <div className="px-4 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/30 text-accent-purple text-[10px] font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">shield</span>
                            {profile.role || 'Cyber Operative'}
                        </div>

                        {/* Seniority Badge */}
                        {profile.created_at && (
                            <div className="mb-6 scale-110">
                                <SeniorityBadge createdAt={profile.created_at} username={profile.username} />
                            </div>
                        )}

                        {/* Trust Meter (Heritage) */}
                        <div className="mb-8 w-full px-4">
                            {/* Mock ratings for now until DB fetch is implemented in getProfile */}
                            <TrustMeter ratings={{ trust: 3, cool: 2, skill: 3 }} size="md" />
                        </div>

                        {/* Mood Display */}
                        {profile.mood && (
                            <div className="mb-6 text-center px-4">
                                <div className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Current Mood</div>
                                <div className="text-white text-sm italic font-medium">"{profile.mood}"</div>
                                {profile.mood_status && (
                                    <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase
                                        ${profile.mood_status === 'focused' ? 'bg-red-500/20 text-red-400' :
                                            profile.mood_status === 'studying' ? 'bg-blue-500/20 text-blue-400' :
                                                profile.mood_status === 'helping' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white'}`}>
                                        {profile.mood_status}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="w-full space-y-3 mb-8 relative z-10 px-4">
                            {friendshipStatus === 'none' && (
                                <button onClick={handleConnect} className="w-full py-3 bg-accent-purple hover:bg-accent-purple/90 text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-glow transition-all flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-lg">person_add</span> Connect
                                </button>
                            )}
                            {friendshipStatus === 'pending' && (
                                <button disabled className="w-full py-3 bg-white/10 text-white/50 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 cursor-not-allowed">
                                    <span className="material-symbols-outlined text-lg">hourglass_empty</span> Request Sent
                                </button>
                            )}
                            {friendshipStatus === 'accepted' && (
                                <button className="w-full py-3 bg-status-green/10 border border-status-green/30 text-status-green rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-lg">check_circle</span> Connected
                                </button>
                            )}
                            {friendshipStatus === 'self' && (
                                <button onClick={() => navigate('/settings')} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-lg">edit</span> Edit Profile
                                </button>
                            )}

                            {friendshipStatus !== 'self' && (
                                <button
                                    onClick={() => openChat(profile.id)}
                                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">chat</span> Message
                                </button>
                            )}
                        </div>

                        <div className="w-full space-y-2 relative z-10">
                            {['Portfolio', 'General', 'Visual Intel', 'Scraps', 'Testimonials', 'Communities'].map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold text-[10px] uppercase tracking-widest ${activeTab === tab ? 'bg-white/5 border border-white/10 text-white shadow-glow' : 'text-text-muted hover:text-white hover:bg-white/5'}`}>
                                    <span className="material-symbols-outlined text-lg">
                                        {tab === 'General' ? 'badge' :
                                            tab === 'Portfolio' ? 'folder_special' :
                                                tab === 'Visual Intel' ? 'photo_camera' :
                                                    tab === 'Scraps' ? 'chat_bubble' :
                                                        tab === 'Testimonials' ? 'rate_review' : 'groups'}
                                    </span>
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Read Only Indicator */}
                        <div className="mt-8 text-[9px] font-black text-white/20 uppercase tracking-[0.2em] animate-pulse">
                            Spectator Mode
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-8 space-y-8 animate-in fade-in duration-500">
                    {activeTab === 'Scraps' && (
                        <ScrapBoard userId={profile.id} canPost={friendshipStatus !== 'none' || profile.privacy_settings?.public !== false} />
                    )}

                    {activeTab === 'Testimonials' && (
                        <TestimonialBoard userId={profile.id} canPost={friendshipStatus !== 'none' || profile.privacy_settings?.public !== false} isOwner={friendshipStatus === 'self'} />
                    )}

                    {activeTab === 'Communities' && (
                        <div className="bg-bg-card rounded-[2.5rem] border border-white/5 p-10 shadow-card">
                            <h3 className="text-xl font-display font-bold text-white mb-8 uppercase italic">Community Memberships</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {(profile.communities || []).map((comm: any) => (
                                    <div
                                        key={comm.id}
                                        onClick={() => navigate(`/communities/${comm.id}`)}
                                        className="bg-[#161718] border border-white/5 p-4 rounded-xl hover:border-accent-purple/50 hover:bg-white/5 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-black rounded-lg border border-white/10 overflow-hidden shrink-0">
                                                {comm.icon_url ? (
                                                    <img src={comm.icon_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                                                        <span className="material-symbols-outlined text-sm">groups</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="overflow-hidden">
                                                <div className="text-white font-bold text-xs truncate group-hover:text-accent-purple transition-colors uppercase tracking-wider">{comm.title}</div>
                                                <div className="text-[10px] text-text-muted truncate">{comm.members_count || 0} members</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(profile.communities || []).length === 0 && (
                                    <div className="col-span-full text-center py-10 text-white/20 italic">
                                        No community memberships visible.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'Visual Intel' && (
                        <div className="bg-bg-card rounded-[2.5rem] border border-white/5 p-10 shadow-card min-h-[500px]">
                            <VisualIntel userId={profile.id} isOwner={friendshipStatus === 'self'} />
                        </div>
                    )}

                    {activeTab === 'General' && (
                        <div className="bg-bg-card rounded-[2.5rem] border border-white/5 p-10 shadow-card">
                            <h3 className="text-xl font-display font-bold text-white mb-8 uppercase italic">Identity Intelligence</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="col-span-2 space-y-3">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Bio / Mission Statement</label>
                                    <p className="w-full bg-[#161718]/50 border border-white/5 rounded-xl py-6 px-6 text-white/80 font-medium leading-relaxed italic border-l-4 border-l-accent-purple/50">
                                        "{profile.bio || 'No mission statement on file.'}"
                                    </p>
                                </div>

                                <div className="col-span-2 space-y-3">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Focus Areas</label>
                                    <div className="flex flex-wrap gap-2">
                                        {(profile.focus_areas || []).map((area: string) => (
                                            <span
                                                key={area}
                                                className="px-4 py-2 rounded-lg border bg-accent-purple/10 border-accent-purple/30 text-accent-purple text-[10px] font-black uppercase tracking-wider shadow-glow-sm"
                                            >
                                                {area}
                                            </span>
                                        ))}
                                        {(profile.focus_areas || []).length === 0 && <span className="text-text-muted text-sm italic">None specialized.</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-white/5 pt-8">
                                <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Communication Channels</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {profile.social_links?.linkedin && (
                                        <a href={profile.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#161718] border border-white/5 rounded-lg py-3 px-4 text-white text-xs hover:border-accent-purple/50 hover:bg-accent-purple/5 transition-all">
                                            <span className="material-symbols-outlined text-lg">public</span> LinkedIn
                                        </a>
                                    )}
                                    {profile.social_links?.github && (
                                        <a href={`https://github.com/${profile.social_links.github.replace('https://github.com/', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#161718] border border-white/5 rounded-lg py-3 px-4 text-white text-xs hover:border-accent-purple/50 hover:bg-accent-purple/5 transition-all">
                                            <span className="material-symbols-outlined text-lg">code</span> GitHub
                                        </a>
                                    )}
                                    {profile.social_links?.website && (
                                        <a href={profile.social_links.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#161718] border border-white/5 rounded-lg py-3 px-4 text-white text-xs hover:border-accent-purple/50 hover:bg-accent-purple/5 transition-all">
                                            <span className="material-symbols-outlined text-lg">link</span> Website
                                        </a>
                                    )}
                                    {(!profile.social_links?.linkedin && !profile.social_links?.github && !profile.social_links?.website) && (
                                        <div className="text-text-muted text-xs italic">No public channels found.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Portfolio' && (
                        <div className="space-y-8">
                            {/* Evolution / Stats Section */}
                            <div className="bg-bg-card rounded-[2.5rem] border border-white/5 p-10 shadow-card">
                                <h3 className="text-xl font-display font-bold text-white mb-1 uppercase italic">Tactical Evolution</h3>
                                <p className="text-[10px] text-text-muted uppercase tracking-widest mb-8">Performance Metrics</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        {(profile.stats?.categories || []).map((stat: any) => (
                                            <div key={stat.cat}>
                                                <div className="flex justify-between text-[10px] font-black uppercase text-text-muted mb-1">
                                                    <span>{stat.cat}</span>
                                                    <span className="text-white">{stat.width}</span>
                                                </div>
                                                <div className="h-2 bg-[#161718] rounded-full overflow-hidden">
                                                    <div className="h-full bg-accent-purple shadow-glow-sm relative" style={{ width: stat.width }}>
                                                        <div className="absolute inset-0 bg-white/10"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {(profile.stats?.categories || []).length === 0 && <div className="text-text-muted text-xs italic">No category data available.</div>}
                                    </div>

                                    {/* Key Stats */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-[#161718] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center text-center">
                                            <span className="material-symbols-outlined text-accent-purple text-2xl mb-2">flag</span>
                                            <div className="text-2xl font-display font-bold text-white">{profile.stats?.flags || 0}</div>
                                            <div className="text-[8px] uppercase tracking-widest text-text-muted">Flags Captured</div>
                                        </div>
                                        <div className="bg-[#161718] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center text-center">
                                            <span className="material-symbols-outlined text-yellow-500 text-2xl mb-2">hotel_class</span>
                                            <div className="text-2xl font-display font-bold text-white">{profile.stats?.first_bloods || 0}</div>
                                            <div className="text-[8px] uppercase tracking-widest text-text-muted">First Bloods</div>
                                        </div>
                                        <div className="bg-[#161718] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center text-center">
                                            <span className="material-symbols-outlined text-blue-500 text-2xl mb-2">terminal</span>
                                            <div className="text-2xl font-display font-bold text-white">{profile.stats?.machines || 0}</div>
                                            <div className="text-[8px] uppercase tracking-widest text-text-muted">Machines Pwned</div>
                                        </div>
                                        <div className="bg-[#161718] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center text-center">
                                            <span className="material-symbols-outlined text-red-500 text-2xl mb-2">whatshot</span>
                                            <div className="text-2xl font-display font-bold text-white">{profile.stats?.streak || 0}</div>
                                            <div className="text-[8px] uppercase tracking-widest text-text-muted">Day Streak</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Skills Section */}
                            <div className="bg-bg-card rounded-[2.5rem] border border-white/5 p-10 shadow-card">
                                <h3 className="text-xl font-display font-bold text-white mb-8 uppercase italic">Skill Matrix</h3>

                                <div className="space-y-4 mb-4">
                                    {(profile.skills || []).map((skill: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-4 bg-[#161718] p-4 rounded-xl border border-white/5 group hover:border-white/10 transition-all">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-muted font-black text-sm">{idx + 1}</div>
                                            <div className="flex-1">
                                                <div className="text-white font-bold text-sm">{skill.name}</div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map(level => (
                                                    <div
                                                        key={level}
                                                        className={`w-6 h-1.5 rounded-full transition-all ${level <= skill.level ? 'bg-accent-purple shadow-glow-sm' : 'bg-white/10'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {(profile.skills || []).length === 0 && <div className="text-text-muted text-xs italic">No skills registered yet.</div>}
                                </div>
                            </div>

                            {/* Certifications Section */}
                            <div className="bg-bg-card rounded-[2.5rem] border border-white/5 p-10 shadow-card">
                                <h3 className="text-xl font-display font-bold text-white mb-8 uppercase italic">Certifications</h3>

                                <div className="space-y-4">
                                    {(profile.certifications || []).map((cert: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-4 bg-[#161718] p-4 rounded-xl border border-white/5">
                                            <span className="material-symbols-outlined text-accent-purple text-2xl">workspace_premium</span>
                                            <div className="flex-1 grid grid-cols-2 gap-4">
                                                <div className="text-white font-bold text-sm">{cert.name}</div>
                                                <div className="text-text-muted text-xs text-right opacity-80">{cert.issuer}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {(profile.certifications || []).length === 0 && <div className="text-text-muted text-xs italic">No certifications verified.</div>}
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
