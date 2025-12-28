-- FIX: Ensure community_topics has is_pinned
ALTER TABLE community_topics ADD COLUMN IF NOT EXISTS is_pinned boolean DEFAULT false;

-- FIX: Ensure community_bans table exists (if previous migration failed)
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

-- RE-APPLY POLICIES (Idempotent)
DROP POLICY IF EXISTS "Admins view bans" ON community_bans;
CREATE POLICY "Admins view bans" ON community_bans FOR SELECT USING (auth.uid() IN (SELECT user_id FROM community_members WHERE community_id = community_bans.community_id AND role IN ('owner', 'moderator')));

DROP POLICY IF EXISTS "Admins create bans" ON community_bans;
CREATE POLICY "Admins create bans" ON community_bans FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM community_members WHERE community_id = community_bans.community_id AND role IN ('owner', 'moderator')));

DROP POLICY IF EXISTS "Admins delete bans" ON community_bans;
CREATE POLICY "Admins delete bans" ON community_bans FOR DELETE USING (auth.uid() IN (SELECT user_id FROM community_members WHERE community_id = community_bans.community_id AND role IN ('owner', 'moderator')));

-- IMPORTANT: STORAGE BUCKET CREATION (Must be done manually or via SQL if enabled)
-- Try to insert bucket config if storage schema is accessible (often requires explicit permission)
-- If this fails, User must create bucket 'community-icons' manually.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('community-icons', 'community-icons', true) 
ON CONFLICT (id) DO NOTHING;

-- STORAGE POLICIES
DROP POLICY IF EXISTS "Public Access Icons" ON storage.objects;
CREATE POLICY "Public Access Icons" ON storage.objects FOR SELECT USING (bucket_id = 'community-icons');

DROP POLICY IF EXISTS "Auth Upload Icons" ON storage.objects;
CREATE POLICY "Auth Upload Icons" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'community-icons' AND auth.role() = 'authenticated');
