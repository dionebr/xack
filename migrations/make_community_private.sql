-- Tornar a comunidade do Dione privada para testar notificações
UPDATE communities
SET is_private = true
WHERE owner_id = (SELECT id FROM auth.users WHERE email = 'dione@xack.com');

-- Verificar
SELECT 
    c.id,
    c.title,
    c.is_private,
    u.email as owner
FROM communities c
JOIN auth.users u ON u.id = c.owner_id
WHERE u.email = 'dione@xack.com';
