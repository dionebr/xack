import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ASSETS, MOCK_LOGS } from '../constants';
import AvatarUpload from '../components/AvatarUpload';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('General');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Profile State
  const [profile, setProfile] = useState<any>({
    full_name: '',
    role: '',
    bio: '',
    avatar_url: null,
    username: '',
    social_links: { linkedin: '', github: '', website: '' },
    skills: [],
    privacy_settings: { public: true, show_ranking: true },
    stats: {
      flags: 0,
      machines: 0,
      first_bloods: 0,
      streak: 0,
      categories: [
        { cat: 'Web Exploitation', width: '0%' },
        { cat: 'Cryptography', width: '0%' },
        { cat: 'Forensics', width: '0%' },
        { cat: 'Reverse Engineering', width: '0%' },
        { cat: 'Pwn', width: '0%' }
      ]
    }
  });

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;
      setUserId(user.id);
      setUserEmail(user.email || null);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile({
          ...profile,
          ...data,
          // Ensure JSON defaults if null
          social_links: data.social_links || { linkedin: '', github: '', website: '' },
          skills: data.skills || [],
          privacy_settings: data.privacy_settings || { public: true, show_ranking: true },
          stats: data.stats || profile.stats // Use DB stats or default structure
        });
      }
    } catch (error: any) {
      console.error('Error loading profile:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: any = {}) => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('No user logged in');

      // Construct safe payload excluding read-only fields like 'stats' or 'email'
      const { stats, ...safeProfile } = profile;

      const payload = {
        id: user.id,
        updated_at: new Date(),
        full_name: profile.full_name,
        role: profile.role,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        social_links: profile.social_links,
        skills: profile.skills,
        privacy_settings: profile.privacy_settings,
        focus_areas: profile.focus_areas,
        certifications: profile.certifications,
        username: profile.username,
        ...updates
      };

      const { error } = await supabase.from('profiles').upsert(payload);

      if (error) throw error;

      setProfile(payload); // Update local state
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error('Error updating profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (url: string) => {
    updateProfile({ avatar_url: url });
  };

  // Skill Editor Helpers
  const addSkill = () => {
    const newSkills = [...profile.skills, { name: 'New Skill', level: 1 }];
    setProfile({ ...profile, skills: newSkills });
  };

  const updateSkill = (index: number, field: string, value: any) => {
    const newSkills = [...profile.skills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    setProfile({ ...profile, skills: newSkills });
  };

  const removeSkill = (index: number) => {
    const newSkills = profile.skills.filter((_: any, i: number) => i !== index);
    setProfile({ ...profile, skills: newSkills });
  };

  if (loading) return <div className="p-10 text-center text-text-muted">Loading profile intelligence...</div>;

  return (
    <div className="max-w-[1400px] mx-auto pb-10 pt-6">
      <div className="flex flex-col gap-2 mb-10">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-display font-black text-white italic tracking-tighter uppercase leading-none">Settings <span className="text-accent-purple">&</span> Portfolio</h1>
          <div className="h-px flex-1 bg-white/5"></div>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted pl-1 fade-in">
          Hello, <span className="text-white">{profile.full_name || profile.username || 'Operative'}</span>. Prepare for <span className="text-accent-purple">Cyber Warfare</span>.
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-bg-card rounded-[2.5rem] border border-white/5 p-8 flex flex-col items-center shadow-card overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-accent-purple/5 to-transparent pointer-events-none"></div>

            {/* Avatar Section */}
            <div className="mb-6 relative z-10">
              <AvatarUpload
                uid={userId || 'user'}
                url={profile.avatar_url}
                size={140}
                onUpload={handleAvatarUpload}
              />
            </div>

            <h2 className="text-2xl font-display font-black text-white mb-2 italic text-center outline-none bg-transparent" contentEditable
              onBlur={(e) => setProfile({ ...profile, full_name: e.currentTarget.textContent })}
              suppressContentEditableWarning>
              {profile.full_name || profile.username || 'Anonymous User'}
            </h2>

            <div className="px-4 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/30 text-accent-purple text-[10px] font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">shield</span>
              {profile.role || 'Cyber Operative'}
            </div>
            {userEmail && (
              <div className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-4">
                {userEmail}
              </div>
            )}

            <div className="w-full space-y-2 relative z-10">
              {['General', 'Portfolio', 'Security'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold text-[10px] uppercase tracking-widest ${activeTab === tab ? 'bg-white/5 border border-white/10 text-white shadow-glow' : 'text-text-muted hover:text-white hover:bg-white/5'}`}>
                  <span className="material-symbols-outlined text-lg">{tab === 'General' ? 'badge' : tab === 'Portfolio' ? 'folder_special' : 'security'}</span>
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-8 animate-in fade-in duration-500">
          {activeTab === 'General' && (
            <div className="bg-bg-card rounded-[2.5rem] border border-white/5 p-10 shadow-card">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-xl font-display font-bold text-white mb-1 uppercase italic">Operative Identity</h3>
                  <p className="text-[10px] text-text-muted uppercase tracking-widest">Public facing intelligence</p>
                </div>
                <button onClick={() => updateProfile()} disabled={saving} className="px-6 py-2 bg-white text-black rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-colors flex items-center gap-2">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Full Name</label>
                  <input
                    type="text"
                    value={profile.full_name || ''}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="w-full bg-[#161718] border border-white/5 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-accent-purple/50 font-bold transition-all placeholder:text-white/10"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Professional Role</label>
                  <input
                    type="text"
                    value={profile.role || ''}
                    onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                    className="w-full bg-[#161718] border border-white/5 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-accent-purple/50 font-bold transition-all placeholder:text-white/10"
                    placeholder="e.g. Red Team Operator"
                  />
                </div>
                <div className="col-span-2 space-y-3">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Bio / Mission Statement</label>
                  <textarea
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full bg-[#161718] border border-white/5 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-accent-purple/50 font-bold transition-all min-h-[100px] placeholder:text-white/10"
                    placeholder="Brief description of your expertise and goals..."
                  />
                </div>

                <div className="col-span-2 space-y-3">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Focus Areas (Select all that apply)</label>
                  <div className="flex flex-wrap gap-2">
                    {['Web Security', 'Pentest', 'Red Team', 'Blue Team', 'Cloud Security', 'Mobile', 'Malware / Reverse', 'Active Directory'].map(area => (
                      <button
                        key={area}
                        onClick={() => {
                          const current = profile.focus_areas || [];
                          const updated = current.includes(area)
                            ? current.filter((a: string) => a !== area)
                            : [...current, area];
                          setProfile({ ...profile, focus_areas: updated });
                        }}
                        className={`px-4 py-2 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all ${(profile.focus_areas || []).includes(area)
                          ? 'bg-accent-purple border-accent-purple text-white shadow-glow-sm'
                          : 'bg-[#161718] border-white/5 text-text-muted hover:border-white/20'
                          }`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-8">
                <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Communication Channels</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest pl-1">LinkedIn</label>
                    <input type="text" value={profile.social_links?.linkedin || ''} onChange={(e) => setProfile({ ...profile, social_links: { ...profile.social_links, linkedin: e.target.value } })} className="w-full bg-[#161718] border border-white/5 rounded-lg py-3 px-4 text-white text-xs focus:outline-none focus:border-accent-purple/30" placeholder="Profile URL" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest pl-1">GitHub</label>
                    <input type="text" value={profile.social_links?.github || ''} onChange={(e) => setProfile({ ...profile, social_links: { ...profile.social_links, github: e.target.value } })} className="w-full bg-[#161718] border border-white/5 rounded-lg py-3 px-4 text-white text-xs focus:outline-none focus:border-accent-purple/30" placeholder="Username" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest pl-1">Website</label>
                    <input type="text" value={profile.social_links?.website || ''} onChange={(e) => setProfile({ ...profile, social_links: { ...profile.social_links, website: e.target.value } })} className="w-full bg-[#161718] border border-white/5 rounded-lg py-3 px-4 text-white text-xs focus:outline-none focus:border-accent-purple/30" placeholder="https://" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Portfolio' && (
            <div className="space-y-8">
              {/* Skills Section */}
              <div className="bg-bg-card rounded-[2.5rem] border border-white/5 p-10 shadow-card">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-xl font-display font-bold text-white mb-1 uppercase italic">Skill Matrix</h3>
                    <p className="text-[10px] text-text-muted uppercase tracking-widest">Define your technical arsenal</p>
                  </div>
                  <button onClick={() => updateProfile()} disabled={saving} className="px-6 py-2 bg-accent-purple text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-colors shadow-glow">
                    {saving ? 'Syncing...' : 'Sync Matrix'}
                  </button>
                </div>

                <div className="space-y-4 mb-4">
                  {(profile.skills || []).map((skill: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 bg-[#161718] p-4 rounded-xl border border-white/5 group hover:border-white/10 transition-all">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-muted font-black text-sm">{idx + 1}</div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={skill.name}
                          onChange={(e) => updateSkill(idx, 'name', e.target.value)}
                          className="bg-transparent text-white font-bold text-sm w-full focus:outline-none"
                          placeholder="Skill Name (e.g. SQL Injection)"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(level => (
                          <button
                            key={level}
                            onClick={() => updateSkill(idx, 'level', level)}
                            className={`w-6 h-1.5 rounded-full transition-all ${level <= skill.level ? 'bg-accent-purple shadow-glow-sm' : 'bg-white/10 hover:bg-white/20'}`}
                          />
                        ))}
                      </div>
                      <button onClick={() => removeSkill(idx)} className="w-8 h-8 flex items-center justify-center text-white/20 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  ))}

                  <button onClick={addSkill} className="w-full py-4 border border-dashed border-white/10 rounded-xl text-text-muted hover:text-white hover:border-accent-purple/50 hover:bg-accent-purple/5 transition-all text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">add</span> Add New Skill
                  </button>
                </div>
              </div>

              {/* Certifications Section */}
              <div className="bg-bg-card rounded-[2.5rem] border border-white/5 p-10 shadow-card">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-xl font-display font-bold text-white mb-1 uppercase italic">Certifications & Training</h3>
                    <p className="text-[10px] text-text-muted uppercase tracking-widest">Verified Credentials</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {(profile.certifications || []).map((cert: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 bg-[#161718] p-4 rounded-xl border border-white/5">
                      <span className="material-symbols-outlined text-accent-purple text-2xl">workspace_premium</span>
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <input
                          placeholder="Certification Name (e.g. OSCP)"
                          className="bg-transparent text-white font-bold text-sm focus:outline-none"
                          value={cert.name}
                          onChange={(e) => {
                            const newCerts = [...(profile.certifications || [])];
                            newCerts[idx] = { ...cert, name: e.target.value };
                            setProfile({ ...profile, certifications: newCerts });
                          }}
                        />
                        <input
                          placeholder="Issuer (e.g. OffSec)"
                          className="bg-transparent text-text-muted text-xs focus:outline-none text-right"
                          value={cert.issuer}
                          onChange={(e) => {
                            const newCerts = [...(profile.certifications || [])];
                            newCerts[idx] = { ...cert, issuer: e.target.value };
                            setProfile({ ...profile, certifications: newCerts });
                          }}
                        />
                      </div>
                      <button onClick={() => {
                        const newCerts = (profile.certifications || []).filter((_: any, i: number) => i !== idx);
                        setProfile({ ...profile, certifications: newCerts });
                      }} className="text-white/20 hover:text-red-500">
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                  ))}
                  <button onClick={() => {
                    const newCerts = [...(profile.certifications || []), { name: '', issuer: '', date: new Date().toISOString() }];
                    setProfile({ ...profile, certifications: newCerts });
                  }} className="text-xs font-bold text-accent-purple hover:text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">add_circle</span> Add Certification
                  </button>
                </div>
              </div>

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
            </div>
          )}

          {activeTab === 'Security' && (
            <div className="bg-bg-card rounded-[2.5rem] border border-white/5 p-10 shadow-card space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-display font-bold text-white uppercase italic">Security Audit Logs</h3>
                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Platform Integrity Verified</span>
              </div>
              <div className="space-y-3">
                {MOCK_LOGS.map((log: any) => (
                  <div key={log.id} className="p-4 rounded-2xl bg-bg-main border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${log.status === 'SUCCESS' ? 'bg-status-green' : 'bg-status-yellow'}`}></div>
                      <div>
                        <div className="text-[11px] font-black text-white uppercase tracking-widest">{log.action.replace(/_/g, ' ')}</div>
                        <div className="text-[9px] text-text-muted font-bold mt-1 uppercase">{log.timestamp} • IP: {log.ip}</div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">info</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
