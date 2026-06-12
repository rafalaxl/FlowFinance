// ─── FlowFinance — useTransactions ───────────────────────────────────────────
// CRUD completo para a tabela `transactions`.
// RLS garante isolamento por tenant — nenhum filtro manual necessário.
// ─────────────────────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabaseClient'
import type {
  Transaction,
  TransactionInsert,
  TransactionUpdate,
} from '../types/database.types'

// ── Query Keys ────────────────────────────────────────────────────────────────

export const TRANSACTION_KEYS = {
  all:    () => ['transactions'] as const,
  list:   (filters: TransactionFilters) => ['transactions', 'list', filters] as const,
  detail: (id: string) => ['transactions', 'detail', id] as const,
}

// ── Filter Types ──────────────────────────────────────────────────────────────

export interface TransactionFilters {
  type?:       'income' | 'expense'
  status?:     'pending' | 'completed' | 'cancelled'
  account_id?: string
  from?:       string   // ISO date
  to?:         string   // ISO date
}

// ── Service helpers ───────────────────────────────────────────────────────────

async function fetchTransactions(filters: TransactionFilters): Promise<Transaction[]> {
  let query = supabase
    .from('transactions')
    .select('*')
    .order('transaction_date', { ascending: false })

  if (filters.type)       query = query.eq('type', filters.type)
  if (filters.status)     query = query.eq('status', filters.status)
  if (filters.account_id) query = query.eq('account_id', filters.account_id)
  if (filters.from)       query = query.gte('transaction_date', filters.from)
  if (filters.to)         query = query.lte('transaction_date', filters.to)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data as Transaction[]
}

async function insertTransaction(payload: TransactionInsert): Promise<Transaction> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('transactions') as any)
    .insert(payload)
    .select('*')
    .single()
  if (error) throw new Error((error as Error).message)
  return data as Transaction
}

async function updateTransaction(id: string, payload: TransactionUpdate): Promise<Transaction> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('transactions') as any)
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error((error as Error).message)
  return data as Transaction
}

async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: TRANSACTION_KEYS.list(filters),
    queryFn: () => fetchTransactions(filters),
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: TransactionInsert) => insertTransaction(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: TRANSACTION_KEYS.all() }),
  })
}

export function useUpdateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: TransactionUpdate & { id: string }) =>
      updateTransaction(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: TRANSACTION_KEYS.all() }),
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: TRANSACTION_KEYS.all() }),
  })
}
