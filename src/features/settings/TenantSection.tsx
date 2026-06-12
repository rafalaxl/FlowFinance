// ─── FlowFinance — TenantSection ──────────────────────────────────────────────
// Hardcoded tenant / account info for Settings MVP.
// ─────────────────────────────────────────────────────────────────────────────

export function TenantSection() {
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
          <span className="text-sm text-[var(--color-text-primary)]">
            Acme Corp Ltda
          </span>
        </div>

        {/* Plan */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-secondary)]">
            Plano
          </span>
          <span className="inline-flex items-center rounded-md bg-[var(--color-accent-subtle)] px-2 py-0.5 text-xs font-medium text-[var(--color-accent)]">
            Pro
          </span>
        </div>

        {/* Members */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-secondary)]">
            Membros
          </span>
          <span className="text-sm text-[var(--color-text-primary)]">
            3 membros
          </span>
        </div>
      </div>
    </section>
  )
}
