-- ============================================================
-- Migration 011: Lock Profile Privileged Columns (BUG-02)
-- Prevents tenant_id and role tampering on profiles,
-- restricts tenant column updates, and creates change_member_role RPC.
-- ============================================================

-- 1. Restringir permissões de UPDATE em public.profiles
REVOKE UPDATE ON public.profiles FROM authenticated, anon;
GRANT UPDATE (full_name, avatar_url) ON public.profiles TO authenticated;

-- 2. Recriar policy profiles_update_own com WITH CHECK
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- 3. Proteger a tabela public.tenants: apenas coluna 'name' pode ser alterada
REVOKE UPDATE ON public.tenants FROM authenticated, anon;
GRANT UPDATE (name) ON public.tenants TO authenticated;

DROP POLICY IF EXISTS "tenants_update_admin" ON public.tenants;
CREATE POLICY "tenants_update_admin" ON public.tenants
    FOR UPDATE
    USING (
        id = public.auth_tenant_id() 
        AND public.auth_user_role() IN ('owner', 'admin')
    )
    WITH CHECK (
        id = public.auth_tenant_id() 
        AND public.auth_user_role() IN ('owner', 'admin')
    );

-- 4. RPC segura para alteração controlada de role de membro
CREATE OR REPLACE FUNCTION public.change_member_role(
    p_member_id uuid,
    p_new_role public.user_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_tenant uuid;
    v_caller_role   public.user_role;
    v_target_tenant uuid;
    v_target_role   public.user_role;
BEGIN
    v_caller_tenant := public.auth_tenant_id();
    v_caller_role   := public.auth_user_role();

    IF v_caller_role NOT IN ('owner', 'admin') THEN
        RAISE EXCEPTION 'Acesso negado: apenas administradores e proprietários podem gerenciar cargos.';
    END IF;

    SELECT tenant_id, role INTO v_target_tenant, v_target_role
    FROM public.profiles
    WHERE id = p_member_id;

    IF v_target_tenant IS NULL OR v_target_tenant <> v_caller_tenant THEN
        RAISE EXCEPTION 'Membro não encontrado neste tenant.';
    END IF;

    IF v_target_role = 'owner' AND v_caller_role <> 'owner' THEN
        RAISE EXCEPTION 'Apenas o proprietário pode alterar o cargo de outro proprietário.';
    END IF;

    IF p_new_role = 'owner' AND v_caller_role <> 'owner' THEN
        RAISE EXCEPTION 'Apenas o proprietário pode transferir ou promover outro usuário para proprietário.';
    END IF;

    UPDATE public.profiles
    SET role = p_new_role,
        updated_at = now()
    WHERE id = p_member_id
      AND tenant_id = v_caller_tenant;
END;
$$;

REVOKE ALL ON FUNCTION public.change_member_role(uuid, public.user_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.change_member_role(uuid, public.user_role) TO authenticated;
