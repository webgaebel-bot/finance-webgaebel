'use client'

import { useSettings, useUpdateSettings } from '@/hooks/use-settings'
import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings()
  const updateMutation = useUpdateSettings()

  const [formData, setFormData] = useState({
    future_fund_percentage: '',
    commission_percentage: '',
    reinvest_percentage: '',
    school_amount: '',
  })

  useEffect(() => {
    if (settings) {
      setFormData({
        future_fund_percentage: settings.future_fund_percentage.toString(),
        commission_percentage: settings.commission_percentage.toString(),
        reinvest_percentage: settings.reinvest_percentage.toString(),
        school_amount: settings.school_amount?.toString() || '0',
      })
    }
  }, [settings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await updateMutation.mutateAsync({
      future_fund_percentage: parseFloat(formData.future_fund_percentage),
      commission_percentage: parseFloat(formData.commission_percentage),
      reinvest_percentage: parseFloat(formData.reinvest_percentage),
      school_amount: parseFloat(formData.school_amount),
    })
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
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Settings</h1>

      <div className="max-w-md rounded-lg bg-white p-6 shadow">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Future Fund %
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.future_fund_percentage}
              onChange={(e) =>
                setFormData({ ...formData, future_fund_percentage: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">
              Commission %
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.commission_percentage}
              onChange={(e) =>
                setFormData({ ...formData, commission_percentage: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">
              Reinvest %
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.reinvest_percentage}
              onChange={(e) =>
                setFormData({ ...formData, reinvest_percentage: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">
              School Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.school_amount}
              onChange={(e) =>
                setFormData({ ...formData, school_amount: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>

          {updateMutation.isSuccess && (
            <p className="text-sm text-green-600">Settings saved successfully!</p>
          )}
        </form>
      </div>
    </div>
  )
}
