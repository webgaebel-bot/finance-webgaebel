'use client'

import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'
import { Input } from './Input'
import { useState } from 'react'

interface TableProps {
  children: React.ReactNode
  className?: string
}

export function Table({ children, className }: TableProps) {
  return (
    <div className={cn('w-full overflow-hidden rounded-2xl border border-gray-200 bg-white', className)}>
      {children}
    </div>
  )
}

export function TableHeader({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={cn('border-b border-gray-200 bg-gray-50/50 px-6 py-4', className)}>
      {children}
    </div>
  )
}

export function TableTitle({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)}>
      {children}
    </h3>
  )
}

export function TableToolbar({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      {children}
    </div>
  )
}

export function TableSearch({
  value,
  onChange,
  placeholder = 'Search...',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-xl border-2 border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm',
          'transition-all duration-200',
          'focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10',
          'placeholder:text-gray-400'
        )}
      />
    </div>
  )
}

export function TableBody({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={cn('divide-y divide-gray-100', className)}>
      {children}
    </div>
  )
}

export function TableRow({ 
  children, 
  className,
  onClick
}: { 
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center px-6 py-4 transition-colors',
        onClick && 'cursor-pointer hover:bg-gray-50',
        className
      )}
    >
      {children}
    </div>
  )
}

export function TableCell({ 
  children, 
  className,
  flex = true
}: { 
  children: React.ReactNode
  className?: string
  flex?: boolean
}) {
  return (
    <div className={cn(flex && 'flex-1', className)}>
      {children}
    </div>
  )
}

export function TableEmpty({
  title = 'No data found',
  description = 'There are no items to display at the moment.',
  action,
}: {
  title?: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="rounded-full bg-gray-100 p-3">
        <Search className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="mt-4 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

interface DataTableProps<T> {
  data: T[]
  columns: {
    key: string
    header: string
    render: (item: T) => React.ReactNode
    width?: string
  }[]
  searchKey?: keyof T
  searchPlaceholder?: string
  emptyTitle?: string
  emptyDescription?: string
  onRowClick?: (item: T) => void
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchKey,
  searchPlaceholder = 'Search...',
  emptyTitle = 'No data found',
  emptyDescription = 'There are no items to display.',
  onRowClick,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredData = searchKey && searchTerm
    ? data.filter((item) =>
        String(item[searchKey]).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : data

  return (
    <Table>
      <TableHeader>
        <div className="flex items-center justify-between">
          <TableTitle>Data</TableTitle>
          {searchKey && (
            <TableSearch
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={searchPlaceholder}
            />
          )}
        </div>
      </TableHeader>
      <TableBody>
        {filteredData.length === 0 ? (
          <TableEmpty title={emptyTitle} description={emptyDescription} />
        ) : (
          filteredData.map((item, index) => (
            <TableRow
              key={index}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
              className={onRowClick ? 'cursor-pointer' : ''}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={column.width}
                  flex={!column.width}
                >
                  {column.render(item)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
