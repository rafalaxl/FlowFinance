-- ============================================================
-- Migration 003: transactions
-- FlowFinance SaaS — Multi-tenant B2B
-- Depende de: 001, 002
-- ============================================================

-- ── ENUM: status da transação ─────────────────────────────
CREATE TYPE transaction_status AS ENUM (
    'pending',
    'completed',
    'cancelled'
);

-- ── TABELA: transactions ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
    id               uuid               PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        uuid               NOT NULL DEFAULT public.auth_tenant_id() REFERENCES public.tenants(id) ON DELETE CASCADE,
    account_id       uuid               NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    category_id      uuid               REFERENCES public.categories(id) ON DELETE SET NULL,
    user_id          uuid               NOT NULL DEFAULT auth_user_id() REFERENCES auth.users(id) ON DELETE RESTRICT,
    amount           numeric(15,2)      NOT NULL CHECK (amount > 0),
    description      text               NOT NULL,
    type             flow_type          NOT NULL,
    status           transaction_status NOT NULL DEFAULT 'pending',
    transaction_date date               NOT NULL DEFAULT CURRENT_DATE,
    due_date         date,
    notes            text,
    created_at       timestamptz        NOT NULL DEFAULT now(),
    updated_at       timestamptz        NOT NULL DEFAULT now()
);

-- ── ÍNDICES DE PERFORMANCE ────────────────────────────────
-- Acesso por tenant (base de todo filtro de isolamento)
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_id
    ON public.transactions(tenant_id);

-- KPI: Burn Rate / Saldo — filtro por conta e data
CREATE INDEX IF NOT EXISTS idx_transactions_account_date
    ON public.transactions(account_id, transaction_date DESC);

-- KPI: Contas a Pagar/Receber — status + due_date
CREATE INDEX IF NOT EXISTS idx_transactions_status_due
    ON public.transactions(tenant_id, status, due_date)
    WHERE status = 'pending';

-- KPI: EBITDA Projetado — tipo e mês
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_type_date
    ON public.transactions(tenant_id, type, transaction_date DESC);

-- Filtro por categoria (relatórios analíticos)
CREATE INDEX IF NOT EXISTS idx_transactions_category_id
    ON public.transactions(category_id);

-- Busca por usuário que criou a transação
CREATE INDEX IF NOT EXISTS idx_transactions_user_id
    ON public.transactions(user_id);

-- ── TRIGGER: updated_at ───────────────────────────────────
CREATE TRIGGER trg_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── TRIGGER: sincronizar saldo da conta ───────────────────
-- Atualiza accounts.balance ao inserir/atualizar/deletar
CREATE OR REPLACE FUNCTION public.sync_account_balance()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'completed' THEN
        UPDATE public.accounts SET balance = balance +
            CASE WHEN NEW.type = 'income' THEN NEW.amount ELSE -NEW.amount END
        WHERE id = NEW.account_id;

    ELSIF TG_OP = 'UPDATE' THEN
        -- Reverte impacto antigo se estava 'completed'
        IF OLD.status = 'completed' THEN
            UPDATE public.accounts SET balance = balance -
                CASE WHEN OLD.type = 'income' THEN OLD.amount ELSE -OLD.amount END
            WHERE id = OLD.account_id;
        END IF;
        -- Aplica novo impacto se agora é 'completed'
        IF NEW.status = 'completed' THEN
            UPDATE public.accounts SET balance = balance +
                CASE WHEN NEW.type = 'income' THEN NEW.amount ELSE -NEW.amount END
            WHERE id = NEW.account_id;
        END IF;

    ELSIF TG_OP = 'DELETE' AND OLD.status = 'completed' THEN
        UPDATE public.accounts SET balance = balance -
            CASE WHEN OLD.type = 'income' THEN OLD.amount ELSE -OLD.amount END
        WHERE id = OLD.account_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_sync_account_balance
    AFTER INSERT OR UPDATE OR DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.sync_account_balance();

-- ── RLS: transactions ─────────────────────────────────────
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- SELECT: qualquer membro do tenant vê transações do tenant
CREATE POLICY "transactions_select_tenant" ON public.transactions
    FOR SELECT USING (tenant_id = public.auth_tenant_id());

-- INSERT: usuário logado cria transações atreladas ao seu uid no próprio tenant
CREATE POLICY "transactions_insert_policy" ON public.transactions
    FOR INSERT WITH CHECK (
        tenant_id = public.auth_tenant_id()
        AND user_id = auth_user_id()
    );

-- UPDATE: criador pode editar; admin/owner podem editar qualquer uma do tenant
CREATE POLICY "transactions_update_own_or_admin" ON public.transactions
    FOR UPDATE USING (
        tenant_id = public.auth_tenant_id()
        AND (
            user_id = auth_user_id()
            OR EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth_user_id() AND role IN ('owner', 'admin')
            )
        )
    );

-- DELETE: criador ou admin/owner podem excluir transações do tenant
CREATE POLICY "transactions_delete_own_or_admin" ON public.transactions
    FOR DELETE USING (
        tenant_id = public.auth_tenant_id()
        AND (
            user_id = auth_user_id()
            OR EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth_user_id() AND role IN ('owner', 'admin')
            )
        )
    );

-- ── VIEW: KPI — saldo consolidado por conta ───────────────
CREATE OR REPLACE VIEW public.v_account_balances AS
SELECT
    a.tenant_id,
    a.id              AS account_id,
    a.name            AS account_name,
    a.type            AS account_type,
    a.currency,
    a.balance         AS current_balance,
    COUNT(t.id) FILTER (WHERE t.status = 'pending') AS pending_count
FROM public.accounts a
LEFT JOIN public.transactions t ON t.account_id = a.id
WHERE a.is_active = true
GROUP BY a.tenant_id, a.id, a.name, a.type, a.currency, a.balance;
