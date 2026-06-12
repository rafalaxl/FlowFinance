// ─── FlowFinance — main.tsx ───────────────────────────────────────────────────
// Entry point: QueryClientProvider + DevTools + ThemeProvider + App
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/services/queryClient'
import { useUIStore } from '@/store/uiStore'
import App from './App'
import '@/index.css'

// Apply persisted theme before first render
function ThemeInitializer() {
  const { theme } = useUIStore()

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      prefersDark ? root.classList.add('dark') : root.classList.remove('dark')
    }
  }, [theme])

  return null
}

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('#root element not found')

createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeInitializer />
      <App />
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  </StrictMode>
)
