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
  const isDemoMode = useUIStore((s) => s.isDemoMode)

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const [status, setStatus] = useState<TransactionStatus>('completed')
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0] as string)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const tenantId = user?.user_metadata?.tenant_id || user?.app_metadata?.tenant_id || (isDemoMode ? 'a0000000-0000-0000-0000-000000000001' : '')
  const userId = user?.id || (isDemoMode ? 'b0000000-0000-0000-0000-000000000001' : '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    
    console.log('Tenant ID do usuário:', tenantId)

    let targetAccountId = accounts?.[0]?.id

    // Se o usuário não tem nenhuma conta, criamos uma na hora para ele!
    if (!targetAccountId) {
      if (isDemoMode) {
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
        
        if (result.error) {
          console.log('Erro Supabase:', result.error)
          setErrorMsg(`Erro ao criar conta: ${result.error.message || result.error.details || 'Desconhecido'}`)
          return
        }

        if (result.data && result.data.id) {
          targetAccountId = result.data.id
        } else {
          setErrorMsg('Erro inesperado ao criar conta padrão.')
          return
        }
      }
    }

    if (!userId) {
      setErrorMsg('Usuário não autenticado.')
      return
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
      },
      onError: (err: any) => {
        console.log('Erro Supabase:', err)
        setErrorMsg(`Falha na transação: ${err.message || 'Erro desconhecido'}`)
      }
    })
  }

  const inputClass = "w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
  const labelClass = "text-sm font-medium text-[var(--color-text-secondary)]"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMsg && (
        <div className="rounded-md bg-red-50 p-3 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
        </div>
      )}

      <div className="space-y-1">
        <label className={labelClass}>Descrição</label>
        <input required type="text" value={description} onChange={e => setDescription(e.target.value)} className={inputClass} placeholder="Ex: Aluguel do escritório" />
      </div>

      <div className="space-y-1">
        <label className={labelClass}>Valor (R$)</label>
        <input required type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className={inputClass} placeholder="0,00" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <button type="button" onClick={closeAllModals} className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 transition-colors">Cancelar</button>
        <button type="submit" disabled={isPending} className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 disabled:opacity-50 transition-colors">
          {isPending ? 'Salvando...' : 'Adicionar'}
        </button>
      </div>
    </form>
  )
}
