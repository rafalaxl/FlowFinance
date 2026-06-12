// ─── FlowFinance — CashFlowChart ─────────────────────────────────────────────
// Recharts AreaChart responsivo com tooltip e grid da marca
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, type TooltipProps,
} from 'recharts'
import { Skeleton } from './SkeletonCard'
import { formatCurrency } from '@/lib/formatters'

export interface CashFlowDataPoint {
  period: string   // ex: "Jan", "Fev"
  income: number
  expense: number
  balance: number
}

interface CashFlowChartProps {
  data: CashFlowDataPoint[]
  loading?: boolean
  error?: boolean
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3 shadow-md text-xs">
      <p className="mb-2 font-semibold text-[var(--color-text-primary)]">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="font-mono tabular-nums">
          {entry.name === 'income' ? 'Receita' : entry.name === 'expense' ? 'Despesa' : 'Saldo'}:{' '}
          {formatCurrency(entry.value ?? 0)}
        </p>
      ))}
    </div>
  )
}

export function CashFlowChart({ data, loading, error }: CashFlowChartProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
        <Skeleton width="w-1/4" height="h-4" className="mb-4" />
        <Skeleton width="w-full" height="h-48" className="rounded-lg" />
      </div>
    )
  }

  if (error || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <p className="text-sm text-[var(--color-text-muted)]">
          {error ? 'Erro ao carregar gráfico' : 'Sem dados disponíveis'}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
      <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
        Fluxo de Caixa — Últimos 6 meses
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
          <XAxis dataKey="period" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(v: number) => formatCurrency(v, true)} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} width={72} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="income" stroke="var(--color-success)" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} dot={false} name="income" />
          <Area type="monotone" dataKey="expense" stroke="var(--color-danger)" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} dot={false} name="expense" />
          <Area type="monotone" dataKey="balance" stroke="var(--color-accent)" fill="none" strokeWidth={2} strokeDasharray="5 5" dot={false} name="balance" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
