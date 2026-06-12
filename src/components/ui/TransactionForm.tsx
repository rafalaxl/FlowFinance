import { useState } from 'react'
import { useCreateTransaction } from '@/hooks/useTransactions'
import { useAccounts, useCreateAccount } from '@/hooks/useAccounts'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/store/uiStore'
import type { TransactionType, TransactionStatus } from '@/types/database.types'

export function TransactionForm() {
  const { mutate, isPending } = useCreateTransaction()
  const { data: accounts } = useAccounts()
  const { mutate: createAccount, isPending: isCreatingAccount } = useCreateAccount()
  const { user } = useAuth()
  const closeAllModals = useUIStore((s) => s.closeAllModals)

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const [status, setStatus] = useState<TransactionStatus>('completed')
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0] as string)
  const [accountId, setAccountId] = useState('')

  const tenantId = user?.user_metadata?.tenant_id || user?.app_metadata?.tenant_id || 'a0000000-0000-0000-0000-000000000001'
  const userId = user?.id || 'b0000000-0000-0000-0000-000000000001'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountId) return

    mutate({
      tenant_id: tenantId,
      user_id: userId,
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

  if (accounts !== undefined && accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">
          Você ainda não possui nenhuma conta bancária cadastrada.
        </p>
        <button
          type="button"
          onClick={() => createAccount({
            tenant_id: tenantId,
            name: 'Conta Principal',
            type: 'checking',
            balance: 0,
            currency: 'BRL'
          })}
          disabled={isCreatingAccount}
          className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        >
          {isCreatingAccount ? 'Criando...' : 'Criar Conta Principal'}
        </button>
      </div>
    )
  }

  const inputClass = "w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
  const labelClass = "text-sm font-medium text-[var(--color-text-secondary)]"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className={labelClass}>Descrição</label>
        <input required type="text" value={description} onChange={e => setDescription(e.target.value)} className={inputClass} />
      </div>

      <div className="space-y-1">
        <label className={labelClass}>Valor</label>
        <input required type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className={labelClass}>Tipo</label>
          <select value={type} onChange={e => setType(e.target.value as TransactionType)} className={inputClass}>
            <option value="expense">Despesa</option><option value="income">Receita</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value as TransactionStatus)} className={inputClass}>
            <option value="completed">Concluída</option><option value="pending">Pendente</option><option value="cancelled">Cancelada</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelClass}>Data da Transação</label>
        <input required type="date" value={transactionDate} onChange={e => setTransactionDate(e.target.value)} className={inputClass} />
      </div>

      <div className="space-y-1">
        <label className={labelClass}>Conta</label>
        <select required value={accountId} onChange={e => setAccountId(e.target.value)} className={inputClass}>
          <option value="" disabled>Selecione uma conta</option>
          {accounts?.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={closeAllModals} className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]">Cancelar</button>
        <button type="submit" disabled={isPending} className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50">Salvar</button>
      </div>
    </form>
  )
}
