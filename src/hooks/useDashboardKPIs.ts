// ─── FlowFinance — useDashboardKPIs ──────────────────────────────────────────
// Retorna os 4 KPIs consolidados da empresa sempre calculados para o mês corrente
// e saldos atuais, independente de filtros de período (DateRangePicker).
// ─────────────────────────────────────────────────────────────────────────────

import { useQuery } from '@tanstack/react-query'
import type { DashboardKPIs } from '../types/database.types'
import { useUIStore } from '../store/uiStore'
import { DEMO_ACCOUNTS, DEMO_TRANSACTIONS } from '../services/demoData'
import { fetchDashboardKPIs } from '../services/kpiService'

export const DASHBOARD_KEYS = {
  kpis: () => ['dashboard', 'kpis'] as const,
}

export function useDashboardKPIs() {
  const isDemoMode = useUIStore((s) => s.isDemoMode)

  const query = useQuery<DashboardKPIs, Error>({
    queryKey: DASHBOARD_KEYS.kpis(),
    queryFn: fetchDashboardKPIs,
    staleTime: 3 * 60 * 1_000,
    refetchInterval: 5 * 60 * 1_000,
    enabled: !isDemoMode,
  })

  if (isDemoMode) {
    let totalIncome = 0
    let totalExpense = 0
    const pendingPayables: typeof DEMO_TRANSACTIONS = []
    const pendingReceivables: typeof DEMO_TRANSACTIONS = []

    for (const tx of DEMO_TRANSACTIONS) {
      if (tx.status === 'completed') {
        if (tx.type === 'income')  totalIncome  += tx.amount
        if (tx.type === 'expense') totalExpense += tx.amount
      } else if (tx.status === 'pending') {
        if (tx.type === 'expense') pendingPayables.push(tx)
        if (tx.type === 'income')  pendingReceivables.push(tx)
      }
    }

    const availableCash = DEMO_ACCOUNTS
      .filter((a) => a.type === 'checking' || a.type === 'savings')
      .reduce((sum, a) => sum + (a.balance ?? 0), 0)

    const calculatedKPIs: DashboardKPIs = {
      availableCash,
      monthlyBurnRate: totalExpense,
      projectedEbitda: totalIncome - totalExpense,
      pendingPayables,
      pendingReceivables,
    }

    return { data: calculatedKPIs, isLoading: false, isError: false } as typeof query
  }

  return query
}
