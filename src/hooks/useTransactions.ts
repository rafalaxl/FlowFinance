// ─── FlowFinance — useTransactions ───────────────────────────────────────────
// CRUD completo para a tabela `transactions`.
// RLS garante isolamento por tenant — nenhum filtro manual necessário.
// ─────────────────────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Transaction,
  TransactionInsert,
  TransactionUpdate,
} from '../types/database.types'
import { useUIStore } from '../store/uiStore'
import {
  DEMO_TRANSACTIONS,
  addDemoTransaction,
  updateDemoTransaction,
  deleteDemoTransaction,
} from '../services/demoData'
import {
  fetchTransactions,
  insertTransaction,
  updateTransaction,
  deleteTransaction,
  type TransactionFilters,
} from '../services/transactionService'

export type { TransactionFilters }

export const TRANSACTION_KEYS = {
  all:    () => ['transactions'] as const,
  list:   (filters: TransactionFilters) => ['transactions', 'list', filters] as const,
  detail: (id: string) => ['transactions', 'detail', id] as const,
}

export function useTransactions(filters: TransactionFilters = {}) {
  const isDemoMode = useUIStore((s) => s.isDemoMode)

  const query = useQuery({
    queryKey: TRANSACTION_KEYS.list(filters),
    queryFn: () => fetchTransactions(filters),
    enabled: !isDemoMode,
  })

  if (isDemoMode) {
    let filtered = [...DEMO_TRANSACTIONS]
    if (filters.type)       filtered = filtered.filter(t => t.type === filters.type)
    if (filters.status)     filtered = filtered.filter(t => t.status === filters.status)
    if (filters.account_id) filtered = filtered.filter(t => t.account_id === filters.account_id)
    if (filters.from)       filtered = filtered.filter(t => t.transaction_date >= filters.from!)
    if (filters.to)         filtered = filtered.filter(t => t.transaction_date <= filters.to!)
    return { data: filtered, isLoading: false, isError: false } as typeof query
  }

  return query
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: TransactionInsert) => {
      const isDemo = useUIStore.getState().isDemoMode
      if (isDemo) {
        const newTx: Transaction = {
          ...payload,
          id: crypto.randomUUID(),
          tenant_id: payload.tenant_id ?? 'a0000000-0000-0000-0000-000000000001',
          user_id: payload.user_id ?? 'b0000000-0000-0000-0000-000000000001',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Transaction
        addDemoTransaction(newTx)
        return newTx
      }
      return insertTransaction(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSACTION_KEYS.all() })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export function useUpdateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: TransactionUpdate & { id: string }) => {
      const isDemo = useUIStore.getState().isDemoMode
      if (isDemo) {
        updateDemoTransaction(id, payload)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { id, ...payload } as any
      }
      return updateTransaction(id, payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSACTION_KEYS.all() })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const isDemo = useUIStore.getState().isDemoMode
      if (isDemo) {
        deleteDemoTransaction(id)
        return
      }
      return deleteTransaction(id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSACTION_KEYS.all() })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}
