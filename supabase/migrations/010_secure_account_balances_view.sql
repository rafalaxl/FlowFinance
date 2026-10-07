-- ============================================================
-- Migration 010: Secure Account Balances View (BUG-01)
-- Recreates v_account_balances with security_invoker = true
-- and enforces tenant matching on transactions join.
-- ============================================================

DROP VIEW IF EXISTS public.v_account_balances CASCADE;

CREATE OR REPLACE VIEW public.v_account_balances
WITH (security_invoker = true) AS
SELECT
    a.tenant_id,
    a.id              AS id,
    a.name            AS name,
    a.type            AS type,
    a.currency,
    a.balance         AS balance,
    COUNT(t.id) FILTER (WHERE t.status = 'pending') AS pending_count
FROM public.accounts a
LEFT JOIN public.transactions t 
    ON t.account_id = a.id 
   AND t.tenant_id = a.tenant_id
WHERE a.is_active = true
GROUP BY a.tenant_id, a.id, a.name, a.type, a.currency, a.balance;

-- Revoke public/anon access and grant strictly to authenticated users
REVOKE ALL ON public.v_account_balances FROM anon, public;
GRANT SELECT ON public.v_account_balances TO authenticated;
