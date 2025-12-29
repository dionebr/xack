-- Securely increment share count
CREATE OR REPLACE FUNCTION increment_share_count(p_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.posts
    SET share_count = share_count + 1
    WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
