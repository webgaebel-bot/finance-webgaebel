export type AppRole = 'admin'

export interface UserRole {
  id: string
  user_id: string
  role: AppRole
  created_at: string
}

export interface Client {
  id: string
  name: string
  created_at: string
}

export interface Project {
  id: string
  client_id: string
  name: string
  total_value: number
  status: string
  created_at: string
  client?: Client
  received?: number
  pending?: number
}

export interface Payment {
  id: string
  project_id: string
  amount: number
  payment_date: string
  currency_code: string
  exchange_rate: number
  created_at: string
  project?: Project
}

export interface Expense {
  id: string
  title: string
  amount: number
  category: string
  expense_date: string
  created_at: string
}

export interface Settings {
  id: string
  future_fund_percentage: number
  commission_percentage: number
  reinvest_percentage: number
  school_amount: number
  updated_at: string
}

export interface Founder {
  id: string
  name: string
  share_percentage: number
  investment_amount: number
  investment_currency: string
  created_at: string
}

export interface MonthlySnapshot {
  id: string
  month: string
  total_revenue: number
  total_expenses: number
  net_profit: number
  future_fund: number
  commission: number
  distributable_profit: number
  created_at: string
}

export interface FounderEarning {
  id: string
  snapshot_id: string
  founder_id: string
  share_amount: number
  reinvest_amount: number
  take_home_amount: number
  created_at: string
  founder?: Founder
}

export interface Currency {
  code: string
  name: string
  symbol: string
  is_base: boolean
}

export interface FinanceData {
  revenue: number
  expenses: number
  netProfit: number
  futureFund: number
  commission: number
  distributableProfit: number
  founderEarnings: {
    founder: Founder
    share: number
    reinvest: number
    takeHome: number
  }[]
}
