-- Verificar status atual dos membros da comunidade xack
SELECT 
    cm.id,
    cm.status,
    cm.role,
    p.username,
    p.full_name,
    c.title as community_name
FROM community_members cm
JOIN profiles p ON p.id = cm.user_id
JOIN communities c ON c.id = cm.community_id
WHERE c.title = 'xack'
ORDER BY cm.joined_at DESC;

-- Se encontrar membros com status NULL, corrija:
-- UPDATE community_members 
-- SET status = 'approved' 
-- WHERE status IS NULL AND community_id IN (SELECT id FROM communities WHERE title = 'xack');
