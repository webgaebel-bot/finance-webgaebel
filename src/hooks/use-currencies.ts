import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Currency } from '@/lib/types'

export function useCurrencies() {
  return useQuery({
    queryKey: ['currencies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('currencies')
        .select('*')
        .order('code', { ascending: true })
      if (error) throw error
      return data as Currency[]
    },
  })
}
