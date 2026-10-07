-- ============================================================
-- Migration 014: Enforce search_path on SECURITY DEFINER Functions (BUG-06)
-- Configures search_path = public, pg_temp idempotently across all
-- SECURITY DEFINER functions to mitigate search_path hijacking.
-- ============================================================

-- Configuração explícita nas funções centrais
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'auth_user_id') THEN
        ALTER FUNCTION public.auth_user_id() SET search_path = public, pg_temp;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'auth_tenant_id') THEN
        ALTER FUNCTION public.auth_tenant_id() SET search_path = public, pg_temp;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'auth_user_role') THEN
        ALTER FUNCTION public.auth_user_role() SET search_path = public, pg_temp;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'handle_new_user') THEN
        ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'sync_account_balance') THEN
        ALTER FUNCTION public.sync_account_balance() SET search_path = public, pg_temp;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'change_member_role') THEN
        ALTER FUNCTION public.change_member_role(uuid, public.user_role) SET search_path = public, pg_temp;
    END IF;
END;
$$;

-- Varredura dinâmica idempotente para qualquer outra função SECURITY DEFINER em public
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT 
            p.proname, 
            pg_catalog.pg_get_function_identity_arguments(p.oid) AS args
        FROM pg_catalog.pg_proc p
        JOIN pg_catalog.pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
          AND p.prosecdef = true
    LOOP
        EXECUTE format('ALTER FUNCTION public.%I(%s) SET search_path = public, pg_temp;', r.proname, r.args);
    END LOOP;
END;
$$;
