-- Migration to set default tenant_id on accounts table
ALTER TABLE public.accounts ALTER COLUMN tenant_id SET DEFAULT public.auth_tenant_id();
