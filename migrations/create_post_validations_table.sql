-- Create post_validations table for granular reactions
CREATE TABLE IF NOT EXISTS public.post_validations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    validator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('useful', 'well_explained', 'incomplete')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, validator_id)
);

-- Enable RLS
ALTER TABLE public.post_validations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read validations" ON public.post_validations FOR SELECT USING (true);

CREATE POLICY "Auth insert validations" ON public.post_validations FOR INSERT WITH CHECK (auth.uid() = validator_id);

CREATE POLICY "Auth update own validations" ON public.post_validations FOR UPDATE USING (auth.uid() = validator_id);

CREATE POLICY "Auth delete own validations" ON public.post_validations FOR DELETE USING (auth.uid() = validator_id);

-- Add realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_validations;
