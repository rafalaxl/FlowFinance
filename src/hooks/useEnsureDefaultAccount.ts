// ─── FlowFinance — useEnsureDefaultAccount ────────────────────────────────────
// Garante com segurança a existência de ao menos uma conta bancária ('Caixa Geral')
// para associar aos lançamentos financeiros, evitando duplicações ou loops.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useCallback } from 'react'
import { useAccounts, useCreateAccount } from './useAccounts'
import { useUIStore } from '../store/uiStore'

export function useEnsureDefaultAccount() {
  const { data: accounts, isLoading, isError } = useAccounts()
  const createAccount = useCreateAccount()
  const isDemoMode = useUIStore((s) => s.isDemoMode)
  const isCreatingRef = useRef(false)

  const ensureDefaultAccount = useCallback(async (): Promise<string> => {
    if (isDemoMode) {
      return accounts?.[0]?.id ?? 'c0000000-0000-0000-0000-000000000001'
    }

    if (accounts && accounts.length > 0) {
      return accounts[0].id
    }

    if (isCreatingRef.current) {
      throw new Error('Criação de conta em andamento.')
    }

    isCreatingRef.current = true
    try {
      // Criação segura sem enviar tenant_id nem user_id (tratado pelo banco)
      const created = await createAccount.mutateAsync({
        name: 'Caixa Geral',
        type: 'checking',
        balance: 0,
        currency: 'BRL',
      })
      return created.id
    } finally {
      isCreatingRef.current = false
    }
  }, [accounts, createAccount, isDemoMode])

  return {
    accounts,
    isLoading,
    isError,
    ensureDefaultAccount,
  }
}
