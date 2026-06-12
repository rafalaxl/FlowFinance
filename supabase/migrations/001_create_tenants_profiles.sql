-- ============================================================
-- Migration 001: tenants + profiles
-- FlowFinance SaaS — Multi-tenant B2B
-- ============================================================

-- ── EXTENSÕES ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── ENUM: planos de tenant ─────────────────────────────────
CREATE TYPE tenant_plan AS ENUM ('free', 'starter', 'pro', 'enterprise');

-- ── ENUM: roles de usuário ─────────────────────────────────
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'analyst', 'viewer');

-- ── TABELA: tenants ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tenants (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text        NOT NULL,
    slug        text        UNIQUE NOT NULL,
    plan        tenant_plan NOT NULL DEFAULT 'free',
    is_active   boolean     NOT NULL DEFAULT true,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ── TABELA: profiles ───────────────────────────────────────
-- Espelha auth.users; criado via trigger após signup
CREATE TABLE IF NOT EXISTS public.profiles (
    id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id   uuid        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    email       text        NOT NULL,
    full_name   text,
    role        user_role   NOT NULL DEFAULT 'viewer',
    avatar_url  text,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ── ÍNDICES ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email     ON public.profiles(email);

-- ── TRIGGER: updated_at automático ────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_tenants_updated_at
    BEFORE UPDATE ON public.tenants
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── TRIGGER: auto-criar profile no signup ─────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_tenant_id uuid;
BEGIN
    -- Lê tenant_id dos metadados do signup (raw_user_meta_data)
    v_tenant_id := (NEW.raw_user_meta_data->>'tenant_id')::uuid;

    -- Só insere se tenant_id foi fornecido no signup
    IF v_tenant_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, tenant_id, email, full_name, role)
        VALUES (
            NEW.id,
            v_tenant_id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
            COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'viewer')
        );
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── RLS: tenants ───────────────────────────────────────────
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Usuário vê apenas o próprio tenant (via profile)
CREATE POLICY "tenants_select_own" ON public.tenants
    FOR SELECT USING (
        id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    );

-- Somente owner/admin podem atualizar o tenant
CREATE POLICY "tenants_update_admin" ON public.tenants
    FOR UPDATE USING (
        id IN (
            SELECT tenant_id FROM public.profiles
            WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- INSERT bloqueado via RLS — tenants criados apenas por service_role
CREATE POLICY "tenants_insert_service" ON public.tenants
    FOR INSERT WITH CHECK (false);

-- DELETE bloqueado via RLS
CREATE POLICY "tenants_delete_blocked" ON public.tenants
    FOR DELETE USING (false);

-- ── RLS: profiles ──────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Usuário vê apenas profiles do mesmo tenant
CREATE POLICY "profiles_select_same_tenant" ON public.profiles
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    );

-- Usuário atualiza apenas o próprio profile
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (id = auth.uid());

-- Admin pode atualizar roles de membros do mesmo tenant
CREATE POLICY "profiles_update_admin" ON public.profiles
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM public.profiles
            WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- INSERT via trigger (service_role) — bloqueado para usuários diretos
CREATE POLICY "profiles_insert_trigger" ON public.profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- DELETE apenas pelo próprio usuário ou owner
CREATE POLICY "profiles_delete_owner" ON public.profiles
    FOR DELETE USING (
        id = auth.uid()
        OR tenant_id IN (
            SELECT tenant_id FROM public.profiles
            WHERE id = auth.uid() AND role = 'owner'
        )
    );
