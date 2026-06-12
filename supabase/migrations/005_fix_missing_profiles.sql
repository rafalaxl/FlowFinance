-- ============================================================
-- Migration 005: Fix Missing Profiles
-- Script para popular automaticamente tenants e profiles para
-- usuários existentes que não foram capturados pelo trigger antigo.
-- ============================================================

DO $$
DECLARE
    u record;
    new_tenant_id uuid;
BEGIN
    FOR u IN
        SELECT id, email, raw_user_meta_data 
        FROM auth.users 
        WHERE id NOT IN (SELECT id FROM public.profiles)
    LOOP
        -- Cria um tenant para o usuário isolado
        INSERT INTO public.tenants (name, slug, plan)
        VALUES (
            COALESCE(u.raw_user_meta_data->>'full_name', 'Meu Negócio') || ' - Tenant',
            'tenant-' || u.id,
            'free'
        )
        RETURNING id INTO new_tenant_id;

        -- Insere o perfil como owner do novo tenant
        INSERT INTO public.profiles (id, tenant_id, email, full_name, role)
        VALUES (
            u.id,
            new_tenant_id,
            u.email,
            COALESCE(u.raw_user_meta_data->>'full_name', ''),
            'owner'
        );
    END LOOP;
END;
$$;
