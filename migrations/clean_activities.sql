-- Clean Activities Feed - Remove Test Activities
-- Execute this in Supabase SQL Editor to clear test achievements and coins

-- Delete all activities (achievements, coins earned, etc.)
DELETE FROM public.activities;

-- Optional: Also clean coin_transactions if needed
-- DELETE FROM public.coin_transactions;

-- Verify deletion
SELECT COUNT(*) as remaining_activities FROM public.activities;
