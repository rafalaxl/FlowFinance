// ─── FlowFinance — KPI Service ──────────────────────────────────────────────
// Serviço para cálculo analítico dos 4 KPIs estratégicos da plataforma:
//   1. Caixa Disponível    → soma de contas checking + savings
//   2. Burn Rate Mensal    → despesas concluídas do mês corrente
//   3. EBITDA Projetado    → receitas - despesas concluídas do mês corrente
//   4. Contas da Semana    → pendências vencendo nos próximos 7 dias
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from './supabaseClient'
import { todayISO, addDaysISO, monthBoundsISO } from '../lib/dates'
import type { DashboardKPIs, Transaction, AccountBalanceRow } from '../types/database.types'

export async function fetchDashboardKPIs(): Promise<DashboardKPIs> {
  const { start: monthStart, end: monthEnd } = monthBoundsISO()
  const today = todayISO()
  const weekEnd = addDaysISO(7)

  // 1 — Caixa Disponível (soma das contas checking + savings via view consolidada)
  const { data: balanceRows, error: balanceErr } = await supabase
    .from('v_account_balances')
    .select('*')
    .in('type', ['checking', 'savings'])
  if (balanceErr) throw new Error(balanceErr.message)

  const availableCash = (balanceRows as AccountBalanceRow[]).reduce(
    (sum, row) => sum + (row.balance ?? 0),
    0
  )

  // 2 & 3 — Burn Rate + EBITDA Projetado: sempre baseados no mês corrente
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

  const monthlyBurnRate = totalExpense
  const projectedEbitda = totalIncome - totalExpense

  // 4 — Contas da Semana: pendências com vencimento nos próximos 7 dias
  const { data: pendingTx, error: pendingErr } = await supabase
    .from('transactions')
    .select('*')
    .eq('status', 'pending')
    .gte('due_date', today)
    .lte('due_date', weekEnd)
    .order('due_date')
  if (pendingErr) throw new Error(pendingErr.message)

  const allPending = (pendingTx ?? []) as Transaction[]
  const pendingPayables    = allPending.filter((t) => t.type === 'expense')
  const pendingReceivables = allPending.filter((t) => t.type === 'income')

  return {
    availableCash,
    monthlyBurnRate,
    projectedEbitda,
    pendingPayables,
    pendingReceivables,
  }
}
