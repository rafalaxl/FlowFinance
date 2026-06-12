// ─── FlowFinance — CashFlowChart ─────────────────────────────────────────────
// Recharts LineChart responsivo com tooltip e grid da marca
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
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
        <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
          <XAxis dataKey="period" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(v: number) => formatCurrency(v, true)} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} width={72} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="income"  stroke="var(--color-success)" strokeWidth={2} dot={false} name="income"  />
          <Line type="monotone" dataKey="expense" stroke="var(--color-danger)"  strokeWidth={2} dot={false} name="expense" />
          <Line type="monotone" dataKey="balance" stroke="var(--color-accent)"  strokeWidth={2} dot={false} name="balance" strokeDasharray="5 3" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
