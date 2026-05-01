# Finance Dashboard - Complete Project Flow

## Overview
A comprehensive finance management system for tracking projects, payments, expenses, and founder earnings.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  Dashboard │ Finance │ Payments │ Expenses │ Projects │ Clients │ Founders │ Settings │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         REACT QUERY (Data Layer)                          │
│  ├── Caching (10-30 min stale time)
│  ├── Background refetch disabled
│  └── Optimistic updates
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE (Database)                               │
│  ├── Authentication (Admin only)
│  ├── PostgreSQL Database
│  └── Row Level Security
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Tables:

| Table | Columns |
|-------|---------|
| **clients** | id, name, created_at |
| **projects** | id, client_id, name, total_value, status |
| **payments** | id, project_id, amount, currency_code, exchange_rate, payment_date |
| **expenses** | id, title, amount, category, expense_date |
| **founders** | id, name, share_percentage, investment_amount, investment_currency |
| **settings** | id, future_fund_percentage, commission_percentage, reinvest_percentage, school_amount |
| **monthly_snapshots** | id, month, total_revenue, total_expenses, net_profit, future_fund, distributable_profit |
| **founder_earnings** | id, snapshot_id, founder_id, share_amount, reinvest_amount, take_home_amount |
| **currencies** | code, name, symbol |

---

## Page Flows

### 1. AUTHENTICATION FLOW

```
User opens app
        │
        ▼
┌───────────────┐     No     ┌───────────────┐
│  Check Auth   │───────────▶│  Login Page   │
│   Session     │            │               │
└───────────────┘            │  • Email      │
        │ Yes                │  • Password   │
        ▼                    │               │
┌───────────────┐            └───────────────┘
│ Check Admin   │                    │
│    RPC        │◀───────────────────┘
└───────────────┘              Login Success
        │
   ┌────┴────┐
   │         │
   ▼         ▼
┌──────┐  ┌──────────┐
│Admin │  │  Error   │
│ Yes  │  │"Not Admin"│
└──┬───┘  └──────────┘
   │
   ▼
┌───────────────┐
│   Dashboard   │
└───────────────┘
```

---

### 2. DASHBOARD FLOW

```
Dashboard Page Load
        │
        ▼
┌─────────────────────────────────────┐
│      useDashboardData Hook          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  Parallel Queries (Promise.all):    │
│                                     │
│  1. Current Month Payments          │
│     └─ Sum: revenue               │
│                                     │
│  2. Current Month Expenses          │
│     └─ Sum: expenseTotal            │
│                                     │
│  3. Monthly Snapshots (last 6)      │
│     └─ Chart data                   │
│                                     │
│  4. All Projects                    │
│     └─ Count active/total           │
│                                     │
│  5. Recent Payments (5)             │
│     └─ Display table                │
│                                     │
│  staleTime: 10 min                  │
│  gcTime: 15 min                     │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│         Calculations                │
├─────────────────────────────────────┤
│ profit = revenue - expenses         │
│ profitMargin = profit / revenue     │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│         UI Display                  │
├─────────────────────────────────────┤
│ [Revenue] [Expenses] [Profit] [Proj]│
│      ↓                              │
│  Revenue vs Expenses Chart          │
│      ↓                              │
│  Revenue Distribution Pie           │
│      ↓                              │
│  Recent Payments Table              │
└─────────────────────────────────────┘
```

---

### 3. FINANCE PAGE FLOW (Monthly Breakdown)

```
Finance Page
        │
        ▼
┌─────────────────────────────────────┐
│    Month Selector (YYYY-MM)         │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│       useFinanceData(month)         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  Sequential Fetch:                   │
│                                     │
│  1. settings → % for calculations   │
│  2. founders → share % list           │
│  3. payments (month) → revenue      │
│  4. expenses (month) → expenses     │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│       Calculations                  │
├─────────────────────────────────────┤
│ netProfit = revenue - expenses      │
│                                     │
│ futureFund = netProfit × 20%        │
│ commission = netProfit × 10%          │
│ distributable = netProfit - FF - Comm │
│                                     │
│ For each founder:                   │
│   share = distributable × share%    │
│   reinvest = share × 10%            │
│   takeHome = share - reinvest       │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│         UI Display                  │
├─────────────────────────────────────┤
│ Revenue | Expenses | Net Profit     │
│                                     │
│ Future Fund | Commission | Distrib. │
│                                     │
┌────────┬────────┬────────┬────────┐
│Founder │ Share% │ Amount │TakeHome│
├────────┼────────┼────────┼────────┤
│  Ali   │  40%   │ $4000  │ $3600  │
│  Sara  │  35%   │ $3500  │ $3150  │
│  John  │  25%   │ $2500  │ $2250  │
└────────┴────────┴────────┴────────┘
│                                     │
│ [Export Excel]  [Save Snapshot]     │
└─────────────────────────────────────┘
```

---

### 4. PAYMENTS FLOW

```
Payments Page
        │
        ▼
┌─────────────────────────────────────┐
│    Month Selector                   │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│   [+ Add Payment Button]            │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│        Add Payment Form             │
├─────────────────────────────────────┤
│ • Project (select)                  │
│ • Amount (number)                   │
│ • Currency (USD/PKR/etc)            │
│ • Exchange Rate (auto: 1.0)         │
│ • Date (date picker)                │
├─────────────────────────────────────┤
│ [Add Payment] [Cancel]              │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│    useCreatePayment Hook            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  1. Insert into payments table      │
│  2. OnSuccess:                      │
│     └─ invalidateQueries            │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│    Payments Table (Month Filtered)  │
├─────────────────────────────────────┤
│ Project │ Client │ Amount │ Date    │
├─────────┼────────┼────────┼─────────┤
│ Website │ ABC    │ $5000  │ Jan 15  │
│ Mobile  │ XYZ    │ $350   │ Jan 10  │
└─────────┴────────┴────────┴─────────┘
```

---

### 5. EXPENSES FLOW

```
Expenses Page
        │
        ▼
┌─────────────────────────────────────┐
│    Month Selector                   │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│   [+ Add Expense Button]            │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│        Add Expense Form             │
├─────────────────────────────────────┤
│ • Title (text)                      │
│ • Amount (number)                   │
│ • Category (dropdown):              │
│   - Office, Software, Hardware      │
│   - Marketing, Travel, Utilities    │
│   - Other                           │
│ • Date (date picker)                │
├─────────────────────────────────────┤
│ [Add Expense] [Cancel]              │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│    Expenses Table (Month Filtered)  │
├─────────────────────────────────────┤
│ Title        │ Category  │ Amount  │
├──────────────┼───────────┼─────────┤
│ Office Rent  │ Office    │ $500    │
│ VS Code Pro  │ Software  │ $10     │
│ Marketing FB │ Marketing │ $200    │
└──────────────┴───────────┴─────────┘
```

---

### 6. PROJECTS FLOW

```
Projects Page
        │
        ▼
┌─────────────────────────────────────┐
│   [+ Add Project Button]            │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│        Add/Edit Project Form          │
├─────────────────────────────────────┤
│ • Client (select dropdown)          │
│ • Project Name (text)               │
│ • Total Value (number)              │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│      Projects Table                 │
├─────────────────────────────────────┤
│ Client │ Project │ Total │ Status   │
├────────┼─────────┼───────┼──────────┤
│ ABC    │ Website │$10000 │ Active   │
│ XYZ    │ Mobile  │ $8000 │ Completed│
└────────┴─────────┴───────┴──────────┘
```

---

### 7. CLIENTS FLOW

```
Clients Page
        │
        ▼
┌─────────────────────────────────────┐
│   [+ Add Client Button]             │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│      Inline Add Form                │
│  Name: [________] [Add] [Cancel]  │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│      Clients Table                  │
├─────────────────────────────────────┤
│ Name        │ Created    │ Actions  │
├─────────────┼────────────┼──────────┤
│ ABC Corp    │ 2024-01-15 │ [✏️][🗑️] │
│ XYZ Ltd     │ 2024-02-20 │ [✏️][🗑️] │
└─────────────┴────────────┴──────────┘
```

---

### 8. FOUNDERS FLOW

```
Founders Page
        │
        ▼
┌─────────────────────────────────────┐
│   Total Share: 100% (or show red)   │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│   [+ Add Founder Button]            │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│        Add/Edit Founder Form          │
├─────────────────────────────────────┤
│ • Name (text)                       │
│ • Share % (number)                  │
│ • Investment Amount (optional)      │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│      Founders Table                 │
├─────────────────────────────────────┤
│ Name │ Share% │ Investment │ Action│
├──────┼────────┼────────────┼───────┤
│ Ali  │  40%   │   $1000    │ [✏️]  │
│ Sara │  35%   │   $500     │ [✏️]  │
│ John │  25%   │   $0       │ [✏️]  │
└──────┴────────┴────────────┴───────┘
```

---

### 9. SETTINGS FLOW

```
Settings Page
        │
        ▼
┌─────────────────────────────────────┐
│        Settings Form                │
├─────────────────────────────────────┤
│                                     │
│ Future Fund %      [ 20 ]           │
│ Commission %       [ 10 ]           │
│ Reinvest %         [ 10 ]           │
│ School Amount      [  0 ]           │
│                                     │
│ [Save Settings]                     │
│ ✓ Settings saved!                   │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│    Affects Finance Calculations:    │
├─────────────────────────────────────┤
│                                     │
│ Revenue ──┐                         │
│ Expenses ─┴→ Net Profit ──┐         │
│                            │         │
│ Future Fund = 20% ◄─────────┤         │
│ Commission = 10%  ◄─────────┤         │
│                            ↓         │
│              Distributable Profit     │
│                     │               │
│              ┌──────┴──────┐        │
│              ↓              ↓        │
│         Reinvest 10%    Take Home   │
└─────────────────────────────────────┘
```

---

## Data Relationships

```
CLIENT (1) ──────────────► (N) PROJECTS
   │                            │
   │                       (N) PAYMENTS
   │                            │
   └────────────────────────────┘

EXPENSES (Independent)

FOUNDERS (Independent - used in calculations)

SETTINGS (Single row - global config)

MONTHLY_SNAPSHOTS (1) ───► (N) FOUNDER_EARNINGS
```

---

## Caching Strategy

| Query Key | staleTime | gcTime | Priority |
|-----------|-----------|--------|----------|
| ['dashboard'] | 10 min | 15 min | High |
| ['finance', month] | Fresh | Default | Medium |
| ['payments', month] | 5 min | 10 min | Medium |
| ['expenses', month] | 5 min | 10 min | Medium |
| ['projects'] | 10 min | 15 min | High |
| ['clients'] | 10 min | 15 min | High |
| ['founders'] | 10 min | 15 min | High |
| ['settings'] | 30 min | 60 min | Low |

**Global Settings:**
- refetchOnWindowFocus: false
- refetchOnMount: false
- refetchOnReconnect: false

---

## Revenue Calculation Formula

```
STEP 1: Calculate Revenue
  revenue = SUM(payment.amount × payment.exchange_rate)

STEP 2: Calculate Net Profit
  netProfit = revenue - expenses

STEP 3: Apply Deductions
  futureFund = netProfit × (future_fund_percentage / 100)
  commission = netProfit × (commission_percentage / 100)
  
STEP 4: Calculate Distributable
  distributableProfit = netProfit - futureFund - commission - schoolAmount

STEP 5: Calculate Founder Earnings
  For each founder:
    shareAmount = distributableProfit × (founder.share_percentage / 100)
    reinvestAmount = shareAmount × (reinvest_percentage / 100)
    takeHomeAmount = shareAmount - reinvestAmount
```

---

## Mutation & Cache Invalidation

| Operation | Invalidates |
|-----------|-------------|
| Create Payment | ['payments'], ['projects'], ['dashboard'], ['finance'] |
| Create Expense | ['expenses'], ['dashboard'], ['finance'] |
| Create Project | ['projects'] |
| Create Client | ['clients'], ['projects'] |
| Update Settings | ['settings'], ['finance'] |
| Save Snapshot | ['finance'] |

---

## File Structure

```
src/
├── app/
│   ├── dashboard/     → Dashboard page
│   ├── finance/       → Monthly finance breakdown
│   ├── payments/      → Payments list & add
│   ├── expenses/      → Expenses list & add
│   ├── projects/      → Projects CRUD
│   ├── clients/       → Clients CRUD
│   ├── founders/      → Founders CRUD
│   ├── settings/      → Global settings
│   ├── login/         → Auth page
│   ├── layout.tsx     → Root layout
│   └── globals.css    → Global styles
├── components/
│   ├── providers.tsx  → React Query provider
│   ├── sidebar.tsx    → Navigation sidebar
│   └── auth-guard.tsx → Auth protection
├── hooks/
│   ├── use-dashboard.ts
│   ├── use-finance.ts
│   ├── use-payments.ts
│   ├── use-expenses.ts
│   ├── use-projects.ts
│   ├── use-clients.ts
│   ├── use-founders.ts
│   ├── use-settings.ts
│   └── use-currencies.ts
├── lib/
│   ├── supabase.ts    → Supabase client
│   ├── supabase-provider.tsx → Auth context
│   ├── query-client.ts → React Query config
│   └── types.ts       → TypeScript types
└── middleware.ts      → Auth middleware
```

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Admin only)
- **State**: React Query (TanStack Query)
- **Charts**: Recharts
- **Excel**: SheetJS (xlsx)
- **Icons**: Lucide React
- **Date**: date-fns

---

## Navigation Sidebar Order

1. **Dashboard** - Overview & charts
2. **Finance** - Monthly breakdown
3. **Payments** - Payment records
4. **Expenses** - Expense records
5. **Projects** - Project management
6. **Clients** - Client management
7. **Founders** - Founder shares
8. **Settings** - Global percentages
