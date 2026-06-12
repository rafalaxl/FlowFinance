// ─── FlowFinance — useAccounts ────────────────────────────────────────────────
// Queries para contas bancárias e saldos consolidados via view.
// Usa a view `v_account_balances` para saldos e a tabela `accounts` para CRUD.
// ─────────────────────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabaseClient'
import type {
  Account,
  AccountBalanceRow,
  AccountInsert,
} from '../types/database.types'
import { useUIStore } from '../store/uiStore'
import { DEMO_ACCOUNTS } from '../services/demoData'

// ── Query Keys ────────────────────────────────────────────────────────────────

export const ACCOUNT_KEYS = {
  all:      () => ['accounts'] as const,
  list:     () => ['accounts', 'list'] as const,
  balances: () => ['accounts', 'balances'] as const,
  detail:   (id: string) => ['accounts', 'detail', id] as const,
}

// ── Service Helpers ───────────────────────────────────────────────────────────

async function fetchAccounts(): Promise<Account[]> {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('name')
  if (error) throw new Error(error.message)
  return data as Account[]
}

async function fetchAccountBalances(): Promise<AccountBalanceRow[]> {
  const { data, error } = await supabase
    .from('v_account_balances')
    .select('*')
    .order('name')
  if (error) throw new Error(error.message)
  return data as AccountBalanceRow[]
}

async function insertAccount(payload: AccountInsert): Promise<Account> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('accounts') as any)
    .insert(payload)
    .select('*')
    .single()
  if (error) throw new Error((error as Error).message)
  return data as Account
}

async function updateAccountBalance(id: string, balance: number): Promise<Account> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('accounts') as any)
    .update({ balance, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error((error as Error).message)
  return data as Account
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

/** Lista todas as contas do tenant (RLS aplicado automaticamente). */
export function useAccounts() {
  const isDemoMode = useUIStore((s) => s.isDemoMode)

  const query = useQuery({
    queryKey: ACCOUNT_KEYS.list(),
    queryFn: fetchAccounts,
    enabled: !isDemoMode,
  })

  if (isDemoMode) {
    return { data: DEMO_ACCOUNTS, isLoading: false, isError: false } as typeof query
  }

  return query
}

/** Saldos consolidados por conta via `v_account_balances`. */
export function useAccountBalances() {
  return useQuery({
    queryKey: ACCOUNT_KEYS.balances(),
    queryFn: fetchAccountBalances,
    staleTime: 2 * 60 * 1_000,   // saldo: refresca a cada 2 min
  })
}

/** Cria uma nova conta bancária. */
export function useCreateAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: AccountInsert) => insertAccount(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ACCOUNT_KEYS.all() }),
  })
}

/** Atualiza o saldo de uma conta (ex: conciliação manual). */
export function useUpdateAccountBalance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, balance }: { id: string; balance: number }) =>
      updateAccountBalance(id, balance),
    onSuccess: () => qc.invalidateQueries({ queryKey: ACCOUNT_KEYS.all() }),
  })
}
