// ─── FlowFinance — Transaction Service ──────────────────────────────────────
// Serviços Supabase para a tabela `transactions`.
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from './supabaseClient'
import type {
  Transaction,
  TransactionInsert,
  TransactionUpdate,
} from '../types/database.types'

export interface TransactionFilters {
  type?:       'income' | 'expense'
  status?:     'pending' | 'completed' | 'cancelled'
  account_id?: string
  from?:       string   // ISO date
  to?:         string   // ISO date
}

export async function fetchTransactions(filters: TransactionFilters): Promise<Transaction[]> {
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

export async function insertTransaction(payload: TransactionInsert): Promise<Transaction> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('transactions') as any)
    .insert(payload)
    .select('*')
    .single()
  if (error) throw new Error((error as Error).message)
  return data as Transaction
}

export async function updateTransaction(id: string, payload: TransactionUpdate): Promise<Transaction> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('transactions') as any)
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error((error as Error).message)
  return data as Transaction
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
