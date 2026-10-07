// ─── FlowFinance — useTenant ──────────────────────────────────────────────────
// Busca dados reais do Tenant, Perfil e contagem de membros do usuário autenticado.
// No modo demo, retorna os dados simulados consistentes com DEMO_PROFILE.
// ─────────────────────────────────────────────────────────────────────────────

import { useQuery } from '@tanstack/react-query'
import { supabase } from '../services/supabaseClient'
import { useAuth } from './useAuth'
import { useUIStore } from '../store/uiStore'
import { DEMO_PROFILE } from '../services/demoData'
import type { Tenant, Profile } from '../types/database.types'

export interface TenantInfo {
  tenant: Tenant | null
  profile: Profile | null
  memberCount: number
}

const DEMO_TENANT_DATA: TenantInfo = {
  tenant: {
    id: DEMO_PROFILE.tenant_id,
    name: 'FlowFinance Demonstração',
    plan: 'pro',
    created_at: DEMO_PROFILE.created_at,
    updated_at: DEMO_PROFILE.updated_at,
  },
  profile: DEMO_PROFILE,
  memberCount: 3,
}

async function fetchTenantInfo(userId: string): Promise<TenantInfo> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileData, error: profErr } = await (supabase.from('profiles') as any)
    .select('*')
    .eq('id', userId)
    .single()

  const profile = profileData as Profile | null
  if (profErr || !profile) {
    return {
      tenant: null,
      profile: null,
      memberCount: 1,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tenantData } = await (supabase.from('tenants') as any)
    .select('*')
    .eq('id', profile.tenant_id)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (supabase.from('profiles') as any)
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', profile.tenant_id)

  return {
    tenant: (tenantData as Tenant) ?? null,
    profile,
    memberCount: count ?? 1,
  }
}

export function useTenant() {
  const { user } = useAuth()
  const isDemoMode = useUIStore((s) => s.isDemoMode)

  const query = useQuery({
    queryKey: ['tenant', user?.id],
    queryFn: () => fetchTenantInfo(user!.id),
    enabled: !isDemoMode && !!user?.id,
    staleTime: 5 * 60 * 1_000,
  })

  if (isDemoMode) {
    return {
      data: DEMO_TENANT_DATA,
      isLoading: false,
      isError: false,
    }
  }

  return query
}
