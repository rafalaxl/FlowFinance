// ─── FlowFinance — Login Page ─────────────────────────────────────────────────
// Tela de login com Supabase Auth — sem gradientes, sem ruído visual
import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface LocationState {
  from?: { pathname: string }
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { signIn, signInDemo, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as LocationState)?.from?.pathname ?? '/dashboard'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    try {
      await signIn({ email, password })
      navigate(from, { replace: true })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao autenticar')
    }
  }

  function handleDemo() {
    signInDemo()
    navigate('/dashboard', { replace: true })
  }

  const inputClass = [
    'w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)]',
    'px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]',
    'focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20',
    'transition-colors',
  ].join(' ')

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-primary)] px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 text-center">
          <span className="text-4xl text-[var(--color-accent)]" aria-hidden="true">⬡</span>
          <h1 className="mt-3 text-xl font-semibold text-[var(--color-text-primary)]">FlowFinance</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Acesse sua conta corporativa</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
              E-mail corporativo
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className={inputClass}
              placeholder="voce@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className={inputClass}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {submitError && (
            <p role="alert" className="rounded-md border border-[var(--color-danger)]/30 bg-red-50 px-3 py-2 text-sm text-[var(--color-danger)] dark:bg-red-950/20">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            {isLoading ? 'Autenticando…' : 'Acessar Dashboard'}
          </button>
        </form>

        {/* ── Separator ── */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--color-border)]" />
          <span className="text-xs text-[var(--color-text-muted)]">ou</span>
          <div className="h-px flex-1 bg-[var(--color-border)]" />
        </div>

        {/* ── Demo Mode ── */}
        <button
          type="button"
          onClick={handleDemo}
          id="demo-login-btn"
          className="w-full rounded-md border border-[var(--color-accent)] bg-transparent px-4 py-2.5 text-sm font-medium text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30"
        >
          Acessar Demonstração
        </button>
        <p className="mt-2 text-center text-xs text-[var(--color-text-muted)]">
          Explore o dashboard com dados simulados
        </p>
      </div>
    </div>
  )
}

