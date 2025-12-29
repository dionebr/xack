-- Create activity_likes table for interactions on system activities
CREATE TABLE IF NOT EXISTS public.activity_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(activity_id, user_id)
);

-- Enable RLS
ALTER TABLE public.activity_likes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read activity_likes" ON public.activity_likes FOR SELECT USING (true);

CREATE POLICY "Auth insert activity_likes" ON public.activity_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Auth delete own activity_likes" ON public.activity_likes FOR DELETE USING (auth.uid() = user_id);

-- Add schema info to activities for counting (optional, but good for performance)
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_likes;
