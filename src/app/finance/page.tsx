'use client'

import { useState } from 'react'
import { useFinanceData, useSaveSnapshot } from '@/hooks/use-finance'
import { useFounders } from '@/hooks/use-founders'
import { useProjects } from '@/hooks/use-projects'
import { usePayments } from '@/hooks/use-payments'
import { useExpenses } from '@/hooks/use-expenses'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { FileSpreadsheet } from 'lucide-react'

export default function FinancePage() {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
  const { data, isLoading } = useFinanceData(selectedMonth)
  const { data: founders } = useFounders()
  const { data: projects } = useProjects()
  const { data: payments } = usePayments(selectedMonth)
  const { data: expenses } = useExpenses(selectedMonth)
  const saveMutation = useSaveSnapshot()

  const handleExportExcel = () => {
    if (!data) return

    const wb = XLSX.utils.book_new()

    // Sheet 1: Summary
    const summaryData = [
      ['Finance Summary', selectedMonth],
      [],
      ['Metric', 'Amount'],
      ['Revenue', data.revenue],
      ['Expenses', data.expenses],
      ['Net Profit', data.netProfit],
      ['Future Fund', data.futureFund],
      ['Commission', data.commission],
      ['Distributable Profit', data.distributableProfit],
    ]
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, ws1, 'Summary')

    // Sheet 2: Clients & Projects
    const projectData = [
      ['Clients & Projects', selectedMonth],
      [],
      ['Client', 'Project', 'Total Value', 'Received', 'Pending'],
      ...(projects?.map((p: any) => [
        p.client?.name || '',
        p.name,
        p.total_value,
        p.received || 0,
        p.pending || 0,
      ]) || []),
    ]
    const ws2 = XLSX.utils.aoa_to_sheet(projectData)
    XLSX.utils.book_append_sheet(wb, ws2, 'Clients & Projects')

    // Sheet 3: Payments
    const paymentData = [
      ['Payments', selectedMonth],
      [],
      ['Project', 'Client', 'Amount', 'Currency', 'USD Amount', 'Date'],
      ...(payments?.map((p: any) => [
        p.project?.name || '',
        p.project?.client?.name || '',
        p.amount,
        p.currency_code,
        p.amount * p.exchange_rate,
        p.payment_date,
      ]) || []),
    ]
    const ws3 = XLSX.utils.aoa_to_sheet(paymentData)
    XLSX.utils.book_append_sheet(wb, ws3, 'Payments')

    // Sheet 4: Expenses
    const expenseData = [
      ['Expenses', selectedMonth],
      [],
      ['Title', 'Category', 'Amount', 'Date'],
      ...(expenses?.map((e: any) => [
        e.title,
        e.category,
        e.amount,
        e.expense_date,
      ]) || []),
    ]
    const ws4 = XLSX.utils.aoa_to_sheet(expenseData)
    XLSX.utils.book_append_sheet(wb, ws4, 'Expenses')

    // Sheet 5: Founder Earnings
    const founderData = [
      ['Founder Earnings', selectedMonth],
      [],
      ['Founder', 'Share', 'Reinvest', 'Take Home'],
      ...data.founderEarnings.map((fe) => [
        fe.founder.name,
        fe.share,
        fe.reinvest,
        fe.takeHome,
      ]),
    ]
    const ws5 = XLSX.utils.aoa_to_sheet(founderData)
    XLSX.utils.book_append_sheet(wb, ws5, 'Founder Earnings')

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/octet-stream' })
    saveAs(blob, `finance-${selectedMonth}.xlsx`)
  }

  const handleSaveSnapshot = () => {
    if (!data || !founders) return
    saveMutation.mutate({
      month: selectedMonth,
      data,
      founders,
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 hover:bg-gray-50"
          >
            <FileSpreadsheet className="h-4 w-4" /> Export Excel
          </button>
          <button
            onClick={handleSaveSnapshot}
            disabled={saveMutation.isPending}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Save Snapshot
          </button>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-gray-900"
        />
      </div>

      {data && (
        <>
          <div className="mb-8 grid grid-cols-2 gap-6 lg:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow">
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ${data.revenue.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow">
              <p className="text-sm text-gray-600">Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                ${data.expenses.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow">
              <p className="text-sm text-gray-600">Net Profit</p>
              <p className="text-2xl font-bold text-blue-600">
                ${data.netProfit.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow">
              <p className="text-sm text-gray-600">Future Fund</p>
              <p className="text-xl font-semibold">${data.futureFund.toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow">
              <p className="text-sm text-gray-600">Commission</p>
              <p className="text-xl font-semibold">${data.commission.toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow">
              <p className="text-sm text-gray-600">Distributable</p>
              <p className="text-xl font-semibold text-green-600">
                ${data.distributableProfit.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">Founder Earnings</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm font-medium text-gray-600">
                <th className="p-4 text-gray-900">Founder</th>
                <th className="p-4 text-gray-900">Share %</th>
                <th className="p-4 text-gray-900">Share Amount</th>
                <th className="p-4 text-gray-900">Reinvest</th>
                <th className="p-4 text-gray-900">Take Home</th>
                </tr>
              </thead>
              <tbody>
                {data.founderEarnings.map((fe, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-900 font-medium">{fe.founder.name}</td>
                    <td className="p-4 text-gray-900">{fe.founder.share_percentage}%</td>
                    <td className="p-4 text-gray-900">${fe.share.toFixed(2)}</td>
                    <td className="p-4 text-gray-900">${fe.reinvest.toFixed(2)}</td>
                    <td className="p-4 text-gray-900 font-semibold text-green-600">
                      ${fe.takeHome.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
