import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, type TooltipProps, Legend
} from 'recharts'
import { Skeleton } from './SkeletonCard'
import { formatCurrency } from '@/lib/formatters'

export interface DonutChartDataPoint {
  name: string
  value: number
}

interface DonutChartProps {
  data: DonutChartDataPoint[]
  title: string
  loading?: boolean
  error?: boolean
}

const COLORS = [
  'var(--color-accent)', 
  'var(--color-success)', 
  'var(--color-warning)', 
  'var(--color-info)', 
  'var(--color-danger)'
]

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3 shadow-md text-xs">
      <p className="font-semibold text-[var(--color-text-primary)]">{payload[0].name}</p>
      <p style={{ color: payload[0].color }} className="font-mono tabular-nums mt-1">
        {formatCurrency(payload[0].value ?? 0)}
      </p>
    </div>
  )
}

export function DonutChart({ data, title, loading, error }: DonutChartProps) {
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

  // Max 5 slices rule
  const safeData = data.slice(0, 5)

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
      <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={safeData}
            innerRadius="70%"
            outerRadius="100%"
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {safeData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: 'var(--color-text-muted)' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
