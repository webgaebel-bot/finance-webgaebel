import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Settings, Founder } from '@/lib/types'

export function useFinanceData(month: string) {
  return useQuery({
    queryKey: ['finance', month],
    queryFn: async () => {
      const [year, monthNum] = month.split('-')

      const { data: settings } = await supabase
        .from('settings')
        .select('*')
        .single()

      const { data: founders } = await supabase
        .from('founders')
        .select('*')
        .order('created_at', { ascending: true })

      const startDate = `${year}-${monthNum}-01`
      const endDate = `${year}-${monthNum}-31`

      const { data: payments } = await supabase
        .from('payments')
        .select('amount, exchange_rate')
        .gte('payment_date', startDate)
        .lte('payment_date', endDate)

      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount')
        .gte('expense_date', startDate)
        .lte('expense_date', endDate)

      const revenue =
        payments?.reduce(
          (sum, p) => sum + p.amount * p.exchange_rate,
          0
        ) ?? 0

      const expensesTotal =
        expenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0

      const netProfit = revenue - expensesTotal

      const futureFund =
        (netProfit * (settings?.future_fund_percentage ?? 0)) / 100
      const commission =
        (netProfit * (settings?.commission_percentage ?? 0)) / 100
      const distributableProfit = netProfit - futureFund - commission

      const founderEarnings =
        founders?.map((f: Founder) => {
          const share =
            distributableProfit * (f.share_percentage / 100)
          const reinvest =
            share * ((settings?.reinvest_percentage ?? 0) / 100)
          const takeHome = share - reinvest
          return {
            founder: f,
            share,
            reinvest,
            takeHome,
          }
        }) ?? []

      return {
        revenue,
        expenses: expensesTotal,
        netProfit,
        futureFund,
        commission,
        distributableProfit,
        founderEarnings,
      }
    },
    enabled: !!month,
  })
}

export function useSaveSnapshot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      month,
      data,
      founders,
    }: {
      month: string
      data: any
      founders: Founder[]
    }) => {
      const { data: snapshot, error } = await supabase
        .from('monthly_snapshots')
        .upsert(
          {
            month,
            total_revenue: data.revenue,
            total_expenses: data.expenses,
            net_profit: data.netProfit,
            future_fund: data.futureFund,
            commission: data.commission,
            distributable_profit: data.distributableProfit,
          },
          { onConflict: 'month' }
        )
        .select()
        .single()

      if (error) throw error

      await supabase
        .from('founder_earnings')
        .delete()
        .eq('snapshot_id', snapshot.id)

      const earnings = data.founderEarnings.map((fe: any) => ({
        snapshot_id: snapshot.id,
        founder_id: fe.founder.id,
        share_amount: fe.share,
        reinvest_amount: fe.reinvest,
        take_home_amount: fe.takeHome,
      }))

      const { error: earningsError } = await supabase
        .from('founder_earnings')
        .insert(earnings)
      if (earningsError) throw earningsError

      return snapshot
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] })
    },
  })
}
