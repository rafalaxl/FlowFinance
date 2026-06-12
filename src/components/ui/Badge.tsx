// ─── FlowFinance — Badge ──────────────────────────────────────────────────────
import type { ReactNode } from 'react'

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
}

const variantClass: Record<BadgeVariant, string> = {
  success: 'badge-success',
  danger:  'badge-danger',
  warning: 'badge-warning',
  info:    'badge-info',
  neutral: 'badge-neutral',
}

export function Badge({ variant = 'neutral', children }: BadgeProps) {
  return (
    <span className={variantClass[variant]}>
      {children}
    </span>
  )
}

// Mapeamento de status de transação para variante do badge
type TransactionStatus = 'pending' | 'completed' | 'cancelled'

export function statusBadge(status: TransactionStatus): BadgeVariant {
  const map: Record<TransactionStatus, BadgeVariant> = {
    completed: 'success',
    pending:   'warning',
    cancelled: 'danger',
  }
  return map[status]
}

export const statusLabel: Record<TransactionStatus, string> = {
  completed: 'Concluído',
  pending:   'Pendente',
  cancelled: 'Cancelado',
}
