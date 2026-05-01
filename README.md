# Finance Dashboard

A full-stack finance management dashboard for small software houses.

## Tech Stack

- **Frontend**: Next.js 16 (React)
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **State**: TanStack React Query
- **Charts**: Recharts
- **Excel Export**: SheetJS (xlsx)

## Setup Instructions

### 1. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Run the provided SQL schema in the Supabase SQL Editor
3. Get your project URL and anon key from Project Settings > API

### 2. Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Create Admin Users

In Supabase Dashboard:
1. Go to Authentication > Users
2. Create users manually
3. Add entries to `user_roles` table with role = 'admin'

Or use the Admin Management page after logging in.

### 5. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Features

- **Authentication**: Secure login with Supabase Auth (admin only)
- **Dashboard**: Overview cards and revenue vs expenses chart
- **Clients Management**: CRUD operations for clients
- **Projects Tracking**: Track projects, total value, received, pending
- **Payments**: Record payments with multi-currency support
- **Expenses**: Track expenses by category
- **Finance Calculator**: Automatic profit calculation and founder distributions
- **Founders**: Manage founder shares (validates 100% total)
- **Settings**: Configure percentages for future fund, commission, reinvest
- **Excel Export**: Export comprehensive financial reports with multiple sheets
- **Admin Management**: Add new admin users

## Build

```bash
npm run build
```
