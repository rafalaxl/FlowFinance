// ─── FlowFinance — SkeletonCard ───────────────────────────────────────────────
// Skeleton reutilizável para qualquer card/área de carregamento
import type { HTMLAttributes } from 'react'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string
  height?: string
}

function Skeleton({ width = 'w-full', height = 'h-4', className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`skeleton rounded-md ${width} ${height} ${className}`}
      aria-hidden="true"
      {...props}
    />
  )
}

interface SkeletonCardProps {
  lines?: number
}

export function SkeletonCard({ lines = 3 }: SkeletonCardProps) {
  return (
    <div
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6"
      role="status"
      aria-label="Carregando…"
    >
      <Skeleton width="w-1/3" height="h-3" className="mb-4" />
      <Skeleton width="w-1/2" height="h-8" className="mb-3" />
      {Array.from({ length: lines - 2 }).map((_, i) => (
        <Skeleton key={i} width={i % 2 === 0 ? 'w-full' : 'w-3/4'} height="h-3" className="mt-2" />
      ))}
    </div>
  )
}

export { Skeleton }
