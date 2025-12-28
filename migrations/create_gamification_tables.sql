-- Create Activities Table
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('achievement', 'purchase', 'post', 'friend_request', 'flag_submission', 'community_request')),
    content TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_public BOOLEAN DEFAULT TRUE
);

-- Safely add columns if table already exists (Idempotent)
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS type TEXT NOT NULL CHECK (type IN ('achievement', 'purchase', 'post', 'friend_request', 'flag_submission', 'community_request'));
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create Coin Transactions Table
CREATE TABLE IF NOT EXISTS public.coin_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for Activities
CREATE POLICY "Public read activities" ON public.activities 
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Auth insert activities" ON public.activities 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for Coin Transactions
CREATE POLICY "Users read own transactions" ON public.coin_transactions 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System insert transactions" ON public.coin_transactions 
    FOR INSERT WITH CHECK (auth.uid() = user_id); 
    -- Note: In a real prod env, this should be restricted to service roles, 
    -- but for this app structure, client inserts are used (e.g. SurfaceUnlockModal).

-- Realtime needs to be enabled for these tables for the Feed and Notifications
-- Realtime needs to be enabled for these tables for the Feed and Notifications
-- Note: If these lines fail with "already member", it's fine.
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.coin_transactions;
