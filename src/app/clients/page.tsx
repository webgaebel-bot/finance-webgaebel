'use client'

import { useState } from 'react'
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '@/hooks/use-clients'
import { Pencil, Trash2, Plus } from 'lucide-react'

export default function ClientsPage() {
  const { data: clients, isLoading } = useClients()
  const createMutation = useCreateClient()
  const updateMutation = useUpdateClient()
  const deleteMutation = useDeleteClient()

  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState<{ id: string; name: string } | null>(null)
  const [name, setName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    if (editingClient) {
      await updateMutation.mutateAsync({ id: editingClient.id, name })
    } else {
      await createMutation.mutateAsync({ name })
    }

    setName('')
    setShowForm(false)
    setEditingClient(null)
  }

  const handleEdit = (client: { id: string; name: string }) => {
    setEditingClient(client)
    setName(client.name)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this client?')) {
      await deleteMutation.mutateAsync(id)
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingClient(null)
            setName('')
          }}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Add Client
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Client name"
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {editingClient ? 'Update' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setEditingClient(null)
                setName('')
              }}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-900 hover:bg-gray-50"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="rounded-lg bg-white shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm font-medium text-gray-600">
              <th className="p-4 text-gray-900">Name</th>
              <th className="p-4 text-gray-900">Created</th>
              <th className="p-4 text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients?.map((client) => (
              <tr key={client.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-gray-900 font-medium">{client.name}</td>
                <td className="p-4 text-gray-900 text-sm">
                  {new Date(client.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(client)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {(!clients || clients.length === 0) && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500">
                  No clients yet. Add one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
