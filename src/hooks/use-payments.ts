import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Payment } from '@/lib/types'

export function usePayments(month?: string) {
  return useQuery({
    queryKey: ['payments', month],
    queryFn: async () => {
      let query = supabase
        .from('payments')
        .select('id, amount, currency_code, exchange_rate, payment_date, project:projects(name, client:clients(name))')
        .order('payment_date', { ascending: false })

      if (month) {
        const [year, monthNum] = month.split('-')
        const startDate = `${year}-${monthNum}-01`
        const endDate = `${year}-${monthNum}-31`
        query = query.gte('payment_date', startDate).lte('payment_date', endDate)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Payment[]
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payment: {
      project_id: string
      amount: number
      payment_date: string
      currency_code?: string
      exchange_rate?: number
    }) => {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          ...payment,
          currency_code: payment.currency_code || 'USD',
          exchange_rate: payment.exchange_rate || 1,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
