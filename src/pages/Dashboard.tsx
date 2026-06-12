// ─── FlowFinance — Dashboard Page ────────────────────────────────────────────
// 4 KPI cards + CashFlowChart + tabela de transações recentes
import { useDashboardKPIs } from '@/hooks/useDashboardKPIs'
import { useTransactions } from '@/hooks/useTransactions'
import { KPICard } from '@/components/ui/KPICard'
import { CashFlowChart, type CashFlowDataPoint } from '@/components/ui/CashFlowChart'
import { TransactionTable } from '@/components/ui/TransactionTable'
import { formatCurrency } from '@/lib/formatters'

// Mock chart data — será substituído por hook de projeções futuramente
const MOCK_CHART_DATA: CashFlowDataPoint[] = [
  { period: 'Jan', income: 85000, expense: 62000, balance: 23000 },
  { period: 'Fev', income: 92000, expense: 71000, balance: 21000 },
  { period: 'Mar', income: 78000, expense: 68000, balance: 10000 },
  { period: 'Abr', income: 105000, expense: 74000, balance: 31000 },
  { period: 'Mai', income: 97000, expense: 79000, balance: 18000 },
  { period: 'Jun', income: 112000, expense: 81000, balance: 31000 },
]

export default function Dashboard() {
  const { data: kpis, isLoading: kpiLoading, isError: kpiError } = useDashboardKPIs()
  const { data: txList = [], isLoading: txLoading, isError: txError } = useTransactions({ status: 'completed' })

  const pendingCount = (kpis?.pendingPayables?.length ?? 0) + (kpis?.pendingReceivables?.length ?? 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">Visão consolidada do fluxo de caixa</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Caixa Disponível"
          value={kpis ? formatCurrency(kpis.availableCash) : '—'}
          icon="🏦"
          variant={kpis && kpis.availableCash >= 0 ? 'success' : 'danger'}
          subtitle="Contas corrente + poupança"
          loading={kpiLoading}
          error={kpiError}
        />
        <KPICard
          title="Burn Rate Mensal"
          value={kpis ? formatCurrency(kpis.monthlyBurnRate) : '—'}
          icon="🔥"
          variant="danger"
          subtitle="Total de despesas no mês"
          loading={kpiLoading}
          error={kpiError}
        />
        <KPICard
          title="EBITDA Projetado"
          value={kpis ? formatCurrency(kpis.projectedEbitda) : '—'}
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

      {/* Chart */}
      <CashFlowChart data={MOCK_CHART_DATA} loading={false} error={false} />

      {/* Recent Transactions */}
      <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <header className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Transações Recentes</h2>
          <a href="/transactions" className="text-xs text-[var(--color-accent)] hover:underline">
            Ver todas →
          </a>
        </header>
        <TransactionTable
          transactions={txList}
          loading={txLoading}
          error={txError}
          compact
        />
      </section>
    </div>
  )
}
