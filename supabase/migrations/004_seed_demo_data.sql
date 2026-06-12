-- ============================================================
-- Migration 004: Seed de demonstração — FlowFinance SaaS
-- ATENÇÃO: Execute APENAS em ambiente de desenvolvimento.
-- Comando: supabase db reset --linked (ou via SQL Editor no Supabase Studio)
-- NÃO execute em produção.
-- ============================================================

-- ── NOTA SOBRE auth.users ─────────────────────────────────
-- Os registros em auth.users são criados pelo Supabase Auth.
-- Em dev/test, use UUIDs fixos inseridos diretamente.
-- Em produção, o trigger handle_new_user cria o profile automaticamente.

-- ── IDs FIXOS PARA SEED ───────────────────────────────────
DO $$
DECLARE
    v_tenant_id    uuid := 'a0000000-0000-0000-0000-000000000001';
    v_owner_id     uuid := 'b0000000-0000-0000-0000-000000000001';
    v_admin_id     uuid := 'b0000000-0000-0000-0000-000000000002';
    v_analyst_id   uuid := 'b0000000-0000-0000-0000-000000000003';
    v_acc_check    uuid := 'c0000000-0000-0000-0000-000000000001';
    v_acc_savings  uuid := 'c0000000-0000-0000-0000-000000000002';
    v_cat_salary   uuid := 'd0000000-0000-0000-0000-000000000001';
    v_cat_services uuid := 'd0000000-0000-0000-0000-000000000002';
    v_cat_rent     uuid := 'd0000000-0000-0000-0000-000000000003';
    v_cat_software uuid := 'd0000000-0000-0000-0000-000000000004';
    v_cat_revenue  uuid := 'd0000000-0000-0000-0000-000000000005';
BEGIN

-- ── 1. TENANT ─────────────────────────────────────────────
INSERT INTO public.tenants (id, name, slug, plan)
VALUES (v_tenant_id, 'Acme Corp Ltda', 'acme-corp', 'pro')
ON CONFLICT (id) DO NOTHING;

-- ── 2. USUÁRIOS DEMO em auth.users (apenas dev) ───────────
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at)
VALUES
    (v_owner_id,   'owner@acme.dev',   crypt('Demo@1234', gen_salt('bf')), now(),
     jsonb_build_object('tenant_id', v_tenant_id, 'full_name', 'Carlos Owner', 'role', 'owner'), now(), now()),
    (v_admin_id,   'admin@acme.dev',   crypt('Demo@1234', gen_salt('bf')), now(),
     jsonb_build_object('tenant_id', v_tenant_id, 'full_name', 'Ana Admin', 'role', 'admin'), now(), now()),
    (v_analyst_id, 'analyst@acme.dev', crypt('Demo@1234', gen_salt('bf')), now(),
     jsonb_build_object('tenant_id', v_tenant_id, 'full_name', 'Bruno Analyst', 'role', 'analyst'), now(), now())
ON CONFLICT (id) DO NOTHING;

-- ── 3. PROFILES (criados pelo trigger; inserção manual p/ seed) ──
INSERT INTO public.profiles (id, tenant_id, email, full_name, role)
VALUES
    (v_owner_id,   v_tenant_id, 'owner@acme.dev',   'Carlos Owner',  'owner'),
    (v_admin_id,   v_tenant_id, 'admin@acme.dev',   'Ana Admin',     'admin'),
    (v_analyst_id, v_tenant_id, 'analyst@acme.dev', 'Bruno Analyst', 'analyst')
ON CONFLICT (id) DO NOTHING;

-- ── 4. CONTAS BANCÁRIAS ───────────────────────────────────
INSERT INTO public.accounts (id, tenant_id, name, type, balance, currency, bank_name)
VALUES
    (v_acc_check,   v_tenant_id, 'Conta Corrente Principal', 'checking',  85000.00, 'BRL', 'Banco do Brasil'),
    (v_acc_savings, v_tenant_id, 'Reserva de Emergência',    'savings',   40000.00, 'BRL', 'Nubank')
ON CONFLICT (id) DO NOTHING;

-- ── 5. CATEGORIAS ─────────────────────────────────────────
INSERT INTO public.categories (id, tenant_id, name, type, color)
VALUES
    (v_cat_salary,   v_tenant_id, 'Salários e Pró-labore', 'expense', '#ef4444'),
    (v_cat_services, v_tenant_id, 'Serviços Prestados',    'income',  '#22c55e'),
    (v_cat_rent,     v_tenant_id, 'Aluguel e Imóveis',     'expense', '#f97316'),
    (v_cat_software, v_tenant_id, 'Software e SaaS',       'expense', '#a855f7'),
    (v_cat_revenue,  v_tenant_id, 'Receita de Produtos',   'income',  '#3b82f6')
ON CONFLICT (id) DO NOTHING;

-- ── 6. TRANSAÇÕES (20 lançamentos) ───────────────────────
INSERT INTO public.transactions
    (tenant_id, account_id, category_id, user_id, amount, description, type, status, transaction_date)
VALUES
    -- Receitas completadas
    (v_tenant_id, v_acc_check, v_cat_services, v_owner_id,  18500.00, 'Contrato Mensal — Cliente Alpha',   'income',  'completed', CURRENT_DATE - 30),
    (v_tenant_id, v_acc_check, v_cat_revenue,  v_owner_id,   9200.00, 'Venda de Licenças Q2',              'income',  'completed', CURRENT_DATE - 25),
    (v_tenant_id, v_acc_check, v_cat_services, v_admin_id,  12000.00, 'Projeto Beta — Fase 1',             'income',  'completed', CURRENT_DATE - 20),
    (v_tenant_id, v_acc_check, v_cat_revenue,  v_admin_id,   5500.00, 'Add-ons e upgrades de plano',       'income',  'completed', CURRENT_DATE - 18),
    (v_tenant_id, v_acc_check, v_cat_services, v_analyst_id, 8800.00, 'Consultoria Financeira — Cliente D','income',  'completed', CURRENT_DATE - 10),
    (v_tenant_id, v_acc_check, v_cat_revenue,  v_owner_id,  15000.00, 'Contrato Anual — Cliente Gamma',    'income',  'completed', CURRENT_DATE - 5),
    (v_tenant_id, v_acc_check, v_cat_services, v_admin_id,   3200.00, 'Suporte Premium — Lote Junho',      'income',  'completed', CURRENT_DATE - 2),
    -- Despesas completadas
    (v_tenant_id, v_acc_check, v_cat_salary,   v_owner_id,  22000.00, 'Folha de Pagamento — Maio',         'expense', 'completed', CURRENT_DATE - 28),
    (v_tenant_id, v_acc_check, v_cat_rent,     v_owner_id,   4500.00, 'Aluguel Escritório — Maio',         'expense', 'completed', CURRENT_DATE - 27),
    (v_tenant_id, v_acc_check, v_cat_software, v_admin_id,    890.00, 'Assinatura AWS — Maio',             'expense', 'completed', CURRENT_DATE - 26),
    (v_tenant_id, v_acc_check, v_cat_software, v_admin_id,    299.00, 'Supabase Pro — Maio',               'expense', 'completed', CURRENT_DATE - 24),
    (v_tenant_id, v_acc_check, v_cat_software, v_analyst_id,  199.00, 'GitHub Teams — Maio',               'expense', 'completed', CURRENT_DATE - 22),
    (v_tenant_id, v_acc_check, v_cat_salary,   v_owner_id,  22000.00, 'Folha de Pagamento — Junho',        'expense', 'completed', CURRENT_DATE - 1),
    -- Pendentes (Contas a Pagar/Receber da semana)
    (v_tenant_id, v_acc_check, v_cat_rent,     v_admin_id,   4500.00, 'Aluguel Escritório — Junho',        'expense', 'pending',   CURRENT_DATE + 3),
    (v_tenant_id, v_acc_check, v_cat_software, v_admin_id,    890.00, 'Assinatura AWS — Junho',            'expense', 'pending',   CURRENT_DATE + 5),
    (v_tenant_id, v_acc_check, v_cat_services, v_analyst_id,14000.00, 'NF Projeto Beta — Fase 2',          'income',  'pending',   CURRENT_DATE + 2),
    (v_tenant_id, v_acc_check, v_cat_revenue,  v_owner_id,   6500.00, 'Renovação de Contrato — Cliente E', 'income',  'pending',   CURRENT_DATE + 6),
    -- Poupança (movimentações)
    (v_tenant_id, v_acc_savings, v_cat_revenue, v_owner_id, 10000.00, 'Aporte Reserva Q2',                 'income',  'completed', CURRENT_DATE - 15),
    (v_tenant_id, v_acc_savings, v_cat_revenue, v_owner_id,  5000.00, 'Aporte Reserva Junho',              'income',  'completed', CURRENT_DATE - 8),
    -- Cancelada (exemplo de reconciliação)
    (v_tenant_id, v_acc_check, v_cat_software, v_analyst_id,  450.00, 'Ferramenta cancelada — duplicata',  'expense', 'cancelled', CURRENT_DATE - 12);

END $$;
