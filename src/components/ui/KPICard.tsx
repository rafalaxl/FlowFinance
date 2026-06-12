// ─── FlowFinance — KPICard ────────────────────────────────────────────────────
import { SkeletonCard } from './SkeletonCard'

interface KPICardProps {
  title: string
  value: string
  subtitle?: string
  trend?: { value: string; positive: boolean }
  icon?: string
  loading?: boolean
  error?: boolean
  variant?: 'default' | 'success' | 'danger'
}

function TrendBadge({ value, positive }: { value: string; positive: boolean }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-medium font-mono',
        positive
          ? 'bg-[var(--color-accent-subtle)] text-[var(--color-success)]'
          : 'bg-red-50 text-[var(--color-danger)] dark:bg-red-950/30',
      ].join(' ')}
    >
      {positive ? '▲' : '▼'} {value}
    </span>
  )
}

export function KPICard({
  title, value, subtitle, trend, icon, loading, error, variant = 'default',
}: KPICardProps) {
  if (loading) return <SkeletonCard lines={3} />

  if (error) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
        <p className="text-sm text-[var(--color-danger)]">Erro ao carregar métrica</p>
      </div>
    )
  }

  const valueColor =
    variant === 'success' ? 'text-[var(--color-success)]'
    : variant === 'danger' ? 'text-[var(--color-danger)]'
    : 'text-[var(--color-text-primary)]'

  return (
    <article className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6 transition-shadow hover:shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
          {title}
        </p>
        {icon && <span className="text-lg" aria-hidden="true">{icon}</span>}
      </header>

      <p className={`font-mono text-2xl font-semibold tabular-nums ${valueColor}`}>
        {value}
      </p>

      {(subtitle || trend) && (
        <footer className="mt-3 flex items-center gap-2">
          {trend && <TrendBadge value={trend.value} positive={trend.positive} />}
          {subtitle && (
            <p className="text-xs text-[var(--color-text-muted)]">{subtitle}</p>
          )}
        </footer>
      )}
    </article>
  )
}
