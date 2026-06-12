import {
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, type TooltipProps,
} from 'recharts'
import { Skeleton } from './SkeletonCard'
import { formatCurrency } from '@/lib/formatters'

export interface BarChartDataPoint {
  category: string
  value: number
}

interface BarChartProps {
  data: BarChartDataPoint[]
  title: string
  loading?: boolean
  error?: boolean
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3 shadow-md text-xs">
      <p className="mb-2 font-semibold text-[var(--color-text-primary)]">{label}</p>
      <p style={{ color: payload[0].color }} className="font-mono tabular-nums">
        Valor: {formatCurrency(payload[0].value ?? 0)}
      </p>
    </div>
  )
}

export function BarChart({ data, title, loading, error }: BarChartProps) {
  if (loading) return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
      <Skeleton width="w-1/4" height="h-4" className="mb-4" />
      <Skeleton width="w-full" height="h-48" className="rounded-lg" />
    </div>
  )
  if (error || data.length === 0) return (
    <div className="flex h-64 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <p className="text-sm text-[var(--color-text-muted)]">Sem dados</p>
    </div>
  )

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
      <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
      <ResponsiveContainer width="100%" height={240}>
        <RechartsBarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
          <XAxis dataKey="category" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
          {/* REGRA INVIOLÁVEL: YAxis começa em 0 */}
          <YAxis domain={[0, 'auto']} tickFormatter={(v: number) => formatCurrency(v, true)} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} width={72} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-bg-tertiary)' }} />
          <Bar dataKey="value" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
