// ─── FlowFinance — TenantSection ──────────────────────────────────────────────
// Exibe os dados reais do Tenant (Organização, Plano e Membros) via useTenant.
// ─────────────────────────────────────────────────────────────────────────────

import { useTenant } from '@/hooks/useTenant'

export function TenantSection() {
  const { data, isLoading } = useTenant()

  const orgName = data?.tenant?.name ?? (isLoading ? 'Carregando…' : 'Minha Organização')
  const plan = data?.tenant?.plan
    ? data.tenant.plan.charAt(0).toUpperCase() + data.tenant.plan.slice(1)
    : 'Starter'
  const members = data?.memberCount ?? 1

  return (
    <section
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5"
      aria-labelledby="settings-tenant"
    >
      <h2
        id="settings-tenant"
        className="text-sm font-semibold text-[var(--color-text-primary)]"
      >
        Conta &amp; Tenant
      </h2>

      <div className="mt-4 space-y-3">
        {/* Tenant name */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-secondary)]">
            Organização
          </span>
          <span className="text-sm text-[var(--color-text-primary)] font-medium">
            {orgName}
          </span>
        </div>

        {/* Plan */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-secondary)]">
            Plano
          </span>
          <span className="inline-flex items-center rounded-md bg-[var(--color-accent-subtle)] px-2 py-0.5 text-xs font-medium text-[var(--color-accent)]">
            {plan}
          </span>
        </div>

        {/* Members */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-secondary)]">
            Membros
          </span>
          <span className="text-sm text-[var(--color-text-primary)]">
            {isLoading ? '…' : `${members} ${members === 1 ? 'membro' : 'membros'}`}
          </span>
        </div>
      </div>
    </section>
  )
}
