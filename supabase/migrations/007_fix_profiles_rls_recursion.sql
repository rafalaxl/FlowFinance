-- Migration 007: Fix Infinite Recursion in Profiles RLS Policies
-- Crie a função helper para obter a role do usuário logado de forma segura
CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS public.user_role LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
    v_role public.user_role;
BEGIN
    SELECT role INTO v_role FROM public.profiles WHERE id = public.auth_user_id() LIMIT 1;
    RETURN v_role;
END;
$$;

-- Dropa as antigas políticas recursivas da tabela profiles
DROP POLICY IF EXISTS "profiles_select_same_tenant" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_owner" ON public.profiles;

-- Recria as políticas usando as funções SECURITY DEFINER robustas para evitar recursão
CREATE POLICY "profiles_select_same_tenant" ON public.profiles
    FOR SELECT USING (
        tenant_id = public.auth_tenant_id()
    );

CREATE POLICY "profiles_update_admin" ON public.profiles
    FOR UPDATE USING (
        tenant_id = public.auth_tenant_id() AND public.auth_user_role() IN ('owner', 'admin')
    );

CREATE POLICY "profiles_delete_owner" ON public.profiles
    FOR DELETE USING (
        id = auth.uid()
        OR (tenant_id = public.auth_tenant_id() AND public.auth_user_role() = 'owner')
    );
