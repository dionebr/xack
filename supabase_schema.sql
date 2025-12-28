-- 1. Profiles Extension
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mood text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mood_status text CHECK (mood_status IN ('focused', 'studying', 'helping', 'afk'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;

-- 2. Communities
CREATE TABLE IF NOT EXISTS communities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    category text CHECK (category IN ('web', 'ad', 'cloud', 'study', 'off-topic')),
    owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    icon_url text,
    created_at timestamptz DEFAULT now()
);

-- 3. Community Members
CREATE TABLE IF NOT EXISTS community_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id uuid REFERENCES communities(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role text CHECK (role IN ('member', 'moderator', 'owner')) DEFAULT 'member',
    joined_at timestamptz DEFAULT now(),
    UNIQUE(community_id, user_id)
);

-- 4. Community Topics
CREATE TABLE IF NOT EXISTS community_topics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id uuid REFERENCES communities(id) ON DELETE CASCADE,
    author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    title text NOT NULL,
    content text NOT NULL,
    type text CHECK (type IN ('discussion', 'help', 'debate', 'analysis')) DEFAULT 'discussion',
    is_pinned boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- 5. Community Replies
CREATE TABLE IF NOT EXISTS community_replies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id uuid REFERENCES community_topics(id) ON DELETE CASCADE,
    author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    content text NOT NULL,
    parent_reply_id uuid REFERENCES community_replies(id) ON DELETE CASCADE,
    upvotes integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- 6. Scraps
CREATE TABLE IF NOT EXISTS scraps (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL CHECK (char_length(content) <= 500),
    is_private boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- 7. RLS Enable
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraps ENABLE ROW LEVEL SECURITY;

-- 8. Basic Policies (Open Read, Auth Write)
-- Communities
CREATE POLICY "Public read communities" ON communities FOR SELECT USING (true);
CREATE POLICY "Auth create communities" ON communities FOR INSERT WITH CHECK (auth.uid() = owner_id);
-- Members
CREATE POLICY "Public read members" ON community_members FOR SELECT USING (true);
CREATE POLICY "Auth join members" ON community_members FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Topics
CREATE POLICY "Public read topics" ON community_topics FOR SELECT USING (true);
CREATE POLICY "Auth create topics" ON community_topics FOR INSERT WITH CHECK (auth.uid() = author_id);
-- Replies
CREATE POLICY "Public read replies" ON community_replies FOR SELECT USING (true);
CREATE POLICY "Auth create replies" ON community_replies FOR INSERT WITH CHECK (auth.uid() = author_id);
-- Scraps
CREATE POLICY "Public read scraps" ON scraps FOR SELECT USING (is_private = false OR auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Auth create scraps" ON scraps FOR INSERT WITH CHECK (auth.uid() = sender_id);
