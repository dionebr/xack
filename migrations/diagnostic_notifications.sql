-- ========================================
-- DIAGNÓSTICO COMPLETO DE NOTIFICAÇÕES
-- ========================================

-- 1. Verificar se community_members está na publicação realtime
SELECT 
    'REALTIME CONFIG' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' 
            AND tablename = 'community_members'
        ) THEN '✅ community_members está na publicação'
        ELSE '❌ community_members NÃO está na publicação - EXECUTE: ALTER PUBLICATION supabase_realtime ADD TABLE community_members;'
    END as status;

-- 2. Verificar solicitações pendentes
SELECT 
    'PENDING REQUESTS' as check_type,
    COUNT(*) as total_pending,
    STRING_AGG(u.email || ' -> ' || c.title, ', ') as requests
FROM community_members cm
JOIN auth.users u ON u.id = cm.user_id
JOIN communities c ON c.id = cm.community_id
WHERE cm.status = 'pending';

-- 3. Verificar se Dione é owner de alguma comunidade
SELECT 
    'DIONE COMMUNITIES' as check_type,
    c.id,
    c.title,
    c.is_private,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM community_members cm2 
            WHERE cm2.community_id = c.id 
            AND cm2.user_id = c.owner_id 
            AND cm2.role = 'owner'
        ) THEN '✅ Dione é membro owner'
        ELSE '❌ Dione NÃO é membro - precisa executar fix_dione_membership.sql'
    END as membership_status
FROM communities c
JOIN auth.users u ON u.id = c.owner_id
WHERE u.email = 'dione@xack.com';

-- 4. Verificar políticas RLS de SELECT
SELECT 
    'RLS POLICIES' as check_type,
    policyname,
    CASE 
        WHEN qual = 'true' THEN '✅ Permite SELECT para todos'
        ELSE '⚠️ Política restritiva: ' || qual
    END as policy_status
FROM pg_policies
WHERE tablename = 'community_members'
AND cmd = 'SELECT';

-- 5. Teste de inserção (simular solicitação)
-- ATENÇÃO: Isso vai criar uma solicitação de teste!
-- Comente esta seção se não quiser criar dados de teste
/*
INSERT INTO community_members (community_id, user_id, status)
SELECT 
    c.id,
    (SELECT id FROM auth.users WHERE email = 'marcela@xack.com' LIMIT 1),
    'pending'
FROM communities c
WHERE c.owner_id = (SELECT id FROM auth.users WHERE email = 'dione@xack.com' LIMIT 1)
LIMIT 1
ON CONFLICT (community_id, user_id) DO NOTHING
RETURNING 
    'TEST INSERT' as check_type,
    '✅ Solicitação de teste criada - Verifique se a notificação apareceu!' as status;
*/
