-- ============================================================
-- Migration 012: Harden handle_new_user Trigger (BUG-03)
-- Ignores any tenant_id or role injected in user metadata.
-- Always generates a fresh tenant and sets role to 'owner'.
-- Protects search_path with public, pg_temp.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_tenant_id uuid;
    v_full_name text;
    v_company_name text;
BEGIN
    -- Extrai exclusivamente full_name da metadata do signup (ignora tenant_id e role)
    v_full_name := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''), 'Meu Negócio');
    v_company_name := v_full_name || ' - Tenant';

    -- Sempre auto-cria um tenant isolado e exclusivo para o novo cadastro
    INSERT INTO public.tenants (name, slug, plan)
    VALUES (
        v_company_name,
        'tenant-' || NEW.id,
        'free'
    )
    RETURNING id INTO v_tenant_id;

    -- Cria o profile vinculado ao seu próprio tenant com role 'owner'
    INSERT INTO public.profiles (id, tenant_id, email, full_name, role)
    VALUES (
        NEW.id,
        v_tenant_id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        'owner'
    );

    RETURN NEW;
END;
$$;

-- Recriar o trigger associado na tabela auth.users
DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
