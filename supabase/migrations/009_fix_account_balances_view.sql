-- Migration 009: Fix v_account_balances view column names to match TypeScript types
CREATE OR REPLACE VIEW public.v_account_balances AS
SELECT
    a.tenant_id,
    a.id              AS id,
    a.name            AS name,
    a.type            AS type,
    a.currency,
    a.balance         AS balance,
    COUNT(t.id) FILTER (WHERE t.status = 'pending') AS pending_count
FROM public.accounts a
LEFT JOIN public.transactions t ON t.account_id = a.id
WHERE a.is_active = true
GROUP BY a.tenant_id, a.id, a.name, a.type, a.currency, a.balance;
