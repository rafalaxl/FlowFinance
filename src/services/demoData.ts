// ─── FlowFinance — Demo Data ─────────────────────────────────────────────────
// Mock data for offline demo mode (no Supabase required).
// ─────────────────────────────────────────────────────────────────────────────

import type { Transaction, Account, Category, Profile } from '../types/database.types'
import type { DashboardKPIs } from '../types/database.types'

// ── Helpers ──────────────────────────────────────────────────────────────────

const TENANT = 'a0000000-0000-0000-0000-000000000001'
const USER   = 'b0000000-0000-0000-0000-000000000001'
const now = new Date().toISOString()

function daysAgo(d: number): string {
  const dt = new Date(); dt.setDate(dt.getDate() - d)
  return dt.toISOString().split('T')[0] as string
}
function daysFromNow(d: number): string {
  const dt = new Date(); dt.setDate(dt.getDate() + d)
  return dt.toISOString().split('T')[0] as string
}

// ── Demo User ────────────────────────────────────────────────────────────────

export const DEMO_USER = {
  id: USER,
  email: 'carlos@flowfinance.com.br',
  user_metadata: { full_name: 'Carlos Mendes', role: 'owner', tenant_id: TENANT },
  app_metadata: {},
  aud: 'authenticated',
  created_at: now,
} as const

export const DEMO_PROFILE: Profile = {
  id: USER, tenant_id: TENANT, email: 'carlos@flowfinance.com.br',
  full_name: 'Carlos Mendes', role: 'owner', created_at: now, updated_at: now,
}

// ── Accounts ─────────────────────────────────────────────────────────────────

export const DEMO_ACCOUNTS: Account[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001', tenant_id: TENANT,
    name: 'Conta Corrente Principal', type: 'checking',
    balance: 85000, currency: 'BRL', created_at: now, updated_at: now,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002', tenant_id: TENANT,
    name: 'Reserva de Emergência', type: 'savings',
    balance: 40000, currency: 'BRL', created_at: now, updated_at: now,
  },
]

// ── Categories ───────────────────────────────────────────────────────────────

const CAT_SAL   = 'd0000000-0000-0000-0000-000000000001'
const CAT_SERV  = 'd0000000-0000-0000-0000-000000000002'
const CAT_ALUG  = 'd0000000-0000-0000-0000-000000000003'
const CAT_SOFT  = 'd0000000-0000-0000-0000-000000000004'
const CAT_PROD  = 'd0000000-0000-0000-0000-000000000005'

export const DEMO_CATEGORIES: Category[] = [
  { id: CAT_SAL,  tenant_id: TENANT, name: 'Salários',             type: 'expense', color: '#EF4444', created_at: now, updated_at: now },
  { id: CAT_SERV, tenant_id: TENANT, name: 'Serviços Prestados',   type: 'income',  color: '#10B981', created_at: now, updated_at: now },
  { id: CAT_ALUG, tenant_id: TENANT, name: 'Aluguel',              type: 'expense', color: '#F59E0B', created_at: now, updated_at: now },
  { id: CAT_SOFT, tenant_id: TENANT, name: 'Software/SaaS',        type: 'expense', color: '#6366F1', created_at: now, updated_at: now },
  { id: CAT_PROD, tenant_id: TENANT, name: 'Receita de Produtos',  type: 'income',  color: '#059669', created_at: now, updated_at: now },
]

// ── Transactions ─────────────────────────────────────────────────────────────

const ACC1 = DEMO_ACCOUNTS[0]!.id

function tx(
  idx: number, amount: number, desc: string,
  type: 'income' | 'expense', status: 'completed' | 'pending',
  catId: string, txDate: string, dueDate: string | null,
): Transaction {
  return {
    id: `e0000000-0000-0000-0000-00000000000${idx}`,
    tenant_id: TENANT, account_id: ACC1, category_id: catId,
    user_id: USER, amount, description: desc, type, status,
    transaction_date: txDate, due_date: dueDate,
    created_at: now, updated_at: now,
  }
}

export let DEMO_TRANSACTIONS: Transaction[] = [
  tx(1, 35000, 'Contrato Mensal — Cliente Alpha',       'income',  'completed', CAT_SERV, daysAgo(2),  null),
  tx(2, 18000, 'Folha de Pagamento — Junho',             'expense', 'completed', CAT_SAL,  daysAgo(5),  null),
  tx(3,  4500, 'Aluguel Escritório — Junho',              'expense', 'completed', CAT_ALUG, daysAgo(10), null),
  tx(4,  1200, 'Licenças AWS — Junho',                    'expense', 'completed', CAT_SOFT, daysAgo(8),  null),
  tx(5, 22000, 'Venda SaaS — Plano Enterprise',           'income',  'completed', CAT_PROD, daysAgo(3),  null),
  tx(6,  2800, 'Figma + Notion — Assinaturas',            'expense', 'completed', CAT_SOFT, daysAgo(12), null),
  tx(7,  1389, 'Google Workspace — Equipe',               'expense', 'completed', CAT_SOFT, daysAgo(15), null),
  tx(8, 15000, 'Consultoria Financeira — Cliente Beta',   'income',  'pending',   CAT_SERV, daysAgo(0),  daysFromNow(3)),
  tx(9,  8500, 'Licença Anual — Cliente Gamma',           'income',  'pending',   CAT_PROD, daysAgo(0),  daysFromNow(5)),
  tx(10, 4200, 'Fornecedor de Infra — NF pendente',       'expense', 'pending',   CAT_SOFT, daysAgo(0),  daysFromNow(2)),
  tx(11, 18000,'Folha de Pagamento — Julho (prev.)',      'expense', 'pending',   CAT_SAL,  daysAgo(0),  daysFromNow(6)),
  tx(12, 12000,'Contrato Mensal — Cliente Delta',         'income',  'completed', CAT_SERV, daysAgo(18), null),
]

// ── Pre-calculated KPIs ──────────────────────────────────────────────────────

const pendingPayables    = DEMO_TRANSACTIONS.filter(t => t.status === 'pending' && t.type === 'expense')
const pendingReceivables = DEMO_TRANSACTIONS.filter(t => t.status === 'pending' && t.type === 'income')

export const DEMO_KPIS: DashboardKPIs = {
  availableCash:     125000,
  monthlyBurnRate:   27889,
  projectedEbitda:   44311,
  pendingPayables,
  pendingReceivables,
}

export function addDemoTransaction(t: Transaction) {
  DEMO_TRANSACTIONS = [t, ...DEMO_TRANSACTIONS]
}

export function updateDemoTransaction(id: string, payload: any) {
  const i = DEMO_TRANSACTIONS.findIndex(t => t.id === id);
  if (i >= 0) {
    DEMO_TRANSACTIONS[i] = { ...DEMO_TRANSACTIONS[i], ...payload } as Transaction;
  }
}
