-- ============================================================
-- Migration 013: Transactions FK Tenant Validation & Sync (BUG-04)
-- Enforces account_id and category_id tenant consistency in RLS WITH CHECK,
-- secures account/category update policies, and checks tenant_id in balance sync.
-- ============================================================

-- 0. Garante a função helper public.auth_user_id() para compatibilidade legada
CREATE OR REPLACE FUNCTION public.auth_user_id()
RETURNS uuid LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp AS $$
BEGIN
    RETURN auth.uid();
END;
$$;

-- Garante que o DEFAULT de transactions.user_id aponte nativamente para auth.uid()
ALTER TABLE public.transactions ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 1. Recria policies de INSERT, UPDATE e DELETE em transactions usando auth.uid()
DROP POLICY IF EXISTS "transactions_insert_policy" ON public.transactions;
CREATE POLICY "transactions_insert_policy" ON public.transactions
    FOR INSERT
    WITH CHECK (
        tenant_id = public.auth_tenant_id()
        AND user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.accounts a
            WHERE a.id = account_id
              AND a.tenant_id = public.auth_tenant_id()
        )
        AND (
            category_id IS NULL OR EXISTS (
                SELECT 1 FROM public.categories c
                WHERE c.id = category_id
                  AND c.tenant_id = public.auth_tenant_id()
            )
        )
    );

DROP POLICY IF EXISTS "transactions_update_own_or_admin" ON public.transactions;
CREATE POLICY "transactions_update_own_or_admin" ON public.transactions
    FOR UPDATE
    USING (
        tenant_id = public.auth_tenant_id()
        AND (
            user_id = auth.uid()
            OR public.auth_user_role() IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        tenant_id = public.auth_tenant_id()
        AND (
            user_id = auth.uid()
            OR public.auth_user_role() IN ('owner', 'admin')
        )
        AND EXISTS (
            SELECT 1 FROM public.accounts a
            WHERE a.id = account_id
              AND a.tenant_id = public.auth_tenant_id()
        )
        AND (
            category_id IS NULL OR EXISTS (
                SELECT 1 FROM public.categories c
                WHERE c.id = category_id
                  AND c.tenant_id = public.auth_tenant_id()
            )
        )
    );

DROP POLICY IF EXISTS "transactions_delete_own_or_admin" ON public.transactions;
CREATE POLICY "transactions_delete_own_or_admin" ON public.transactions
    FOR DELETE USING (
        tenant_id = public.auth_tenant_id()
        AND (
            user_id = auth.uid()
            OR public.auth_user_role() IN ('owner', 'admin')
        )
    );

-- 2. Adiciona WITH CHECK nas policies de update de accounts e categories
DROP POLICY IF EXISTS "accounts_update_admin" ON public.accounts;
CREATE POLICY "accounts_update_admin" ON public.accounts
    FOR UPDATE
    USING (
        tenant_id = public.auth_tenant_id()
        AND public.auth_user_role() IN ('owner', 'admin')
    )
    WITH CHECK (
        tenant_id = public.auth_tenant_id()
        AND public.auth_user_role() IN ('owner', 'admin')
    );

DROP POLICY IF EXISTS "categories_update_analyst" ON public.categories;
CREATE POLICY "categories_update_analyst" ON public.categories
    FOR UPDATE
    USING (
        tenant_id = public.auth_tenant_id()
        AND public.auth_user_role() IN ('owner', 'admin', 'analyst')
    )
    WITH CHECK (
        tenant_id = public.auth_tenant_id()
        AND public.auth_user_role() IN ('owner', 'admin', 'analyst')
    );

-- 3. Atualiza trigger sync_account_balance para validar tenant_id
CREATE OR REPLACE FUNCTION public.sync_account_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'completed' THEN
        UPDATE public.accounts
        SET balance = balance + CASE WHEN NEW.type = 'income' THEN NEW.amount ELSE -NEW.amount END,
            updated_at = now()
        WHERE id = NEW.account_id
          AND tenant_id = NEW.tenant_id;

    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'completed' THEN
            UPDATE public.accounts
            SET balance = balance - CASE WHEN OLD.type = 'income' THEN OLD.amount ELSE -OLD.amount END,
                updated_at = now()
            WHERE id = OLD.account_id
              AND tenant_id = OLD.tenant_id;
        END IF;

        IF NEW.status = 'completed' THEN
            UPDATE public.accounts
            SET balance = balance + CASE WHEN NEW.type = 'income' THEN NEW.amount ELSE -NEW.amount END,
                updated_at = now()
            WHERE id = NEW.account_id
              AND tenant_id = NEW.tenant_id;
        END IF;

    ELSIF TG_OP = 'DELETE' AND OLD.status = 'completed' THEN
        UPDATE public.accounts
        SET balance = balance - CASE WHEN OLD.type = 'income' THEN OLD.amount ELSE -OLD.amount END,
            updated_at = now()
        WHERE id = OLD.account_id
              AND tenant_id = OLD.tenant_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;
