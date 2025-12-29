-- Fix Delete Policies for Posts and Activities

-- Posts: Allow author to delete
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.posts; -- Cleanup potential old names
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = author_id);

-- Activities: Allow owner to delete
DROP POLICY IF EXISTS "Users can delete their own activities" ON public.activities;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.activities; -- Cleanup potential old names
CREATE POLICY "Users can delete their own activities" ON public.activities FOR DELETE USING (auth.uid() = user_id);
