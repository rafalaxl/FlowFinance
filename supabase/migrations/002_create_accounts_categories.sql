-- ============================================================
-- Migration 002: accounts + categories
-- FlowFinance SaaS — Multi-tenant B2B
-- Depende de: 001_create_tenants_profiles.sql
-- ============================================================

-- ── ENUM: tipos de conta ───────────────────────────────────
CREATE TYPE account_type AS ENUM (
    'checking',     -- conta corrente
    'savings',      -- poupança
    'credit_card',  -- cartão de crédito
    'investment',   -- investimento
    'cash',         -- caixa físico
    'other'
);

-- ── ENUM: tipos de categoria / transação ──────────────────
CREATE TYPE flow_type AS ENUM ('income', 'expense');

-- ── TABELA: accounts ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.accounts (
    id           uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id    uuid         NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name         text         NOT NULL,
    type         account_type NOT NULL DEFAULT 'checking',
    balance      numeric(15,2) NOT NULL DEFAULT 0.00,
    currency     char(3)      NOT NULL DEFAULT 'BRL',
    bank_name    text,
    is_active    boolean      NOT NULL DEFAULT true,
    created_at   timestamptz  NOT NULL DEFAULT now(),
    updated_at   timestamptz  NOT NULL DEFAULT now()
);

-- ── TABELA: categories ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   uuid        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name        text        NOT NULL,
    type        flow_type   NOT NULL,
    color       char(7)     NOT NULL DEFAULT '#6366f1', -- hex color
    icon        text,
    is_active   boolean     NOT NULL DEFAULT true,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, name, type)
);

-- ── ÍNDICES ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_accounts_tenant_id   ON public.accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type        ON public.accounts(type);
CREATE INDEX IF NOT EXISTS idx_categories_tenant_id ON public.categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_categories_type      ON public.categories(type);

-- ── TRIGGERS: updated_at ──────────────────────────────────
CREATE TRIGGER trg_accounts_updated_at
    BEFORE UPDATE ON public.accounts
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── HELPER: retorna tenant_id do usuário autenticado ───────
CREATE OR REPLACE FUNCTION public.auth_tenant_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT tenant_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- ── RLS: accounts ──────────────────────────────────────────
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "accounts_select_tenant" ON public.accounts
    FOR SELECT USING (tenant_id = public.auth_tenant_id());

CREATE POLICY "accounts_insert_tenant" ON public.accounts
    FOR INSERT WITH CHECK (tenant_id = public.auth_tenant_id());

-- Apenas admin/owner podem atualizar contas
CREATE POLICY "accounts_update_admin" ON public.accounts
    FOR UPDATE USING (
        tenant_id = public.auth_tenant_id()
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Apenas owner pode deletar contas
CREATE POLICY "accounts_delete_owner" ON public.accounts
    FOR DELETE USING (
        tenant_id = public.auth_tenant_id()
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- ── RLS: categories ────────────────────────────────────────
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_tenant" ON public.categories
    FOR SELECT USING (tenant_id = public.auth_tenant_id());

-- Analyst e acima podem criar categorias
CREATE POLICY "categories_insert_analyst" ON public.categories
    FOR INSERT WITH CHECK (
        tenant_id = public.auth_tenant_id()
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('owner', 'admin', 'analyst')
        )
    );

CREATE POLICY "categories_update_analyst" ON public.categories
    FOR UPDATE USING (
        tenant_id = public.auth_tenant_id()
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('owner', 'admin', 'analyst')
        )
    );

CREATE POLICY "categories_delete_admin" ON public.categories
    FOR DELETE USING (
        tenant_id = public.auth_tenant_id()
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
    );
