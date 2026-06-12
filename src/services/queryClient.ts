// ─── FlowFinance — TanStack QueryClient ──────────────────────────────────────
// Singleton with retry, exponential back-off and staleTime tuned for
// financial dashboards (data refreshed every 5 min by default).
// ─────────────────────────────────────────────────────────────────────────────

import { QueryClient } from '@tanstack/react-query'

// Exponential back-off: 1s → 2s → 4s (capped at 30s)
const retryDelay = (attempt: number): number =>
  Math.min(1_000 * 2 ** attempt, 30_000)

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Financial data: stale after 5 min, re-fetched on window focus
      staleTime: 5 * 60 * 1_000,
      gcTime: 10 * 60 * 1_000,
      retry: 3,
      retryDelay,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 1,
      retryDelay,
      onError: (error: unknown) => {
        // Global mutation error logger — replace with toast/sentry in prod
        console.error('[FlowFinance] Mutation error:', error)
      },
    },
  },
})

export default queryClient
