import { useState } from 'react'
import { useCreateTransaction } from '@/hooks/useTransactions'
import { useAccounts } from '@/hooks/useAccounts'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/store/uiStore'
import { supabase } from '@/services/supabaseClient'
import type { TransactionType, TransactionStatus } from '@/types/database.types'

export function TransactionForm() {
  const { mutate, isPending } = useCreateTransaction()
  const { data: accounts } = useAccounts()
  const { user } = useAuth()
  const closeAllModals = useUIStore((s) => s.closeAllModals)

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const [status, setStatus] = useState<TransactionStatus>('completed')
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0] as string)

  const tenantId = user?.user_metadata?.tenant_id || user?.app_metadata?.tenant_id || 'a0000000-0000-0000-0000-000000000001'
  const userId = user?.id || 'b0000000-0000-0000-0000-000000000001'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    let targetAccountId = accounts?.[0]?.id

    // Se o usuário não tem nenhuma conta, criamos uma invisível na hora para ele!
    if (!targetAccountId) {
      const isDemo = useUIStore.getState().isDemoMode
      if (isDemo) {
        targetAccountId = 'c0000000-0000-0000-0000-000000000001'
      } else {
        // Tenta criar no Supabase real
        const result: any = await supabase.from('accounts').insert({
          tenant_id: tenantId,
          name: 'Caixa Geral',
          type: 'checking',
          balance: 0,
          currency: 'BRL'
        } as any).select().single()
        
        if (result.data && result.data.id) {
          targetAccountId = result.data.id
        } else {
          // Fallback se o banco bloquear (ex: erro de RLS por usuário criado manualmente)
          targetAccountId = 'c0000000-0000-0000-0000-000000000001'
        }
      }
    }

    mutate({
      tenant_id: tenantId,
      user_id: userId,
      account_id: targetAccountId as string,
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

  const inputClass = "w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
  const labelClass = "text-sm font-medium text-[var(--color-text-secondary)]"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className={labelClass}>Descrição</label>
        <input required type="text" value={description} onChange={e => setDescription(e.target.value)} className={inputClass} placeholder="Ex: Aluguel do escritório" />
      </div>

      <div className="space-y-1">
        <label className={labelClass}>Valor (R$)</label>
        <input required type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className={inputClass} placeholder="0,00" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className={labelClass}>Tipo</label>
          <select value={type} onChange={e => setType(e.target.value as TransactionType)} className={inputClass}>
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value as TransactionStatus)} className={inputClass}>
            <option value="completed">Concluída</option>
            <option value="pending">Pendente</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelClass}>Data da Transação</label>
        <input required type="date" value={transactionDate} onChange={e => setTransactionDate(e.target.value)} className={inputClass} />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={closeAllModals} className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors">Cancelar</button>
        <button type="submit" disabled={isPending} className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-colors">
          {isPending ? 'Salvando...' : 'Salvar Lançamento'}
        </button>
      </div>
    </form>
  )
}
