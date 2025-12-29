-- Function to update comment count
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.posts
        SET comment_count = comment_count + 1
        WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.posts
        SET comment_count = comment_count - 1
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for post_comments
DROP TRIGGER IF EXISTS on_comment_change ON public.post_comments;
CREATE TRIGGER on_comment_change
AFTER INSERT OR DELETE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

-- Recalculate existing counts
UPDATE public.posts p
SET comment_count = (
    SELECT count(*)
    FROM public.post_comments c
    WHERE c.post_id = p.id
);
