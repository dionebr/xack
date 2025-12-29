import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useTranslation } from '../../context/TranslationContext';

interface MemberManagementProps {
    communityId: string;
    currentUserRole: 'owner' | 'moderator' | 'member' | 'pending' | 'none';
}

const MemberManagement: React.FC<MemberManagementProps> = ({ communityId, currentUserRole }) => {
    const { t } = useTranslation();
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadMembers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('community_members')
            .select('id, role, joined_at, status, user_id')
            .eq('community_id', communityId)
            .order('joined_at', { ascending: false });

        if (error) {
            console.error('Error loading members:', error);
            setMembers([]);
        } else if (data) {
            // Buscar dados dos usuários separadamente
            const userIds = data.map(m => m.user_id);
            const { data: users } = await supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url')
                .in('id', userIds);

            // Combinar dados
            const membersWithUsers = data.map(member => ({
                ...member,
                user: users?.find(u => u.id === member.user_id)
            }));

            setMembers(membersWithUsers);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadMembers();
    }, [communityId]);

    const handleRoleChange = async (memberId: string, newRole: 'member' | 'moderator') => {
        // Only owners can promote/demote (admins)
        if (currentUserRole !== 'owner') {
            toast.error('Only the owner can change roles.');
            return;
        }

        try {
            const { error } = await supabase
                .from('community_members')
                .update({ role: newRole })
                .eq('id', memberId);

            if (error) throw error;
            toast.success(`Role updated to ${newRole}`);
            loadMembers();
        } catch (e) {
            toast.error(t('actions.actionFailed'));
        }
    };

    const handleApprove = async (memberId: string) => {
        try {
            const { error } = await supabase
                .from('community_members')
                .update({ status: 'approved' })
                .eq('id', memberId);

            if (error) throw error;
            toast.success('Member approved!');
            loadMembers();
        } catch (e) {
            toast.error(t('actions.actionFailed'));
        }
    };

    const handleKick = async (memberUserId: string, memberId: string) => {
        if (!confirm(t('community.members.confirm_kick'))) return;

        try {
            // First add to ban list if you want to ban, but "kick" is usually just delete from members
            // To "Ban" we would use the community_bans table. For now, let's just Kick (remove).

            const { error } = await supabase
                .from('community_members')
                .delete()
                .eq('id', memberId);

            if (error) throw error;
            toast.success('Member removed');
            loadMembers();
        } catch (e) {
            toast.error(t('actions.actionFailed'));
        }
    };

    const handleBan = async (memberUserId: string) => {
        if (!confirm(t('community.members.confirm_ban'))) return;

        try {
            // 1. Add to bans
            const { error: banError } = await supabase
                .from('community_bans')
                .insert({
                    community_id: communityId,
                    user_id: memberUserId,
                    reason: 'Banned by moderator'
                });

            if (banError) throw banError;

            // 2. Remove from members (Trigger might handle this, but explicit is safer)
            await supabase.from('community_members').delete().eq('user_id', memberUserId).eq('community_id', communityId);

            toast.success('User banned successfully');
            loadMembers();
        } catch (e: any) {
            console.error(e);
            toast.error(t('actions.actionFailed') + ': ' + e.message);
        }
    }

    const canModerate = currentUserRole === 'owner' || currentUserRole === 'moderator';

    if (loading) return <div className="p-4 text-center text-text-muted">{t('community.loading')}</div>;

    return (
        <div className="bg-[#161718] rounded-xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider">{t('community.members.title')} ({members.filter(m => m.status !== 'pending').length})</h3>
                <button onClick={loadMembers} className="text-text-muted hover:text-white">
                    <span className="material-symbols-outlined text-sm">refresh</span>
                </button>
            </div>

            <div className="max-h-[500px] overflow-y-auto">
                {/* PENDING APPROVALS SECTION */}
                {canModerate && members.filter(m => m.status === 'pending').length > 0 && (
                    <div className="border-b border-warning/20 bg-warning/5">
                        <div className="p-3 text-[10px] font-bold uppercase tracking-wider text-warning px-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">pending</span>
                            {t('community.members.pending')} ({members.filter(m => m.status === 'pending').length})
                        </div>
                        {members.filter(m => m.status === 'pending').map(member => (
                            <div key={member.id} className="p-4 flex items-center justify-between border-t border-white/5 hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden grayscale opacity-70">
                                        {member.user?.avatar_url && <img src={member.user.avatar_url} className="w-full h-full object-cover" />}
                                    </div>
                                    <div>
                                        <div className="text-white font-bold text-xs">{member.user?.full_name || member.user?.username || 'Unknown'}</div>
                                        <div className="text-[9px] uppercase tracking-wider text-text-muted">{t('community.members.requesting')}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleApprove(member.id)}
                                        className="px-3 py-1 bg-accent-purple text-white text-[10px] font-bold uppercase rounded hover:brightness-110 transition-all flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">check</span>
                                        {t('community.members.approve')}
                                    </button>
                                    <button
                                        onClick={() => handleKick(member.user.id, member.id)}
                                        className="px-3 py-1 bg-white/10 text-text-muted hover:text-white text-[10px] font-bold uppercase rounded hover:bg-white/20 transition-all flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                        {t('community.members.reject')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* APPROVED MEMBERS */}
                {members.filter(m => m.status !== 'pending').map(member => (
                    <div key={member.id} className="p-4 flex items-center justify-between border-b border-white/5 hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden">
                                {member.user?.avatar_url && <img src={member.user.avatar_url} className="w-full h-full object-cover" />}
                            </div>
                            <div>
                                <div className="text-white font-bold text-xs">{member.user?.full_name || member.user?.username || 'Unknown'}</div>
                                <div className={`text-[9px] uppercase tracking-wider font-bold ${member.role === 'owner' ? 'text-accent-purple' :
                                    member.role === 'moderator' ? 'text-blue-400' : 'text-text-muted'
                                    }`}>
                                    {member.role === 'owner' ? t('community.role.owner') :
                                        member.role === 'moderator' ? t('community.role.moderator') :
                                            t('community.role.member')}
                                </div>
                            </div>
                        </div>

                        {canModerate && member.role !== 'owner' && (
                            <div className="flex items-center gap-1">
                                {currentUserRole === 'owner' && (
                                    <>
                                        {member.role === 'member' ? (
                                            <button
                                                onClick={() => handleRoleChange(member.id, 'moderator')}
                                                className="p-1.5 hover:bg-blue-500/20 text-text-muted hover:text-blue-400 rounded-lg transition-colors"
                                                title={t('community.members.promote')}
                                            >
                                                <span className="material-symbols-outlined text-lg">shield</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleRoleChange(member.id, 'member')}
                                                className="p-1.5 hover:bg-yellow-500/20 text-text-muted hover:text-yellow-400 rounded-lg transition-colors"
                                                title={t('community.members.demote')}
                                            >
                                                <span className="material-symbols-outlined text-lg">remove_moderator</span>
                                            </button>
                                        )}
                                    </>
                                )}

                                <button
                                    onClick={() => handleKick(member.user.id, member.id)}
                                    className="p-1.5 hover:bg-red-500/10 text-text-muted hover:text-red-400 rounded-lg transition-colors"
                                    title={t('community.members.kick')}
                                >
                                    <span className="material-symbols-outlined text-lg">person_remove</span>
                                </button>

                                <button
                                    onClick={() => handleBan(member.user.id)}
                                    className="p-1.5 hover:bg-red-500/20 text-text-muted hover:text-red-500 rounded-lg transition-colors"
                                    title={t('community.members.ban')}
                                >
                                    <span className="material-symbols-outlined text-lg">block</span>
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MemberManagement;
