// ─── FlowFinance — AboutSection ───────────────────────────────────────────────
// App version and tagline for Settings page.
// ─────────────────────────────────────────────────────────────────────────────

export function AboutSection() {
  return (
    <section
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5"
      aria-labelledby="settings-about"
    >
      <h2
        id="settings-about"
        className="text-sm font-semibold text-[var(--color-text-primary)]"
      >
        Sobre
      </h2>

      <div className="mt-4 space-y-2">
        <p className="text-sm text-[var(--color-text-primary)]">
          FlowFinance v0.1.0 MVP
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          Plataforma de gestão financeira inteligente
        </p>
      </div>
    </section>
  )
}
