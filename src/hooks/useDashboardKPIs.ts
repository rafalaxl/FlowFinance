// ─── FlowFinance — useDashboardKPIs ──────────────────────────────────────────
// Calcula os 4 KPIs financeiros do dashboard em paralelo:
//   1. Caixa Disponível    → soma de checking + savings
//   2. Burn Rate Mensal    → despesas completed do mês corrente
//   3. EBITDA Projetado    → receitas completed - despesas completed do mês
//   4. Contas a Pagar/Receber → transações pending nos próximos 7 dias
// ─────────────────────────────────────────────────────────────────────────────

import { useQuery } from '@tanstack/react-query'
import { supabase } from '../services/supabaseClient'
import type { DashboardKPIs, Transaction, AccountBalanceRow } from '../types/database.types'
import { useUIStore } from '../store/uiStore'
import { DEMO_KPIS, DEMO_TRANSACTIONS } from '../services/demoData'

// ── Helpers ───────────────────────────────────────────────────────────────────

function isoToday(): string {
  return new Date().toISOString().split('T')[0] as string
}

function isoInDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0] as string
}

function monthBounds(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0] as string
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split('T')[0] as string
  return { start, end }
}

// ── KPI Fetcher ───────────────────────────────────────────────────────────────

async function fetchDashboardKPIs(): Promise<DashboardKPIs> {
  const { start: monthStart, end: monthEnd } = monthBounds()
  const today = isoToday()
  const weekEnd = isoInDays(7)

  // 1 — Caixa Disponível (checking + savings)
  const { data: balanceRows, error: balanceErr } = await supabase
    .from('v_account_balances')
    .select('*')
    .in('type', ['checking', 'savings'])
  if (balanceErr) throw new Error(balanceErr.message)

  const availableCash = (balanceRows as AccountBalanceRow[]).reduce(
    (sum, row) => sum + (row.balance ?? 0),
    0
  )

  // 2 & 3 — Burn Rate + EBITDA: transações completed no mês
  const { data: monthTx, error: monthErr } = await supabase
    .from('transactions')
    .select('amount, type')
    .eq('status', 'completed')
    .gte('transaction_date', monthStart)
    .lte('transaction_date', monthEnd)
  if (monthErr) throw new Error(monthErr.message)

  let totalIncome = 0
  let totalExpense = 0
  for (const tx of (monthTx as Array<{ amount: number; type: string }>) ?? []) {
    if (tx.type === 'income')  totalIncome  += tx.amount ?? 0
    if (tx.type === 'expense') totalExpense += tx.amount ?? 0
  }

  const monthlyBurnRate  = totalExpense
  const projectedEbitda  = totalIncome - totalExpense

  // 4 — Contas a Pagar / Receber (pending, vencendo em 7 dias)
  const { data: pendingTx, error: pendingErr } = await supabase
    .from('transactions')
    .select('*')
    .eq('status', 'pending')
    .gte('due_date', today)
    .lte('due_date', weekEnd)
    .order('due_date')
  if (pendingErr) throw new Error(pendingErr.message)

  const allPending = (pendingTx ?? []) as Transaction[]
  const pendingPayables    = allPending.filter(t => t.type === 'expense')
  const pendingReceivables = allPending.filter(t => t.type === 'income')

  return {
    availableCash,
    monthlyBurnRate,
    projectedEbitda,
    pendingPayables,
    pendingReceivables,
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export const DASHBOARD_KEYS = {
  kpis: (filters?: { from?: string; to?: string }) => ['dashboard', 'kpis', filters] as const,
}

/** Retorna os 4 KPIs financeiros do CFO/CEO em um único hook. */
export function useDashboardKPIs(filters: { from?: string; to?: string } = {}) {
  const isDemoMode = useUIStore((s) => s.isDemoMode)

  const query = useQuery<DashboardKPIs, Error>({
    queryKey: DASHBOARD_KEYS.kpis(filters),
    queryFn: fetchDashboardKPIs,
    staleTime: 3 * 60 * 1_000,
    refetchInterval: 5 * 60 * 1_000,
    enabled: !isDemoMode,
  })

  if (isDemoMode) {
    let filteredTx = DEMO_TRANSACTIONS
    if (filters.from) filteredTx = filteredTx.filter(t => t.transaction_date >= filters.from!)
    if (filters.to)   filteredTx = filteredTx.filter(t => t.transaction_date <= filters.to!)

    let totalIncome = 0
    let totalExpense = 0
    const pendingPayables: typeof DEMO_TRANSACTIONS = []
    const pendingReceivables: typeof DEMO_TRANSACTIONS = []

    for (const tx of filteredTx) {
      if (tx.status === 'completed') {
        if (tx.type === 'income') totalIncome += tx.amount
        if (tx.type === 'expense') totalExpense += tx.amount
      } else if (tx.status === 'pending') {
        if (tx.type === 'expense') pendingPayables.push(tx)
        if (tx.type === 'income') pendingReceivables.push(tx)
      }
    }

    const calculatedKPIs: DashboardKPIs = {
      availableCash: DEMO_KPIS.availableCash,
      monthlyBurnRate: totalExpense,
      projectedEbitda: totalIncome - totalExpense,
      pendingPayables,
      pendingReceivables,
    }

    return { data: calculatedKPIs, isLoading: false, isError: false } as typeof query
  }

  return query
}
