-- Enable Realtime for Social Tables (Idempotent Version)

-- 1. Ensure tables are part of the 'supabase_realtime' publication
-- We use DO blocks to safely handle "already exists" errors

-- Posts
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE posts; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Activities
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE activities; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Post Comments
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE post_comments; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Activity Comments
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE activity_comments; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Friendships
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE friendships; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Community Members
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE community_members; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Post Validations (Likes) - NEW
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE post_validations; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Activity Likes - NEW
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE activity_likes; EXCEPTION WHEN OTHERS THEN NULL; END $$;


-- 2. Ensure RLS allows SELECT (Read) for everyone on these tables
-- Using DROP IF EXISTS to make this script idempotent

-- Posts
DROP POLICY IF EXISTS "Public Posts are viewable by everyone" ON posts;
CREATE POLICY "Public Posts are viewable by everyone" ON posts FOR SELECT USING ( true );

-- Activities
DROP POLICY IF EXISTS "Public Activities are viewable by everyone" ON activities;
CREATE POLICY "Public Activities are viewable by everyone" ON activities FOR SELECT USING ( is_public = true );

-- Post Comments
DROP POLICY IF EXISTS "Post Comments are viewable by everyone" ON post_comments;
CREATE POLICY "Post Comments are viewable by everyone" ON post_comments FOR SELECT USING ( true );

-- Activity Comments
DROP POLICY IF EXISTS "Activity Comments are viewable by everyone" ON activity_comments;
CREATE POLICY "Activity Comments are viewable by everyone" ON activity_comments FOR SELECT USING ( true );

-- Friendships
DROP POLICY IF EXISTS "Friendships are viewable by confirmed friends or own requests" ON friendships;
CREATE POLICY "Friendships are viewable by confirmed friends or own requests" ON friendships FOR SELECT USING ( 
    auth.uid() = user_id 
    or auth.uid() = friend_id 
);

-- Community Members
DROP POLICY IF EXISTS "Community Members viewable by everyone" ON community_members;
CREATE POLICY "Community Members viewable by everyone" ON community_members FOR SELECT USING ( true );

-- Post Validations (Likes)
DROP POLICY IF EXISTS "Post Validations are viewable by everyone" ON post_validations;
CREATE POLICY "Post Validations are viewable by everyone" ON post_validations FOR SELECT USING ( true );

-- Activity Likes
DROP POLICY IF EXISTS "Activity Likes are viewable by everyone" ON activity_likes;
CREATE POLICY "Activity Likes are viewable by everyone" ON activity_likes FOR SELECT USING ( true );
