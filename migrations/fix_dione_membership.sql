-- Self-healing: Ensure all community owners are members of their own communities
INSERT INTO public.community_members (community_id, user_id, role, status)
SELECT 
    c.id, 
    c.owner_id, 
    'owner', 
    'approved'
FROM public.communities c
WHERE NOT EXISTS (
    SELECT 1 FROM public.community_members cm 
    WHERE cm.community_id = c.id AND cm.user_id = c.owner_id
);

-- Also ensure 'dione@xack.com' is owner of any communities they created (if email lookup is needed, but owner_id should be correct)
-- If the community was deleted, this won't help. But if it exists, this fixes the sidebar.

-- Debug: Make sure the community itself isn't deleted or hidden.
-- (The previous fix_community_visibility.sql should have handled RLS).
