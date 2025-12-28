-- Ensure visible for everyone
DROP POLICY IF EXISTS "Public read communities" ON communities;

CREATE POLICY "Public read communities"
    ON communities
    FOR SELECT
    USING (true);

-- Ensure members are visible count
DROP POLICY IF EXISTS "Public read members" ON community_members;

CREATE POLICY "Public read members"
    ON community_members
    FOR SELECT
    USING (true);
