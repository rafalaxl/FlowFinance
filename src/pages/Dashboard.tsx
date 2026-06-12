// ─── FlowFinance — Dashboard Page ────────────────────────────────────────────
// 4 KPI cards + CashFlowChart + BarChart + DonutChart + DateRangePicker
import { useDashboardKPIs } from '@/hooks/useDashboardKPIs'
import { useTransactions } from '@/hooks/useTransactions'
import { KPICard } from '@/components/ui/KPICard'
import { CashFlowChart } from '@/components/ui/CashFlowChart'
import { BarChart } from '@/components/ui/BarChart'
import { DonutChart } from '@/components/ui/DonutChart'
import { TransactionTable } from '@/components/ui/TransactionTable'
import { DateRangePicker } from '@/components/ui/DateRangePicker'
import { formatCurrency } from '@/lib/formatters'
import { useSearchParams } from 'react-router-dom'
import { useChartData } from '@/hooks/useChartData'



export default function Dashboard() {
  const [searchParams] = useSearchParams()
  const from = searchParams.get('de') || undefined
  const to = searchParams.get('ate') || undefined

  const { data: kpis, isLoading: kpiLoading, isError: kpiError } = useDashboardKPIs({ from, to })
  const { data: txList = [], isLoading: txLoading, isError: txError } = useTransactions({ status: 'completed', from, to })
  const { cashFlowData, barData, donutData } = useChartData(txList)

  const pendingCount = (kpis?.pendingPayables?.length ?? 0) + (kpis?.pendingReceivables?.length ?? 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Visão consolidada do fluxo de caixa</p>
        </div>
        <DateRangePicker />
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Caixa Disponível"
          value={kpis ? formatCurrency(kpis.availableCash, true) : '—'}
          icon="🏦"
          variant={kpis && kpis.availableCash >= 0 ? 'success' : 'danger'}
          subtitle="Contas corrente + poupança"
          loading={kpiLoading}
          error={kpiError}
        />
        <KPICard
          title="Burn Rate Mensal"
          value={kpis ? formatCurrency(kpis.monthlyBurnRate, true) : '—'}
          icon="🔥"
          variant="danger"
          subtitle="Total de despesas no mês"
          loading={kpiLoading}
          error={kpiError}
        />
        <KPICard
          title="EBITDA Projetado"
          value={kpis ? formatCurrency(kpis.projectedEbitda, true) : '—'}
          icon="📈"
          variant={kpis && kpis.projectedEbitda >= 0 ? 'success' : 'danger'}
          subtitle="Receitas − Despesas do mês"
          loading={kpiLoading}
          error={kpiError}
        />
        <KPICard
          title="Contas da Semana"
          value={pendingCount ? `${pendingCount} pendente${pendingCount > 1 ? 's' : ''}` : '0 pendentes'}
          icon="📋"
          subtitle={`${kpis?.pendingPayables?.length ?? 0} a pagar · ${kpis?.pendingReceivables?.length ?? 0} a receber`}
          loading={kpiLoading}
          error={kpiError}
        />
      </div>

      {/* Charts Grid 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CashFlowChart data={cashFlowData} loading={txLoading} error={txError} />
        </div>
        <div>
          <DonutChart data={donutData} title="Receitas por Origem" loading={txLoading} error={txError} />
        </div>
      </div>

      {/* Charts Grid 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BarChart data={barData} title="Despesas por Categoria (Top 5)" loading={txLoading} error={txError} />
        
        {/* Recent Transactions */}
        <section className="flex flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <header className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Transações Recentes</h2>
            <a href="/transactions" className="text-xs text-[var(--color-accent)] hover:underline">
              Ver todas →
            </a>
          </header>
          <div className="flex-1 overflow-auto">
            <TransactionTable
              transactions={txList}
              loading={txLoading}
              error={txError}
              compact
            />
          </div>
        </section>
      </div>
    </div>
  )
}

