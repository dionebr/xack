-- Atualizar o ícone da comunidade XACK
-- Execute este script no Supabase SQL Editor

UPDATE communities 
SET icon_url = '/assets/images/logo.svg'
WHERE title = 'xack';

-- Verificar a atualização
SELECT id, title, icon_url 
FROM communities 
WHERE title = 'xack';
