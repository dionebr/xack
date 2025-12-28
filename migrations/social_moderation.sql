-- Phase 13: Community Moderation Features

-- 1. Community Bans Table
CREATE TABLE IF NOT EXISTS community_bans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id uuid REFERENCES communities(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    banned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    reason text,
    banned_at timestamptz DEFAULT now(),
    UNIQUE(community_id, user_id)
);

ALTER TABLE community_bans ENABLE ROW LEVEL SECURITY;

-- 2. Policies for Bans
-- Only owners/mods can see bans (or maybe public if you want a "Wall of Shame"?) -> Keeping private for admins
CREATE POLICY "Admins view bans" ON community_bans
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM community_members 
            WHERE community_id = community_bans.community_id 
            AND role IN ('owner', 'moderator')
        )
    );

CREATE POLICY "Admins create bans" ON community_bans
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM community_members 
            WHERE community_id = community_bans.community_id 
            AND role IN ('owner', 'moderator')
        )
    );

CREATE POLICY "Admins delete bans" ON community_bans
    FOR DELETE USING (
        auth.uid() IN (
            SELECT user_id FROM community_members 
            WHERE community_id = community_bans.community_id 
            AND role IN ('owner', 'moderator')
        )
    );

-- 3. Update Policies for Communities (Owner can edit)
CREATE POLICY "Owner update community" ON communities
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owner delete community" ON communities
    FOR DELETE USING (auth.uid() = owner_id);

-- 4. Update Policies for Members (Kick/Promote)
-- This allows mods/owners to update other members (e.g. change role)
-- Prevent updating SELF role to avoid accidental lockouts (handled in UI, but good to know)
CREATE POLICY "Admins update members" ON community_members
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM community_members 
            WHERE community_id = community_members.community_id 
            AND role IN ('owner', 'moderator')
        )
    );

CREATE POLICY "Admins delete members" ON community_members
    FOR DELETE USING (
        auth.uid() IN (
            SELECT user_id FROM community_members 
            WHERE community_id = community_members.community_id 
            AND role IN ('owner', 'moderator')
        )
        OR auth.uid() = user_id -- Allow user to leave (delete self)
    );
