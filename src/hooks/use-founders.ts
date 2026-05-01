import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Founder } from '@/lib/types'

export function useFounders() {
  return useQuery({
    queryKey: ['founders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('founders')
        .select('id, name, share_percentage, investment_amount, investment_currency')
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as Founder[]
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

export function useCreateFounder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (founder: {
      name: string
      share_percentage: number
      investment_amount?: number
      investment_currency?: string
    }) => {
      const { data, error } = await supabase
        .from('founders')
        .insert({
          ...founder,
          investment_amount: founder.investment_amount || 0,
          investment_currency: founder.investment_currency || 'USD',
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['founders'] })
    },
  })
}

export function useUpdateFounder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string
      name?: string
      share_percentage?: number
      investment_amount?: number
      investment_currency?: string
    }) => {
      const { data, error } = await supabase
        .from('founders')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['founders'] })
    },
  })
}

export function useDeleteFounder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('founders').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['founders'] })
    },
  })
}
