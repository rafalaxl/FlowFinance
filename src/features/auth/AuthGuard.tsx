// ─── FlowFinance — AuthGuard ──────────────────────────────────────────────────
// Protege rotas privadas. Redireciona para /login se não autenticado.
import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/store/uiStore'

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { session, isLoading } = useAuth()
  const isDemoMode = useUIStore((s) => s.isDemoMode)
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--color-bg-primary)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-accent)]" />
          <p className="text-sm text-[var(--color-text-muted)]">Verificando sessão…</p>
        </div>
      </div>
    )
  }

  if (!session && !isDemoMode) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

