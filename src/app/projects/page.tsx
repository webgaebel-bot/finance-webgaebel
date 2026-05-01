'use client'

import { useState } from 'react'
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '@/hooks/use-projects'
import { useClients } from '@/hooks/use-clients'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import Swal from 'sweetalert2'
import { toast } from 'sonner'

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects()
  const { data: clients } = useClients()
  const createMutation = useCreateProject()
  const updateMutation = useUpdateProject()
  const deleteMutation = useDeleteProject()

  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [formData, setFormData] = useState({
    client_id: '',
    name: '',
    total_value: '',
    status: 'active',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.client_id || !formData.name || !formData.total_value) return

    if (editingProject) {
      await updateMutation.mutateAsync({
        id: editingProject.id,
        ...formData,
        total_value: parseFloat(formData.total_value),
      })
    } else {
      await createMutation.mutateAsync({
        ...formData,
        total_value: parseFloat(formData.total_value),
      })
    }

    setFormData({ client_id: '', name: '', total_value: '', status: 'active' })
    setShowForm(false)
    setEditingProject(null)
  }

  const handleEdit = (project: any) => {
    setEditingProject(project)
    setFormData({
      client_id: project.client_id,
      name: project.name,
      total_value: project.total_value.toString(),
      status: project.status,
    })
    setShowForm(true)
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingProject(null)
            setFormData({ client_id: '', name: '', total_value: '', status: 'active' })
          }}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Add Project
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900">Client</label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                required
              >
                <option value="">Select client</option>
                {clients?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Project Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Total Value</label>
              <input
                type="number"
                step="0.01"
                value={formData.total_value}
                onChange={(e) => setFormData({ ...formData, total_value: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {editingProject ? 'Update' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingProject(null)
                }}
                className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-lg bg-white shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm font-medium text-gray-600">
              <th className="p-4 text-gray-900">Client</th>
              <th className="p-4 text-gray-900">Project</th>
              <th className="p-4 text-gray-900">Total Value</th>
              <th className="p-4 text-gray-900">Received</th>
              <th className="p-4 text-gray-900">Pending</th>
              <th className="p-4 text-gray-900">Status</th>
              <th className="p-4 text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects?.map((project) => (
              <tr key={project.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-gray-900">{project.client?.name}</td>
                <td className="p-4 text-gray-900 font-medium">{project.name}</td>
                <td className="p-4 text-gray-900">${project.total_value.toFixed(2)}</td>
                <td className="p-4 text-green-600">${(project as any).received?.toFixed(2) ?? '0.00'}</td>
                <td className="p-4 text-red-600">${(project as any).pending?.toFixed(2) ?? '0.00'}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    project.status === 'active' ? 'bg-green-100 text-green-900' : 'bg-gray-100 text-gray-900'
                  }`}>
                    {project.status}
                  </span>
                </td>
                <td className="p-4">
                  <button onClick={() => handleEdit(project)} className="mr-2 text-blue-600 hover:text-blue-800">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={async () => {
                      const result = await Swal.fire({
                        title: 'Delete project?',
                        text: "You won't be able to revert this!",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        confirmButtonText: 'Yes, delete it!',
                      })
                      if (result.isConfirmed) {
                        deleteMutation.mutate(project.id)
                        toast.success('Project deleted successfully!')
                      }
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {(!projects || projects.length === 0) && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-700">
                  No projects yet. Add one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
