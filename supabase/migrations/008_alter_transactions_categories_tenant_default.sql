-- Migration 008: Set default tenant_id on transactions and categories tables
ALTER TABLE public.transactions ALTER COLUMN tenant_id SET DEFAULT public.auth_tenant_id();
ALTER TABLE public.categories ALTER COLUMN tenant_id SET DEFAULT public.auth_tenant_id();
