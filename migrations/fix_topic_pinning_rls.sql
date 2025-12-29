-- Add RLS UPDATE policies for topic pinning
-- Execute este script no Supabase SQL Editor

-- Drop existing UPDATE policies if they exist
DROP POLICY IF EXISTS "Moderators can update topics" ON community_topics;
DROP POLICY IF EXISTS "Authors can update their topics" ON community_topics;

-- Allow community owners and moderators to update (pin/unpin) topics
CREATE POLICY "Moderators can update topics"
ON community_topics
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM community_members cm
        WHERE cm.community_id = community_topics.community_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'moderator')
        AND cm.status = 'approved'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM community_members cm
        WHERE cm.community_id = community_topics.community_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'moderator')
        AND cm.status = 'approved'
    )
);

-- Allow platform owners to update any topic
CREATE POLICY "Platform owners can update any topic"
ON community_topics
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'owner'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'owner'
    )
);

-- Allow authors to update their own topics (title, content, but not is_pinned)
CREATE POLICY "Authors can update their topics"
ON community_topics
FOR UPDATE
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'community_topics' AND cmd = 'UPDATE';
