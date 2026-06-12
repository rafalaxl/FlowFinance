// ─── FlowFinance — TransactionFiltersBar ──────────────────────────────────────
// Barra de filtros para a página de Transações (subcomponente)
import type { TransactionFilters } from '@/hooks/useTransactions'

interface FiltersBarProps {
  filters: TransactionFilters
  onChange: (f: TransactionFilters) => void
}

export function FiltersBar({ filters, onChange }: FiltersBarProps) {
  const selectClass = [
    'rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)]',
    'px-3 py-1.5 text-sm text-[var(--color-text-primary)]',
    'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]',
  ].join(' ')

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        className={selectClass}
        value={filters.type ?? ''}
        aria-label="Filtrar por tipo"
        onChange={(e) =>
          onChange({ ...filters, type: (e.target.value as 'income' | 'expense') || undefined })
        }
      >
        <option value="">Todos os tipos</option>
        <option value="income">Receita</option>
        <option value="expense">Despesa</option>
      </select>

      <select
        className={selectClass}
        value={filters.status ?? ''}
        aria-label="Filtrar por status"
        onChange={(e) =>
          onChange({ ...filters, status: (e.target.value as 'pending' | 'completed' | 'cancelled') || undefined })
        }
      >
        <option value="">Todos os status</option>
        <option value="completed">Concluído</option>
        <option value="pending">Pendente</option>
        <option value="cancelled">Cancelado</option>
      </select>

      <input
        type="date"
        className={selectClass}
        value={filters.from ?? ''}
        aria-label="Data inicial"
        onChange={(e) => onChange({ ...filters, from: e.target.value || undefined })}
      />
      <input
        type="date"
        className={selectClass}
        value={filters.to ?? ''}
        aria-label="Data final"
        onChange={(e) => onChange({ ...filters, to: e.target.value || undefined })}
      />

      <button
        className="rounded-md px-3 py-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
        onClick={() => onChange({})}
      >
        Limpar
      </button>
    </div>
  )
}
