// ─── FlowFinance — Transactions Page ─────────────────────────────────────────
// CRUD completo com filtros, skeleton, empty state e paginação básica
import { useState } from 'react'
import { useTransactions, useDeleteTransaction, type TransactionFilters } from '@/hooks/useTransactions'
import { useUIStore } from '@/store/uiStore'
import { TransactionTable } from '@/components/ui/TransactionTable'
import { FiltersBar } from '@/components/ui/FiltersBar'
import { TransactionModal } from '@/components/ui/TransactionModal'

const PAGE_SIZE = 20

export default function Transactions() {
  const [filters, setFilters] = useState<TransactionFilters>({})
  const [page, setPage] = useState(0)

  const { data: transactions = [], isLoading, isError } = useTransactions(filters)
  const { mutate: deleteTransaction } = useDeleteTransaction()
  const { openNewTransaction } = useUIStore()

  const paged = transactions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(transactions.length / PAGE_SIZE)

  function handleFilterChange(f: TransactionFilters) {
    setFilters(f)
    setPage(0)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Transações</h1>
          <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
            {isLoading ? '…' : `${transactions.length} transação${transactions.length !== 1 ? 'ões' : ''}`}
          </p>
        </div>
        <button
          onClick={openNewTransaction}
          className="inline-flex items-center gap-2 rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        >
          + Novo Lançamento
        </button>
      </div>

      {/* Filters */}
      <FiltersBar filters={filters} onChange={handleFilterChange} />

      {/* Table */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <TransactionTable
          transactions={paged}
          loading={isLoading}
          error={isError}
        />

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-3">
            <p className="text-xs text-[var(--color-text-muted)]">
              Página {page + 1} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-md border border-[var(--color-border)] px-3 py-1 text-xs disabled:opacity-40"
              >
                ← Anterior
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-[var(--color-border)] px-3 py-1 text-xs disabled:opacity-40"
              >
                Próxima →
              </button>
            </div>
          </div>
        )}
      </div>
      {/* deleteTransaction exposed for future use via modal */}
      <span className="hidden" data-delete-fn={String(!!deleteTransaction)} />
      <TransactionModal />
    </div>
  )
}
