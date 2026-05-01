'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/supabase-provider'
import { Sidebar } from '@/components/sidebar'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.replace('/login')
    }
  }, [user, loading, pathname, router])

  if (!mounted || loading) {
    return (
      <div className="flex h-screen items-center justify-center" suppressHydrationWarning>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" suppressHydrationWarning />
      </div>
    )
  }

  if (!user && pathname === '/login') {
    return <>{children}</>
  }

  if (!user) return null

  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center" suppressHydrationWarning>
        <div className="text-center" suppressHydrationWarning>
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2 text-gray-600">You do not have admin privileges.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen" suppressHydrationWarning>
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-8" suppressHydrationWarning>{children}</main>
    </div>
  )
}
