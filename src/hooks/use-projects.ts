import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Project } from '@/lib/types'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, client_id, name, total_value, status, client:clients(name)')
        .order('created_at', { ascending: false })
      if (error) throw error

      const projects = data as any[]
      const { data: payments } = await supabase
        .from('payments')
        .select('project_id, amount, exchange_rate')

      return projects.map((project) => {
        const projectPayments = payments?.filter((p) => p.project_id === project.id) || []
        const received = projectPayments.reduce(
          (sum: number, p: any) => sum + p.amount * p.exchange_rate,
          0
        )
        return {
          ...project,
          client: project.client,
          received,
          pending: project.total_value - received,
        }
      }) as (Project & { received: number; pending: number })[]
    },
    staleTime: 10 * 60 * 1000,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (project: {
      client_id: string
      name: string
      total_value: number
      status?: string
    }) => {
      const { data, error } = await supabase
        .from('projects')
        .insert({ ...project, status: project.status || 'active' })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string
      client_id?: string
      name?: string
      total_value?: number
      status?: string
    }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
