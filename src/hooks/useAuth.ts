// ─── FlowFinance — useAuth ────────────────────────────────────────────────────
// Authentication hook: login, logout, signup, session persistence.
// The signup passes tenant_id in options.data so the DB trigger
// handle_new_user creates the profile correctly.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react'
import type { Session, User, AuthError } from '@supabase/supabase-js'
import { supabase } from '../services/supabaseClient'
import { useUIStore } from '../store/uiStore'
import { DEMO_USER } from '../services/demoData'

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
  signIn:     (payload: SignInPayload) => Promise<void>
  signUp:     (payload: SignUpPayload) => Promise<void>
  signOut:    () => Promise<void>
  signInDemo: () => void
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): UseAuthReturn {
  const isDemoMode = useUIStore((s) => s.isDemoMode)
  const setDemoMode = useUIStore((s) => s.setDemoMode)

  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    isLoading: true,
    error: null,
  })

  // Hydrate session on mount & subscribe to auth changes
  useEffect(() => {
    if (isDemoMode) {
      setState({ session: null, user: DEMO_USER as unknown as User, isLoading: false, error: null })
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({ ...prev, session, user: session?.user ?? null, isLoading: false }))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(prev => ({ ...prev, session, user: session?.user ?? null, isLoading: false }))
    })

    return () => subscription.unsubscribe()
  }, [isDemoMode])

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
    setDemoMode(false)
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    const { error } = await supabase.auth.signOut()
    setState(prev => ({ ...prev, session: null, user: null, isLoading: false, error: error ?? null }))
    if (error) throw error
  }, [setDemoMode])

  const signInDemo = useCallback(() => {
    setDemoMode(true)
    setState({ session: null, user: DEMO_USER as unknown as User, isLoading: false, error: null })
  }, [setDemoMode])

  return { ...state, signIn, signUp, signOut, signInDemo }
}
