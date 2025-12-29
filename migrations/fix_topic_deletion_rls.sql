-- Fix RLS policies for community_topics to allow deletion
-- Execute este script no Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can delete their own topics" ON community_topics;
DROP POLICY IF EXISTS "Moderators can delete topics" ON community_topics;

-- Allow topic authors to delete their own topics
CREATE POLICY "Users can delete their own topics"
ON community_topics
FOR DELETE
USING (auth.uid() = author_id);

-- Allow community owners and moderators to delete any topic in their community
CREATE POLICY "Moderators can delete topics"
ON community_topics
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM community_members cm
        WHERE cm.community_id = community_topics.community_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'moderator')
        AND cm.status = 'approved'
    )
);

-- Also allow platform owners (role = 'owner' in profiles) to delete any topic
CREATE POLICY "Platform owners can delete any topic"
ON community_topics
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'owner'
    )
);

-- Ensure cascade delete for replies when topic is deleted
-- (This should already be in the schema, but let's verify)
ALTER TABLE community_replies
DROP CONSTRAINT IF EXISTS community_replies_topic_id_fkey;

ALTER TABLE community_replies
ADD CONSTRAINT community_replies_topic_id_fkey
FOREIGN KEY (topic_id)
REFERENCES community_topics(id)
ON DELETE CASCADE;

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'community_topics' AND cmd = 'DELETE';
