-- Enable Realtime for Community Members (for join requests)
ALTER PUBLICATION supabase_realtime ADD TABLE community_members;

-- Enable Realtime for Friendships (for friend requests)
ALTER PUBLICATION supabase_realtime ADD TABLE friendships;

-- Enable Realtime for Solves (for flag capture notifications)
ALTER PUBLICATION supabase_realtime ADD TABLE solves;

-- Fix potentially missing policies for Realtime (Realtime respects RLS)
-- Ensure 'community_members' is readable by owners so they get the INSERT event.
-- Existing "Public read members" USING (true) should cover it.
