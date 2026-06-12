import { useMemo } from 'react'
import type { Transaction } from '@/types/database.types'
import type { CashFlowDataPoint } from '@/components/ui/CashFlowChart'
import type { BarChartDataPoint } from '@/components/ui/BarChart'
import type { DonutChartDataPoint } from '@/components/ui/DonutChart'

interface UseChartDataResult {
  cashFlowData: CashFlowDataPoint[]
  barData: BarChartDataPoint[]
  donutData: DonutChartDataPoint[]
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function useChartData(txList: Transaction[]): UseChartDataResult {
  return useMemo(() => {
    if (!txList || txList.length === 0) {
      return {
        cashFlowData: [],
        barData: [],
        donutData: [{ name: 'Sem Receitas', value: 0 }],
      }
    }

    // 1. CashFlow Data (Group by month/year)
    // Create a map: "YYYY-MM" -> { income, expense }
    const cashFlowMap = new Map<string, { income: number; expense: number }>()
    
    txList.forEach(tx => {
      if (!tx.transaction_date) return
      
      const date = new Date(tx.transaction_date)
      if (isNaN(date.getTime())) return
      
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!cashFlowMap.has(key)) {
        cashFlowMap.set(key, { income: 0, expense: 0 })
      }
      
      const current = cashFlowMap.get(key)!
      if (tx.type === 'income') {
        current.income += tx.amount
      } else {
        current.expense += tx.amount
      }
    })

    const sortedKeys = Array.from(cashFlowMap.keys()).sort()
    const cashFlowData: CashFlowDataPoint[] = sortedKeys.map(key => {
      const [yearStr, monthStr] = key.split('-')
      const monthIdx = parseInt(monthStr, 10) - 1
      const period = `${MONTHS[monthIdx]}/${yearStr.slice(2)}`
      const { income, expense } = cashFlowMap.get(key)!
      return {
        period,
        income,
        expense,
        balance: income - expense,
      }
    })

    // 2. Bar Data (Top 5 expenses grouped by description, as categories are just IDs)
    const expenseMap = new Map<string, number>()
    txList.forEach(tx => {
      if (tx.type === 'expense') {
        const name = tx.description || 'Despesa'
        expenseMap.set(name, (expenseMap.get(name) || 0) + tx.amount)
      }
    })
    
    const sortedExpenses = Array.from(expenseMap.entries())
      .sort((a, b) => b[1] - a[1])
      
    const barData: BarChartDataPoint[] = sortedExpenses.slice(0, 5).map(([category, value]) => ({
      category,
      value
    }))

    // 3. Donut Data (Top 4 incomes + Outros)
    const incomeMap = new Map<string, number>()
    txList.forEach(tx => {
      if (tx.type === 'income') {
        const name = tx.description || 'Receita'
        incomeMap.set(name, (incomeMap.get(name) || 0) + tx.amount)
      }
    })

    const sortedIncomes = Array.from(incomeMap.entries())
      .sort((a, b) => b[1] - a[1])
      
    let donutData: DonutChartDataPoint[] = []
    
    if (sortedIncomes.length === 0) {
      donutData = [{ name: 'Sem Receitas', value: 0 }]
    } else {
      const top4 = sortedIncomes.slice(0, 4)
      const others = sortedIncomes.slice(4)
      
      donutData = top4.map(([name, value]) => ({ name, value }))
      
      if (others.length > 0) {
        const othersTotal = others.reduce((acc, curr) => acc + curr[1], 0)
        donutData.push({ name: 'Outros', value: othersTotal })
      }
    }

    return {
      cashFlowData,
      barData,
      donutData,
    }
  }, [txList])
}
