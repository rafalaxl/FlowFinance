// ─── FlowFinance — AppearanceSection ──────────────────────────────────────────
// Theme selection section for Settings page.
// ─────────────────────────────────────────────────────────────────────────────

import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function AppearanceSection() {
  return (
    <section
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5"
      aria-labelledby="settings-appearance"
    >
      <h2
        id="settings-appearance"
        className="text-sm font-semibold text-[var(--color-text-primary)]"
      >
        Aparência
      </h2>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-[var(--color-text-secondary)]">
              Tema
            </span>
            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
              Escolha entre modo claro, escuro ou automático do sistema.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </section>
  )
}
