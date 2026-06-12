import { useSearchParams } from 'react-router-dom'
import { format, subDays, startOfMonth, subMonths, endOfMonth } from 'date-fns'

export function DateRangePicker() {
  const [searchParams, setSearchParams] = useSearchParams()

  const from = searchParams.get('de') || ''
  const to = searchParams.get('ate') || ''

  const setRange = (start: Date, end: Date) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('de', format(start, 'yyyy-MM-dd'))
    newParams.set('ate', format(end, 'yyyy-MM-dd'))
    setSearchParams(newParams)
  }

  const handlePreset = (preset: string) => {
    const today = new Date()
    switch (preset) {
      case 'today':
        setRange(today, today)
        break
      case '7days':
        setRange(subDays(today, 6), today)
        break
      case '30days':
        setRange(subDays(today, 29), today)
        break
      case 'thisMonth':
        setRange(startOfMonth(today), endOfMonth(today))
        break
      case 'lastMonth': {
        const lastMonth = subMonths(today, 1)
        setRange(startOfMonth(lastMonth), endOfMonth(lastMonth))
        break
      }
    }
  }

  const handleCustomDate = (key: 'de' | 'ate', value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) newParams.set(key, value)
    else newParams.delete(key)
    setSearchParams(newParams)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center space-x-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-1">
        <button onClick={() => handlePreset('today')} className="rounded px-2 py-1 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)]">Hoje</button>
        <button onClick={() => handlePreset('7days')} className="rounded px-2 py-1 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)]">7 dias</button>
        <button onClick={() => handlePreset('30days')} className="rounded px-2 py-1 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)]">30 dias</button>
        <button onClick={() => handlePreset('thisMonth')} className="rounded px-2 py-1 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)]">Este mês</button>
        <button onClick={() => handlePreset('lastMonth')} className="rounded px-2 py-1 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)]">Mês passado</button>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="date"
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2 py-1 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          value={from}
          onChange={(e) => handleCustomDate('de', e.target.value)}
        />
        <span className="text-xs text-[var(--color-text-muted)]">até</span>
        <input
          type="date"
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2 py-1 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          value={to}
          onChange={(e) => handleCustomDate('ate', e.target.value)}
        />
      </div>
    </div>
  )
}
