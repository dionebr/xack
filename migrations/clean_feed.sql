-- Clean Feed - Remove Test Posts
-- Execute this in Supabase SQL Editor to clear all posts

-- Delete all posts (this will cascade to post_validations, post_likes, post_comments, post_media)
DELETE FROM public.posts;

-- Optional: Reset auto-increment if needed
-- ALTER SEQUENCE posts_id_seq RESTART WITH 1;

-- Verify deletion
SELECT COUNT(*) as remaining_posts FROM public.posts;
