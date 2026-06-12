// ─── FlowFinance — TransactionTable ──────────────────────────────────────────
// Tabela responsiva de transações com skeleton, empty state e paginação
import type { Transaction } from '@/types/database.types'
import { Badge, statusBadge, statusLabel } from './Badge'
import { Skeleton } from './SkeletonCard'
import { formatCurrency, formatDate } from '@/lib/formatters'

interface TransactionTableProps {
  transactions: Transaction[]
  loading?: boolean
  error?: boolean
  compact?: boolean   // modo compacto para dashboard
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4" role="status" aria-label="Carregando transações…">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton width="w-8"  height="h-8" className="rounded-full shrink-0" />
          <Skeleton width="w-48" height="h-4" />
          <Skeleton width="w-20" height="h-4" className="ml-auto" />
          <Skeleton width="w-16" height="h-5" className="rounded-full" />
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-3xl" aria-hidden="true">📭</p>
      <p className="mt-3 text-sm font-medium text-[var(--color-text-secondary)]">
        Nenhuma transação encontrada
      </p>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
        Ajuste os filtros ou registre uma nova transação.
      </p>
    </div>
  )
}

export function TransactionTable({ transactions, loading, error, compact }: TransactionTableProps) {
  if (loading) return <TableSkeleton />

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-[var(--color-danger)]">Erro ao carregar transações.</p>
      </div>
    )
  }

  if (transactions.length === 0) return <EmptyState />

  const rows = compact ? transactions.slice(0, 5) : transactions

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" aria-label="Tabela de transações">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">Descrição</th>
            <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)] sm:table-cell">Data</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">Valor</th>
            <th className="hidden px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)] md:table-cell">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {rows.map((tx) => (
            <tr key={tx.id} className="transition-colors hover:bg-[var(--color-bg-tertiary)]">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs"
                    style={{
                      background: tx.type === 'income' ? 'var(--color-accent-subtle)' : 'rgba(239,68,68,0.1)',
                      color: tx.type === 'income' ? 'var(--color-success)' : 'var(--color-danger)',
                    }}
                    aria-hidden="true"
                  >
                    {tx.type === 'income' ? '↑' : '↓'}
                  </span>
                  <span className="font-medium text-[var(--color-text-primary)] truncate max-w-[160px] sm:max-w-none">
                    {tx.description}
                  </span>
                </div>
              </td>
              <td className="hidden px-4 py-3 text-[var(--color-text-muted)] sm:table-cell">
                {formatDate(tx.transaction_date)}
              </td>
              <td className={`px-4 py-3 text-right font-mono tabular-nums font-medium ${
                tx.type === 'income' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
              }`}>
                {tx.type === 'expense' && '−'}{formatCurrency(tx.amount)}
              </td>
              <td className="hidden px-4 py-3 text-center md:table-cell">
                <Badge variant={statusBadge(tx.status)}>
                  {statusLabel[tx.status]}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
