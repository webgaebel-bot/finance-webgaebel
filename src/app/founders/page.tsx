'use client'

import { useState, useEffect } from 'react'
import {
  useFounders,
  useCreateFounder,
  useUpdateFounder,
  useDeleteFounder,
} from '@/hooks/use-founders'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export default function FoundersPage() {
  const { data: founders, isLoading } = useFounders()
  const createMutation = useCreateFounder()
  const updateMutation = useUpdateFounder()
  const deleteMutation = useDeleteFounder()

  const [showForm, setShowForm] = useState(false)
  const [editingFounder, setEditingFounder] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    share_percentage: '',
    investment_amount: '',
    investment_currency: 'USD',
  })

  const totalShare = founders?.reduce((sum, f) => sum + f.share_percentage, 0) ?? 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.share_percentage) return

    const payload = {
      name: formData.name,
      share_percentage: parseFloat(formData.share_percentage),
      investment_amount: parseFloat(formData.investment_amount) || 0,
      investment_currency: formData.investment_currency,
    }

    if (editingFounder) {
      await updateMutation.mutateAsync({ id: editingFounder.id, ...payload })
    } else {
      await createMutation.mutateAsync(payload)
    }

    setFormData({ name: '', share_percentage: '', investment_amount: '', investment_currency: 'USD' })
    setShowForm(false)
    setEditingFounder(null)
  }

  const handleEdit = (founder: any) => {
    setEditingFounder(founder)
    setFormData({
      name: founder.name,
      share_percentage: founder.share_percentage.toString(),
      investment_amount: founder.investment_amount?.toString() || '',
      investment_currency: founder.investment_currency || 'USD',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this founder?')) {
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
        <h1 className="text-2xl font-bold text-gray-900">Founders</h1>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingFounder(null)
            setFormData({ name: '', share_percentage: '', investment_amount: '', investment_currency: 'USD' })
          }}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Add Founder
        </button>
      </div>

      <div className="mb-4 rounded-lg bg-white p-4 shadow">
        <p className="text-sm text-gray-600">
          Total Share:{' '}
          <span className={`font-semibold ${totalShare === 100 ? 'text-green-600' : 'text-red-600'}`}>
            {totalShare.toFixed(2)}%
          </span>
          {totalShare !== 100 && (
            <span className="ml-2 text-xs text-red-500">(Must equal 100%)</span>
          )}
        </p>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900">Share %</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.share_percentage}
                  onChange={(e) => setFormData({ ...formData, share_percentage: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Investment</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.investment_amount}
                  onChange={(e) => setFormData({ ...formData, investment_amount: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                />
              </div>
            </div>
            <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {editingFounder ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingFounder(null)
                  }}
                  className="rounded-md border border-gray-300 px-4 py-2 text-gray-900 hover:bg-gray-50"
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
              <th className="p-4 text-gray-900">Name</th>
              <th className="p-4 text-gray-900">Share %</th>
              <th className="p-4 text-gray-900">Investment</th>
              <th className="p-4 text-gray-900">Currency</th>
              <th className="p-4 text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {founders?.map((founder) => (
              <tr key={founder.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-gray-900 font-medium">{founder.name}</td>
                <td className="p-4 text-gray-900">{founder.share_percentage}%</td>
                <td className="p-4 text-gray-900">${founder.investment_amount?.toFixed(2) ?? '0.00'}</td>
                <td className="p-4 text-gray-900">{founder.investment_currency}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(founder)} className="text-blue-600 hover:text-blue-800">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(founder.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
