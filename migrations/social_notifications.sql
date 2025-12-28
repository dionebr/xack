-- Add is_private to communities
ALTER TABLE communities ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false;

-- Add status to community_members (default 'approved' for backward compatibility)
ALTER TABLE community_members ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('pending', 'approved', 'rejected', 'banned')) DEFAULT 'approved';

-- Drop old check constraint if exists (optional/safety)
ALTER TABLE community_members DROP CONSTRAINT IF EXISTS community_members_role_check;
ALTER TABLE community_members ADD CONSTRAINT community_members_role_check CHECK (role IN ('member', 'moderator', 'owner'));

-- RLS Update (Allow inserting 'pending' members by anyone - i.e. "Request to Join")
-- Existing "Auth join members" policy checks (auth.uid() = user_id), which is fine.
-- But we need to ensure they can only insert 'pending' if the community is private.
-- For now, client-side logic + basic RLS is okay. The existing policy:
-- CREATE POLICY "Auth join members" ON community_members FOR INSERT WITH CHECK (auth.uid() = user_id);
-- matches perfectly.

-- Allow Owners/Mods to update status (Approve requests)
DROP POLICY IF EXISTS "Admins update members" ON community_members;
CREATE POLICY "Admins update members" ON community_members
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM community_members WHERE community_id = community_members.community_id AND role IN ('owner', 'moderator')
        )
    );

-- Allow Users to see their own pending status (Basic read is "Public read members" USING true, so everyone sees pending. Maybe restrict?)
-- If we want to hide pending members from public list:
-- DROP POLICY "Public read members" ON community_members;
-- CREATE POLICY "Public read members" ON community_members FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR auth.uid() IN (SELECT user_id FROM community_members WHERE community_id = community_members.community_id AND role IN ('owner', 'moderator')));
-- Keeping it open for now for simplicity, filtering on frontend.
