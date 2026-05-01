'use client'

import { useState } from 'react'
import { usePayments } from '@/hooks/use-payments'
import { useCreatePayment } from '@/hooks/use-payments'
import { useProjects } from '@/hooks/use-projects'
import { useCurrencies } from '@/hooks/use-currencies'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'

export default function PaymentsPage() {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
  const { data: payments, isLoading } = usePayments(selectedMonth)
  const { data: projects } = useProjects()
  const { data: currencies } = useCurrencies()
  const createMutation = useCreatePayment()

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    project_id: '',
    amount: '',
    payment_date: new Date().toISOString().slice(0, 10),
    currency_code: 'USD',
    exchange_rate: '1.0000',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.project_id || !formData.amount) return

    await createMutation.mutateAsync({
      project_id: formData.project_id,
      amount: parseFloat(formData.amount),
      payment_date: formData.payment_date,
      currency_code: formData.currency_code,
      exchange_rate: parseFloat(formData.exchange_rate),
    })

    setFormData({
      project_id: '',
      amount: '',
      payment_date: new Date().toISOString().slice(0, 10),
      currency_code: 'USD',
      exchange_rate: '1.0000',
    })
    setShowForm(false)
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
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Add Payment
        </button>
      </div>

      <div className="mb-4">
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-gray-900"
        />
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Project</label>
              <select
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                required
              >
                <option value="">Select project</option>
                {projects?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.client?.name} - {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Currency</label>
                <select
                  value={formData.currency_code}
                  onChange={(e) => setFormData({ ...formData, currency_code: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                >
                  {currencies?.map((c) => (
                    <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900">Exchange Rate</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.exchange_rate}
                  onChange={(e) => setFormData({ ...formData, exchange_rate: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Date</label>
                <input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Add Payment
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
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
              <th className="p-4 text-gray-900">Project</th>
              <th className="p-4 text-gray-900">Client</th>
              <th className="p-4 text-gray-900">Amount</th>
              <th className="p-4 text-gray-900">Currency</th>
              <th className="p-4 text-gray-900">USD Amount</th>
              <th className="p-4 text-gray-900">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments?.map((payment) => (
              <tr key={payment.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-gray-900 font-medium">{payment.project?.name}</td>
                <td className="p-4 text-gray-900">{payment.project?.client?.name}</td>
                <td className="p-4 text-gray-900">
                  {payment.currency_code} {payment.amount.toFixed(2)}
                </td>
                <td className="p-4 text-gray-900">{payment.currency_code}</td>
                <td className="p-4 font-semibold text-green-600">
                  ${(payment.amount * payment.exchange_rate).toFixed(2)}
                </td>
                <td className="p-4 text-gray-900">
                  {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                </td>
              </tr>
            ))}
            {(!payments || payments.length === 0) && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No payments for this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
