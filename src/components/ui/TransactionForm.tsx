import { useState } from 'react'
import { useCreateTransaction } from '@/hooks/useTransactions'
import { useAccounts } from '@/hooks/useAccounts'
import { useUIStore } from '@/store/uiStore'
import type { TransactionType, TransactionStatus } from '@/types/database.types'

export function TransactionForm() {
  const { mutate, isPending } = useCreateTransaction()
  const { data: accounts } = useAccounts()
  const closeAllModals = useUIStore((s) => s.closeAllModals)

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const [status, setStatus] = useState<TransactionStatus>('completed')
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0] as string)
  const [accountId, setAccountId] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountId) return

    mutate({
      tenant_id: 'a0000000-0000-0000-0000-000000000001',
      user_id: 'b0000000-0000-0000-0000-000000000001',
      account_id: accountId,
      category_id: null,
      amount: Number(amount),
      description,
      type,
      status,
      transaction_date: transactionDate,
      due_date: null
    }, {
      onSuccess: () => {
        closeAllModals()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-[var(--color-text-secondary)]">Descrição</label>
        <input
          required
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-[var(--color-text-secondary)]">Valor</label>
        <input
          required
          type="number"
          step="0.01"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-[var(--color-text-secondary)]">Tipo</label>
          <select
            value={type}
            onChange={e => setType(e.target.value as TransactionType)}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
          >
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-[var(--color-text-secondary)]">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as TransactionStatus)}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
          >
            <option value="completed">Concluída</option>
            <option value="pending">Pendente</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-[var(--color-text-secondary)]">Data da Transação</label>
        <input
          required
          type="date"
          value={transactionDate}
          onChange={e => setTransactionDate(e.target.value)}
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-[var(--color-text-secondary)]">Conta</label>
        <select
          required
          value={accountId}
          onChange={e => setAccountId(e.target.value)}
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
        >
          <option value="" disabled>Selecione uma conta</option>
          {accounts?.map(acc => (
            <option key={acc.id} value={acc.id}>{acc.name}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={closeAllModals}
          className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        >
          Salvar
        </button>
      </div>
    </form>
  )
}
