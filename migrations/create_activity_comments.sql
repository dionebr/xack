-- Activity Comments Table
CREATE TABLE IF NOT EXISTS public.activity_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.activity_comments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read activity_comments" ON public.activity_comments FOR SELECT USING (true);
CREATE POLICY "Auth insert activity_comments" ON public.activity_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth delete own activity_comments" ON public.activity_comments FOR DELETE USING (auth.uid() = user_id);

-- Add comment count to activities
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- Function to update activity comment count
CREATE OR REPLACE FUNCTION update_activity_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.activities
        SET comment_count = comment_count + 1
        WHERE id = NEW.activity_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.activities
        SET comment_count = comment_count - 1
        WHERE id = OLD.activity_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_activity_comment_change ON public.activity_comments;
CREATE TRIGGER on_activity_comment_change
AFTER INSERT OR DELETE ON public.activity_comments
FOR EACH ROW EXECUTE FUNCTION update_activity_comment_count();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_comments;
