// ─── FlowFinance — ThemeToggle ────────────────────────────────────────────────
import { useUIStore } from '@/store/uiStore'

const options = [
  { value: 'light' as const, label: 'Claro', icon: '☀️' },
  { value: 'dark'  as const, label: 'Escuro', icon: '🌙' },
  { value: 'system' as const, label: 'Sistema', icon: '💻' },
]

export function ThemeToggle() {
  const { theme, setTheme } = useUIStore()

  return (
    <div
      className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-1"
      role="group"
      aria-label="Seleção de tema"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          aria-pressed={theme === opt.value}
          title={opt.label}
          className={[
            'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
            theme === opt.value
              ? 'bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] shadow-sm'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
          ].join(' ')}
        >
          <span aria-hidden="true">{opt.icon}</span>
          <span className="hidden sm:inline">{opt.label}</span>
        </button>
      ))}
    </div>
  )
}
