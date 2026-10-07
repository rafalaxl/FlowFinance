// ─── FlowFinance — ProfileSection ─────────────────────────────────────────────
// Exibe os dados de perfil reais do usuário logado via useTenant com fallback.
// ─────────────────────────────────────────────────────────────────────────────

import { useTenant } from '@/hooks/useTenant'

interface ProfileSectionProps {
  email?: string
  fullName?: string
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'Proprietário',
  admin: 'Administrador',
  analyst: 'Analista',
  viewer: 'Visualizador',
}

export function ProfileSection({ email: fallbackEmail, fullName: fallbackName }: ProfileSectionProps) {
  const { data, isLoading } = useTenant()

  const displayName = data?.profile?.full_name || fallbackName || (isLoading ? 'Carregando…' : 'Usuário')
  const displayEmail = data?.profile?.email || fallbackEmail || '—'
  const rawRole = data?.profile?.role || 'admin'
  const roleLabel = ROLE_LABELS[rawRole] || rawRole

  return (
    <section
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5"
      aria-labelledby="settings-profile"
    >
      <h2
        id="settings-profile"
        className="text-sm font-semibold text-[var(--color-text-primary)]"
      >
        Perfil do Usuário
      </h2>

      <div className="mt-4 space-y-3">
        {/* Name */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-secondary)]">
            Nome
          </span>
          <span className="text-sm text-[var(--color-text-primary)] font-medium">
            {displayName}
          </span>
        </div>

        {/* Email */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-secondary)]">
            E-mail
          </span>
          <span className="text-sm text-[var(--color-text-primary)]">
            {displayEmail}
          </span>
        </div>

        {/* Role badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-secondary)]">
            Função
          </span>
          <span className="inline-flex items-center rounded-md bg-[var(--color-accent-subtle)] px-2 py-0.5 text-xs font-medium text-[var(--color-accent)] capitalize">
            {roleLabel}
          </span>
        </div>
      </div>
    </section>
  )
}
