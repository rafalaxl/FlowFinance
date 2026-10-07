// ─── FlowFinance — Transaction Schema (Zod) ─────────────────────────────────
// Validação de entrada de dados para lançamentos financeiros.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod'

export const transactionFormSchema = z
  .object({
    description: z
      .string()
      .trim()
      .min(2, 'Descrição deve ter no mínimo 2 caracteres'),
    amount: z.coerce
      .number({ invalid_type_error: 'Valor deve ser numérico' })
      .positive('O valor deve ser maior que zero'),
    type: z.enum(['income', 'expense']),
    status: z.enum(['pending', 'completed', 'cancelled']),
    transaction_date: z
      .string()
      .min(1, 'Data da transação é obrigatória')
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data da transação inválida'),
    due_date: z.string().nullable().optional(),
    account_id: z.string().optional(),
    category_id: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'pending') {
      if (!data.due_date || data.due_date.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Data de vencimento é obrigatória para transações pendentes',
          path: ['due_date'],
        })
      }
    }
  })

export type TransactionFormData = z.infer<typeof transactionFormSchema>
