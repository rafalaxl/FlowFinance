// ─── FlowFinance — useTransactionForm ─────────────────────────────────────────
// Hook desacoplado para controle de estado, validação Zod e submissão de transação.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, type FormEvent } from 'react'
import { useCreateTransaction } from './useTransactions'
import { useEnsureDefaultAccount } from './useEnsureDefaultAccount'
import { useUIStore } from '../store/uiStore'
import { transactionFormSchema } from '../lib/schemas/transaction'
import { todayISO } from '../lib/dates'
import type { TransactionType, TransactionStatus, TransactionInsert } from '../types/database.types'

export function useTransactionForm() {
  const { mutateAsync, isPending } = useCreateTransaction()
  const { ensureDefaultAccount } = useEnsureDefaultAccount()
  const closeAllModals = useUIStore((s) => s.closeAllModals)

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const [status, setStatus] = useState<TransactionStatus>('completed')
  const [transactionDate, setTransactionDate] = useState(todayISO())
  const [dueDate, setDueDate] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setDescription('')
    setAmount('')
    setType('expense')
    setStatus('completed')
    setTransactionDate(todayISO())
    setDueDate('')
    setErrorMsg(null)
    setFieldErrors({})
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setFieldErrors({})

    const validationResult = transactionFormSchema.safeParse({
      description,
      amount: amount === '' ? undefined : Number(amount),
      type,
      status,
      transaction_date: transactionDate,
      due_date: status === 'pending' && dueDate ? dueDate : null,
    })

    if (!validationResult.success) {
      const errors: Record<string, string> = {}
      for (const issue of validationResult.error.issues) {
        const field = issue.path[0] as string
        if (field && !errors[field]) {
          errors[field] = issue.message
        }
      }
      setFieldErrors(errors)
      setErrorMsg(validationResult.error.issues[0]?.message ?? 'Dados inválidos.')
      return
    }

    try {
      const targetAccountId = await ensureDefaultAccount()

      // Payload sem tenant_id nem user_id (preenchidos via RLS/triggers no banco)
      const payload: TransactionInsert = {
        account_id: targetAccountId,
        category_id: null,
        amount: validationResult.data.amount,
        description: validationResult.data.description,
        type: validationResult.data.type,
        status: validationResult.data.status,
        transaction_date: validationResult.data.transaction_date,
        due_date: validationResult.data.status === 'pending' ? (validationResult.data.due_date ?? null) : null,
      }

      await mutateAsync(payload)
      resetForm()
      closeAllModals()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao salvar transação.'
      setErrorMsg(message)
    }
  }

  return {
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
  }
}
