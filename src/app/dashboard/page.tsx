'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const now = new Date()
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      const startDate = `${month}-01`
      const endDate = `${month}-31`

      const [
        { data: payments },
        { data: expenses },
        { data: chartData },
        { data: projects },
        { data: recentPayments },
      ] = await Promise.all([
        supabase
          .from('payments')
          .select('amount, exchange_rate')
          .gte('payment_date', startDate)
          .lte('payment_date', endDate),
        supabase
          .from('expenses')
          .select('amount')
          .gte('expense_date', startDate)
          .lte('expense_date', endDate),
        supabase
          .from('monthly_snapshots')
          .select('month, total_revenue, total_expenses')
          .order('month', { ascending: true })
          .limit(6),
        supabase
          .from('projects')
          .select('total_value, status'),
        supabase
          .from('payments')
          .select('amount, currency_code, payment_date, projects(name)')
          .order('payment_date', { ascending: false })
          .limit(5),
      ])

      const revenue =
        payments?.reduce((s: number, p: any) => s + p.amount * p.exchange_rate, 0) ?? 0
      const expenseTotal =
        expenses?.reduce((s: number, e: any) => s + e.amount, 0) ?? 0

      const activeProjects =
        projects?.filter((p: any) => p.status === 'active').length ?? 0
      const totalProjects = projects?.length ?? 0

      return {
        revenue,
        expenses: expenseTotal,
        profit: revenue - expenseTotal,
        profitMargin: revenue > 0 ? ((revenue - expenseTotal) / revenue) * 100 : 0,
        activeProjects,
        totalProjects,
        chartData: (chartData ?? []).map((d: any) => ({
          month: d.month,
          revenue: d.total_revenue,
          expenses: d.total_expenses,
        })),
        recentPayments: recentPayments ?? [],
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

export default function DashboardPage() {
  const { data, isLoading } = useDashboardData()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  const pieData = [
    { name: 'Revenue', value: data?.revenue ?? 0, color: '#10b981' },
    { name: 'Expenses', value: data?.expenses ?? 0, color: '#ef4444' },
  ]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${data?.revenue.toFixed(2) ?? '0.00'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                ${data?.expenses.toFixed(2) ?? '0.00'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">Net Profit</p>
              <p className="text-2xl font-bold text-gray-900">
                ${data?.profit.toFixed(2) ?? '0.00'}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {data?.profitMargin.toFixed(1)}% margin
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center">
            <Wallet className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">Projects</p>
              <p className="text-2xl font-bold text-gray-900">
                {data?.activeProjects}/{data?.totalProjects}
              </p>
              <p className="mt-1 text-xs text-gray-500">Active / Total</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Revenue vs Expenses</h2>
          {data?.chartData && data.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-8 text-center text-gray-400">No chart data yet</p>
          )}
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Revenue Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }: any) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {pieData.map((entry: any, index: number) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Payments</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm font-medium text-gray-700">
              <th className="pb-3 text-gray-900">Project</th>
              <th className="pb-3 text-gray-900">Amount</th>
              <th className="pb-3 text-gray-900">Currency</th>
              <th className="pb-3 text-gray-900">Date</th>
            </tr>
          </thead>
          <tbody>
            {data?.recentPayments.map((p: any, i: number) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="py-3 text-gray-900">{p.projects?.name ?? 'Unknown'}</td>
                <td className="py-3 font-semibold text-green-600">
                  ${p.amount.toFixed(2)}
                </td>
                <td className="py-3 text-gray-900">{p.currency_code}</td>
                <td className="py-3 text-gray-900">
                  {new Date(p.payment_date).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {(!data?.recentPayments || data.recentPayments.length === 0) && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-400">
                  No recent payments
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
