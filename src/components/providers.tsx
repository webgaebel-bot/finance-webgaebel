'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { SupabaseProvider } from '@/lib/supabase-provider'
import { ToastProvider } from '@/components/ui/Toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </SupabaseProvider>
    </QueryClientProvider>
  )
}
