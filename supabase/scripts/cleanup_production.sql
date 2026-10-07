-- ============================================================
-- FlowFinance SaaS — Script de Limpeza de Produção (Idempotente)
-- ============================================================
-- Remove dados fictícios da Acme Corp e redefine saldos/transações de testes.
-- Executar via SQL Editor no Supabase Studio com privilégios de service_role/admin.
-- ============================================================

BEGIN;

-- 1. Identificar e remover registros relacionados à Acme Corp
DO $$
DECLARE
    v_acme_tenant_id uuid;
BEGIN
    -- Busca ID do tenant da Acme Corp se existir
    SELECT id INTO v_acme_tenant_id 
    FROM public.tenants 
    WHERE id = 'a0000000-0000-0000-0000-000000000001' OR slug = 'acme-corp'
    LIMIT 1;

    -- Deletar transações da Acme Corp
    IF v_acme_tenant_id IS NOT NULL THEN
        DELETE FROM public.transactions WHERE tenant_id = v_acme_tenant_id;
        DELETE FROM public.categories WHERE tenant_id = v_acme_tenant_id;
        DELETE FROM public.accounts WHERE tenant_id = v_acme_tenant_id;
        DELETE FROM public.profiles WHERE tenant_id = v_acme_tenant_id;
        DELETE FROM public.tenants WHERE id = v_acme_tenant_id;
    END IF;

    -- Deletar transações remanescentes de usuários @acme.dev
    DELETE FROM public.transactions 
    WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE '%@acme.dev');

    -- Deletar perfis remanescentes de usuários @acme.dev
    DELETE FROM public.profiles 
    WHERE email LIKE '%@acme.dev' 
       OR id IN ('b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003');

    -- Deletar contas de autenticação do Supabase Auth (@acme.dev)
    DELETE FROM auth.users 
    WHERE email LIKE '%@acme.dev'
       OR id IN ('b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003');

    RAISE NOTICE 'Limpeza de dados da Acme Corp concluída com sucesso.';
END $$;

-- 2. Zerar transações de contas de teste e resetar saldos das contas bancárias
DO $$
DECLARE
    v_test_count integer;
BEGIN
    -- Apaga transações criadas durante os testes dos testadores (mantendo seus logins e perfis)
    DELETE FROM public.transactions
    WHERE tenant_id IN (
        SELECT id FROM public.tenants 
        WHERE slug LIKE 'tenant-%' OR name LIKE '%Meu Negócio%' OR name LIKE '%Test%'
    );
    GET DIAGNOSTICS v_test_count = ROW_COUNT;

    -- Reseta saldos de contas existentes de testadores para 0.00
    UPDATE public.accounts
    SET balance = 0.00,
        updated_at = now()
    WHERE tenant_id IN (
        SELECT id FROM public.tenants 
        WHERE slug LIKE 'tenant-%' OR name LIKE '%Meu Negócio%' OR name LIKE '%Test%'
    );

    RAISE NOTICE 'Transações de teste removidas: %, saldos resetados para 0.00.', v_test_count;
END $$;

COMMIT;
