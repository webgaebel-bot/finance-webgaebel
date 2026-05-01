'use client'

import { useState } from 'react'
import { useExpenses, useCreateExpense, useDeleteExpense } from '@/hooks/use-expenses'
import { Plus, Trash2 } from 'lucide-react'
import Swal from 'sweetalert2'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function ExpensesPage() {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
  const { data: expenses, isLoading } = useExpenses(selectedMonth)
  const createMutation = useCreateExpense()
  const deleteMutation = useDeleteExpense()

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    expense_date: new Date().toISOString().slice(0, 10),
  })

  const categories = ['Office', 'Software', 'Hardware', 'Marketing', 'Travel', 'Utilities', 'Other']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.amount || !formData.category) return

    try {
      await createMutation.mutateAsync({
        title: formData.title,
        amount: parseFloat(formData.amount),
        category: formData.category,
        expense_date: formData.expense_date,
      })
      toast.success('Expense added successfully!')
      setFormData({
        title: '',
        amount: '',
        category: '',
        expense_date: new Date().toISOString().slice(0, 10),
      })
      setShowForm(false)
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
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
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Add Expense
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
              <label className="block text-sm font-medium text-gray-900">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                required
              />
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
                <label className="block text-sm font-medium text-gray-900">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Date</label>
              <input
                type="date"
                value={formData.expense_date}
                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Add Expense
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
              <th className="p-4 text-gray-900">Title</th>
              <th className="p-4 text-gray-900">Category</th>
              <th className="p-4 text-gray-900">Amount</th>
              <th className="p-4 text-gray-900">Date</th>
            </tr>
          </thead>
          <tbody>
            {expenses?.map((expense) => (
              <tr key={expense.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-gray-900 font-medium">{expense.title}</td>
                <td className="p-4">
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                    {expense.category}
                  </span>
                </td>
                <td className="p-4 font-semibold text-red-600">
                  ${expense.amount.toFixed(2)}
                </td>
                <td className="p-4 text-gray-900">
                  {format(new Date(expense.expense_date), 'MMM dd, yyyy')}
                </td>
                <td className="p-4">
                  <button
                    onClick={async () => {
                      const result = await Swal.fire({
                        title: 'Delete expense?',
                        text: "You won't be able to revert this!",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        confirmButtonText: 'Yes, delete it!',
                      })
                      if (result.isConfirmed) {
                        deleteMutation.mutate(expense.id)
                        toast.success('Expense deleted successfully!')
                      }
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {(!expenses || expenses.length === 0) && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  No expenses for this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
