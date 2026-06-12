// ─── FlowFinance — lib/formatters ────────────────────────────────────────────
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Formata valor em BRL.
 * @param compact - true para formato compacto (ex: R$ 12,5K)
 */
export function formatCurrency(value: number, compact = false): string {
  if (compact) {
    if (Math.abs(value) >= 1_000_000)
      return `R$ ${(value / 1_000_000).toFixed(1)}M`
    if (Math.abs(value) >= 1_000)
      return `R$ ${(value / 1_000).toFixed(1)}K`
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value)
}

/** Formata data ISO para exibição curta (ex: 12/06/2026) */
export function formatDate(iso: string): string {
  return format(parseISO(iso), 'dd/MM/yyyy', { locale: ptBR })
}

/** Formata data ISO para exibição longa (ex: 12 de jun. de 2026) */
export function formatDateLong(iso: string): string {
  return format(parseISO(iso), "d 'de' MMM 'de' yyyy", { locale: ptBR })
}

/** Formata período (YYYY-MM) como "Jun 2026" */
export function formatPeriod(ym: string): string {
  const [year, month] = ym.split('-').map(Number)
  return format(new Date(year, (month ?? 1) - 1), 'MMM yyyy', { locale: ptBR })
}
