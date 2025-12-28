-- Adicionar política RLS para permitir UPDATE de upvotes em community_replies
-- Isso permite que qualquer usuário autenticado possa dar upvote em respostas

DROP POLICY IF EXISTS "Auth update reply upvotes" ON community_replies;

CREATE POLICY "Auth update reply upvotes" 
ON community_replies 
FOR UPDATE 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);
