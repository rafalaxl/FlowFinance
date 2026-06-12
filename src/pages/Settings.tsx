// ─── FlowFinance — Settings Page ──────────────────────────────────────────────
// Configurações: perfil, tenant, aparência e sobre.
// ─────────────────────────────────────────────────────────────────────────────

import { useAuth } from '@/hooks/useAuth'
import { ProfileSection } from '@/features/settings/ProfileSection'
import { TenantSection } from '@/features/settings/TenantSection'
import { AppearanceSection } from '@/features/settings/AppearanceSection'
import { AboutSection } from '@/features/settings/AboutSection'

export default function Settings() {
  const { user } = useAuth()

  const email = user?.email ?? '—'
  const fullName =
    (user?.user_metadata?.full_name as string | undefined) ?? 'Usuário'

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-2">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
          Configurações
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Gerencie suas preferências e informações
        </p>
      </div>

      {/* ── Sections ────────────────────────────────────────────────── */}
      <ProfileSection email={email} fullName={fullName} />
      <TenantSection />
      <AppearanceSection />
      <AboutSection />
    </div>
  )
}
