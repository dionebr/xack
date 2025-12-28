-- Social Feed Interactions Schema
-- Tables: post_likes, post_comments, post_media, hacking_gifs

-- 1. Post Likes
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- 2. Post Comments
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Post Media (Images, Code, GIFs)
CREATE TABLE IF NOT EXISTS public.post_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('image', 'code', 'gif')),
    url TEXT,
    code_content TEXT,
    code_language TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Hacking GIFs Library
CREATE TABLE IF NOT EXISTS public.hacking_gifs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Update Posts Table
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hacking_gifs ENABLE ROW LEVEL SECURITY;

-- Policies for Post Likes
CREATE POLICY "Public read likes" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Auth insert likes" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth delete own likes" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- Policies for Post Comments
CREATE POLICY "Public read comments" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Auth insert comments" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth delete own comments" ON public.post_comments FOR DELETE USING (auth.uid() = user_id);

-- Policies for Post Media
CREATE POLICY "Public read media" ON public.post_media FOR SELECT USING (true);
CREATE POLICY "Auth insert media" ON public.post_media FOR INSERT WITH CHECK (true);

-- Policies for Hacking GIFs
CREATE POLICY "Public read gifs" ON public.hacking_gifs FOR SELECT USING (true);

-- Realtime
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;

-- Populate Hacking GIFs Library
INSERT INTO public.hacking_gifs (title, url, tags) VALUES
  ('Matrix Code Rain', 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif', ARRAY['matrix', 'code', 'hacking']),
  ('Terminal Hacking', 'https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif', ARRAY['terminal', 'coding', 'cyber']),
  ('Cyber Attack', 'https://media.giphy.com/media/3oKIPic2BnoVZkRla8/giphy.gif', ARRAY['security', 'breach', 'hacking']),
  ('Data Stream', 'https://media.giphy.com/media/xTiTnxpQ3ghPiB2Hp6/giphy.gif', ARRAY['data', 'network', 'cyber']),
  ('Firewall Breach', 'https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif', ARRAY['firewall', 'security', 'breach']),
  ('Code Typing Fast', 'https://media.giphy.com/media/ZVik7pBtu9dNS/giphy.gif', ARRAY['coding', 'fast', 'programming']),
  ('Hacker Typing', 'https://media.giphy.com/media/3knKct3fGqxhK/giphy.gif', ARRAY['hacker', 'typing', 'terminal']),
  ('Binary Code', 'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif', ARRAY['binary', 'code', 'matrix'])
ON CONFLICT DO NOTHING;
