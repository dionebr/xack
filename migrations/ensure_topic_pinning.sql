-- Verificar e criar coluna is_pinned se não existir
-- Execute este script no Supabase SQL Editor

-- Adicionar coluna is_pinned se não existir
ALTER TABLE community_topics 
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

-- Criar índice para melhorar performance de queries ordenadas por is_pinned
CREATE INDEX IF NOT EXISTS idx_community_topics_pinned_created 
ON community_topics(community_id, is_pinned DESC, created_at DESC);

-- Verificar a estrutura da tabela
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'community_topics'
ORDER BY ordinal_position;

-- Testar a query de ordenação
SELECT id, title, is_pinned, created_at
FROM community_topics
WHERE community_id = (SELECT id FROM communities WHERE title = 'xack' LIMIT 1)
ORDER BY is_pinned DESC, created_at DESC
LIMIT 10;
