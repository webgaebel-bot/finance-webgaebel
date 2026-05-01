'use client'

import { CheckCircle, ArrowRight, Database, DollarSign, FileSpreadsheet, Users, Settings, Shield } from 'lucide-react'

const steps = [
  {
    step: 1,
    title: 'Setup Supabase',
    description: 'Create a Supabase project and run the database schema SQL in the SQL Editor.',
    icon: Database,
    details: [
      'Go to https://supabase.com and create a new project',
      'Copy the provided SQL schema and run it in SQL Editor',
      'Get your Project URL and Anon Key from Project Settings > API',
      'Add credentials to .env.local file',
    ],
  },
  {
    step: 2,
    title: 'Create Admin User',
    description: 'Add admin users through Supabase Dashboard or Admin page.',
    icon: Shield,
    details: [
      'Go to Authentication > Users in Supabase Dashboard',
      'Click "Add User" and create an admin account',
      'The schema auto-assigns admin role to first 3 users',
      'For more admins, add entries to user_roles table manually',
    ],
  },
  {
    step: 3,
    title: 'Add Clients',
    description: 'Start by adding your clients to the system.',
    icon: Users,
    details: [
      'Navigate to Clients page',
      'Click "Add Client" button',
      'Enter client name and save',
      'Edit or delete clients as needed',
    ],
  },
  {
    step: 4,
    title: 'Create Projects',
    description: 'Add projects linked to your clients with total value.',
    icon: FileSpreadsheet,
    details: [
      'Go to Projects page and click "Add Project"',
      'Select a client from the dropdown',
      'Enter project name and total value',
      'Status can be active or completed',
      'System auto-calculates received and pending amounts',
    ],
  },
  {
    step: 5,
    title: 'Record Payments',
    description: 'Track payments from clients in multiple currencies.',
    icon: DollarSign,
    details: [
      'Go to Payments page',
      'Select project and enter payment amount',
      'Choose currency (USD, PKR, EUR, etc.)',
      'Set exchange rate if currency is not USD',
      'Payments auto-update project received amounts',
    ],
  },
  {
    step: 6,
    title: 'Track Expenses',
    description: 'Record all business expenses by category.',
    icon: DollarSign,
    details: [
      'Navigate to Expenses page',
      'Click "Add Expense"',
      'Enter title, amount, category, and date',
      'Categories: Office, Software, Hardware, Marketing, Travel, etc.',
      'Filter expenses by month using the month picker',
    ],
  },
  {
    step: 7,
    title: 'Calculate Finance',
    description: 'View automatic profit calculations and founder distributions.',
    icon: DollarSign,
    details: [
      'Go to Finance page',
      'Select the month to calculate',
      'View Revenue, Expenses, Net Profit automatically calculated',
      'Future Fund and Commission deducted as per settings',
      'Distributable profit split among founders by share %',
      'Click "Save Snapshot" to save monthly record',
      'Click "Export Excel" to download detailed report',
    ],
  },
  {
    step: 8,
    title: 'Manage Founders & Settings',
    description: 'Configure founder shares and financial percentages.',
    icon: Settings,
    details: [
      'Founders page: Add/edit founder names and share percentages',
      'Total shares must equal 100% (validated automatically)',
      'Settings page: Set Future Fund %, Commission %, Reinvest %',
      'School Amount can also be set in Settings',
    ],
  },
]

export default function GuidancePage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Guidance</h1>
      <p className="mb-8 text-gray-600">Follow these steps to set up and use the Finance Dashboard effectively.</p>

      <div className="space-y-6">
        {steps.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.step} className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      {item.step}
                    </span>
                    <h2 className="text-xl font-semibold text-gray-900">{item.title}</h2>
                  </div>
                  <p className="mt-1 text-gray-600">{item.description}</p>
                  <ul className="mt-4 space-y-2">
                    {item.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                        <span className="text-sm text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                  {item.step < steps.length && (
                    <div className="mt-4 flex items-center text-sm text-blue-600">
                      <ArrowRight className="mr-1 h-4 w-4" />
                      Next: {steps[item.step].title}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 rounded-lg bg-blue-50 p-6">
        <h3 className="text-lg font-semibold text-blue-900">Quick Tips</h3>
        <ul className="mt-3 space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
            <span className="text-sm text-blue-800">Use the month selector on Payments, Expenses, and Finance pages to filter data</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
            <span className="text-sm text-blue-800">Export to Excel on Finance page generates 5 sheets with comprehensive data</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
            <span className="text-sm text-blue-800">The Dashboard shows real-time revenue vs expenses chart and recent payments</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
            <span className="text-sm text-blue-800">Founder shares must total 100% - the system validates this automatically</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
