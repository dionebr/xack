-- 1. Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'operative' -- Default role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create trigger (only if it doesn't exist - hard to do cleanly in simple SQL without DO block, so we drop first)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Fix for existing users without profiles (Self-healing)
INSERT INTO public.profiles (id, username, full_name, role)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'username', 'operative_' || substr(id::text, 1, 8)),
    COALESCE(raw_user_meta_data->>'full_name', 'Unknown Operative'),
    'operative'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
