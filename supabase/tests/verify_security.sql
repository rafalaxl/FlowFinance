-- ============================================================
-- FlowFinance SaaS — Verificação de Segurança e RLS
-- ============================================================
-- Execute este script no SQL Editor para verificar se as correções
-- de segurança (BUG-01 a BUG-06) estão ativas e consistentes.
-- ============================================================

-- 1. Verificar se a view v_account_balances possui security_invoker = true
SELECT 
    c.relname AS view_name,
    c.reloptions AS configuration,
    CASE 
        WHEN 'security_invoker=true' = ANY(c.reloptions) THEN '✅ ATIVO (security_invoker)'
        ELSE '❌ VULNERÁVEL (definer)'
    END AS status_seguranca
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'v_account_balances';

-- 2. Verificar permissões da view (anon bloqueado, apenas authenticated lê)
SELECT 
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public' AND table_name = 'v_account_balances';

-- 3. Verificar bloqueio de colunas sensíveis em profiles e tenants (BUG-02)
SELECT 
    table_name,
    column_name,
    privilege_type,
    grantee
FROM information_schema.column_privileges
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'tenants')
  AND privilege_type = 'UPDATE'
ORDER BY table_name, column_name;

-- 4. Verificar se RLS está ativo em todas as tabelas públicas
SELECT 
    tablename,
    rowsecurity AS rls_ativo
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 5. Listar todas as Políticas de RLS ativas
SELECT 
    tablename,
    policyname,
    cmd AS operacao,
    roles,
    with_check IS NOT NULL AS possui_with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. Verificar search_path das funções SECURITY DEFINER (BUG-06)
SELECT 
    p.proname AS funcao,
    p.prosecdef AS security_definer,
    p.proconfig AS configuracoes_search_path,
    CASE 
        WHEN p.proconfig @> ARRAY['search_path=public, pg_temp'] THEN '✅ SEGURO'
        ELSE '⚠️ VERIFICAR'
    END AS avaliacao
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' AND p.prosecdef = true
ORDER BY p.proname;

-- 7. Verificar integridade dos Triggers essenciais
SELECT 
    t.tgname AS nome_trigger,
    c.relname AS tabela,
    p.proname AS funcao_executada
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname IN ('trg_on_auth_user_created', 'trg_sync_account_balance');
