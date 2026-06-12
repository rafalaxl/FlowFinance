// ─── FlowFinance — Database Types ────────────────────────────────────────────
// Auto-typed from schema migrations 001, 002, 003
// ─────────────────────────────────────────────────────────────────────────────

export type TenantPlan = 'free' | 'starter' | 'pro' | 'enterprise'
export type UserRole = 'owner' | 'admin' | 'analyst' | 'viewer'
export type AccountType = 'checking' | 'savings' | 'credit' | 'investment'
export type CategoryType = 'income' | 'expense'
export type TransactionType = 'income' | 'expense'
export type TransactionStatus = 'pending' | 'completed' | 'cancelled'

// ── Tables ───────────────────────────────────────────────────────────────────

export interface Tenant {
  id: string
  name: string
  plan: TenantPlan
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string          // refs auth.users
  tenant_id: string
  email: string
  full_name: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  tenant_id: string
  name: string
  type: AccountType
  balance: number
  currency: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  tenant_id: string
  name: string
  type: CategoryType
  color: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  tenant_id: string
  account_id: string
  category_id: string | null
  user_id: string
  amount: number
  description: string
  type: TransactionType
  status: TransactionStatus
  transaction_date: string   // ISO date
  due_date: string | null    // ISO date
  created_at: string
  updated_at: string
}

// ── Views ────────────────────────────────────────────────────────────────────

export interface AccountBalanceRow {
  id: string
  tenant_id: string
  name: string
  type: AccountType
  balance: number
  currency: string
}

// ── Mutation Payloads ────────────────────────────────────────────────────────

export type TransactionInsert = Omit<Transaction, 'id' | 'created_at' | 'updated_at'>
export type TransactionUpdate = Partial<Omit<Transaction, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>>

export type AccountInsert = Omit<Account, 'id' | 'created_at' | 'updated_at'>
export type CategoryInsert = Omit<Category, 'id' | 'created_at' | 'updated_at'>

// ── KPI Shapes ───────────────────────────────────────────────────────────────

export interface DashboardKPIs {
  availableCash: number
  monthlyBurnRate: number
  projectedEbitda: number
  pendingPayables: Transaction[]
  pendingReceivables: Transaction[]
}
