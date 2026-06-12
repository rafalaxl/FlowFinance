// ─── FlowFinance — ProfileSection ─────────────────────────────────────────────
// Read-only user profile card for Settings page.
// ─────────────────────────────────────────────────────────────────────────────

interface ProfileSectionProps {
  email: string
  fullName: string
}

export function ProfileSection({ email, fullName }: ProfileSectionProps) {
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
          <span className="text-sm text-[var(--color-text-primary)]">
            {fullName}
          </span>
        </div>

        {/* Email */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-secondary)]">
            E-mail
          </span>
          <span className="text-sm text-[var(--color-text-primary)]">
            {email}
          </span>
        </div>

        {/* Role badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-secondary)]">
            Função
          </span>
          <span className="inline-flex items-center rounded-md bg-[var(--color-accent-subtle)] px-2 py-0.5 text-xs font-medium text-[var(--color-accent)]">
            Admin
          </span>
        </div>
      </div>
    </section>
  )
}
