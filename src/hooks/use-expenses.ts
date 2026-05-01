import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Expense } from '@/lib/types'

export function useExpenses(month?: string) {
  return useQuery({
    queryKey: ['expenses', month],
    queryFn: async () => {
      let query = supabase
        .from('expenses')
        .select('id, title, amount, category, expense_date')
        .order('expense_date', { ascending: false })

      if (month) {
        const [year, monthNum] = month.split('-')
        const startDate = `${year}-${monthNum}-01`
        const endDate = `${year}-${monthNum}-31`
        query = query.gte('expense_date', startDate).lte('expense_date', endDate)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Expense[]
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (expense: {
      title: string
      amount: number
      category: string
      expense_date: string
    }) => {
      const { data, error } = await supabase
        .from('expenses')
        .insert(expense)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}
