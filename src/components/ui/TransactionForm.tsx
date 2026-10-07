// ─── FlowFinance — TransactionForm ───────────────────────────────────────────
// Formulário enxuto de lançamento financeiro conectado ao hook de formulário.
// ─────────────────────────────────────────────────────────────────────────────

import type { TransactionType, TransactionStatus } from '@/types/database.types'
import { useTransactionForm } from '@/hooks/useTransactionForm'

export function TransactionForm() {
  const {
    description,
    setDescription,
    amount,
    setAmount,
    type,
    setType,
    status,
    setStatus,
    transactionDate,
    setTransactionDate,
    dueDate,
    setDueDate,
    errorMsg,
    fieldErrors,
    isPending,
    handleSubmit,
    closeAllModals,
  } = useTransactionForm()

  const inputClass =
    'w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]'
  const labelClass = 'text-sm font-medium text-[var(--color-text-secondary)]'

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {errorMsg && (
        <div className="rounded-md bg-red-50 p-3 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
        </div>
      )}

      <div className="space-y-1">
        <label className={labelClass}>Descrição</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
          placeholder="Ex: Aluguel do escritório"
        />
        {fieldErrors.description && (
          <span className="text-xs text-red-500">{fieldErrors.description}</span>
        )}
      </div>

      <div className="space-y-1">
        <label className={labelClass}>Valor (R$)</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={inputClass}
          placeholder="0,00"
        />
        {fieldErrors.amount && (
          <span className="text-xs text-red-500">{fieldErrors.amount}</span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className={labelClass}>Tipo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as TransactionType)}
            className={inputClass}
          >
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TransactionStatus)}
            className={inputClass}
          >
            <option value="completed">Concluída</option>
            <option value="pending">Pendente</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelClass}>Data da Transação</label>
        <input
          type="date"
          value={transactionDate}
          onChange={(e) => setTransactionDate(e.target.value)}
          className={inputClass}
        />
        {fieldErrors.transaction_date && (
          <span className="text-xs text-red-500">{fieldErrors.transaction_date}</span>
        )}
      </div>

      {status === 'pending' && (
        <div className="space-y-1">
          <label className={labelClass}>Data de Vencimento</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClass}
            required
          />
          {fieldErrors.due_date && (
            <span className="text-xs text-red-500">{fieldErrors.due_date}</span>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={closeAllModals}
          className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Salvando...' : 'Adicionar'}
        </button>
      </div>
    </form>
  )
}
