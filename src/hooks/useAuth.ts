// ─── FlowFinance — useAuth ────────────────────────────────────────────────────
// Authentication hook: login, logout, signup, session persistence.
// The signup passes tenant_id in options.data so the DB trigger
// handle_new_user creates the profile correctly.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react'
import type { Session, User, AuthError } from '@supabase/supabase-js'
import { supabase } from '../services/supabaseClient'

// ── Types ─────────────────────────────────────────────────────────────────────

interface SignUpPayload {
  email: string
  password: string
  fullName: string
  tenantId: string    // passed to handle_new_user trigger
}

interface SignInPayload {
  email: string
  password: string
}

interface AuthState {
  session: Session | null
  user: User | null
  isLoading: boolean
  error: AuthError | null
}

interface UseAuthReturn extends AuthState {
  signIn:  (payload: SignInPayload) => Promise<void>
  signUp:  (payload: SignUpPayload) => Promise<void>
  signOut: () => Promise<void>
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    isLoading: true,
    error: null,
  })

  // Hydrate session on mount & subscribe to auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({ ...prev, session, user: session?.user ?? null, isLoading: false }))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(prev => ({ ...prev, session, user: session?.user ?? null, isLoading: false }))
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async ({ email, password }: SignInPayload) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setState(prev => ({ ...prev, isLoading: false, error: error ?? null }))
    if (error) throw error
  }, [])

  const signUp = useCallback(async ({ email, password, fullName, tenantId }: SignUpPayload) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, tenant_id: tenantId } },
    })
    setState(prev => ({ ...prev, isLoading: false, error: error ?? null }))
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    const { error } = await supabase.auth.signOut()
    setState(prev => ({ ...prev, isLoading: false, error: error ?? null }))
    if (error) throw error
  }, [])

  return { ...state, signIn, signUp, signOut }
}
