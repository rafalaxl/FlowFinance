// ─── FlowFinance — Date Helpers ──────────────────────────────────────────────
// Funções seguras de manipulação de data no fuso horário local via date-fns.
// Evita desvios causados por new Date().toISOString() / UTC parsing.
// ─────────────────────────────────────────────────────────────────────────────

import { format, startOfMonth, endOfMonth, addDays, parseISO } from 'date-fns'

/** Retorna data formatada em YYYY-MM-DD no fuso local. */
export function toLocalISODate(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

/** Retorna a data de hoje em YYYY-MM-DD no fuso local. */
export function todayISO(): string {
  return toLocalISODate(new Date())
}

/** Retorna os limites (início e fim) do mês corrente em YYYY-MM-DD local. */
export function monthBoundsISO(date: Date = new Date()): { start: string; end: string } {
  return {
    start: toLocalISODate(startOfMonth(date)),
    end: toLocalISODate(endOfMonth(date)),
  }
}

/** Adiciona N dias à data base e retorna YYYY-MM-DD no fuso local. */
export function addDaysISO(n: number, from: Date = new Date()): string {
  return toLocalISODate(addDays(from, n))
}

export { parseISO }
