// ─── FlowFinance — DashboardLayout ───────────────────────────────────────────
// Sidebar + Topbar responsivo com suporte a dark mode
import { type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { useAuth } from '@/hooks/useAuth'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface NavItem {
  to: string
  label: string
  icon: string
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard',    label: 'Dashboard',    icon: '📊' },
  { to: '/transactions', label: 'Transações',   icon: '💳' },
  { to: '/settings',     label: 'Configurações', icon: '⚙️' },
]

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { signOut, user } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg-primary)]">
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden" 
          onClick={toggleSidebar} 
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'flex flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] transition-all duration-200',
          sidebarOpen ? 'w-56 translate-x-0' : '-translate-x-full w-56 lg:w-16 lg:translate-x-0',
          'fixed inset-y-0 left-0 z-30 lg:relative lg:z-auto',
        ].join(' ')}
        aria-label="Navegação principal"
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 border-b border-[var(--color-border)] px-4">
          <span className="text-lg font-semibold text-[var(--color-accent)]" aria-hidden="true">⬡</span>
          {sidebarOpen && (
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">FlowFinance</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => [
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]',
              ].join(' ')}
            >
              <span aria-hidden="true">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div className="border-t border-[var(--color-border)] p-3">
            <p className="truncate text-xs text-[var(--color-text-muted)]">{user?.email ?? '…'}</p>
            <button
              onClick={handleSignOut}
              className="mt-1 text-xs text-[var(--color-danger)] hover:underline"
            >
              Sair
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-0">
        {/* Topbar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4">
          <button
            onClick={toggleSidebar}
            className="rounded-md p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)]"
            aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            ☰
          </button>
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6" id="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
