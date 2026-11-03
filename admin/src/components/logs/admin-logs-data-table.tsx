'use client'

import { useState, useEffect } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table'
import { ArrowUpDown, Eye, ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate, getInitials } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AdminLog {
  id: string
  adminId: string
  action: string
  entityType: string | null
  entityId: string | null
  details: string | null
  ipAddress: string | null
  createdAt: string
  admin: {
    id: string
    email: string
    name: string
  }
}

function LogDetailsDialog({ log }: { log: AdminLog }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <Eye className="h-4 w-4" />
          <span className="sr-only">View log details</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[800px]">
        <DialogHeader className="space-y-1 pt-4">
          <DialogTitle>Log Details</DialogTitle>
          <DialogDescription>View detailed log information</DialogDescription>
        </DialogHeader>
        <div className="p-6">
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="text-sm font-medium">Admin</div>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>{getInitials(log.admin.name)}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{log.admin.name}</span>
                <span className="text-muted-foreground text-xs">
                  ({log.admin.email})
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-1">
              <div className="text-sm font-medium">Action</div>
              <div className="text-sm">
                <Badge variant="outline">{log.action}</Badge>
              </div>
            </div>

            {(log.entityType || log.entityId) && (
              <div className="space-y-1">
                <div className="text-sm font-medium">Entity</div>
                <div className="flex items-center gap-2 text-sm">
                  {log.entityType && (
                    <Badge variant="secondary">{log.entityType}</Badge>
                  )}
                  {log.entityId && (
                    <span className="text-muted-foreground text-xs">
                      ID: {log.entityId}
                    </span>
                  )}
                </div>
              </div>
            )}

            {log.details && (
              <div className="space-y-1">
                <div className="text-sm font-medium">Details</div>
                <div className="max-h-[200px] overflow-auto rounded-md bg-slate-50 p-3 text-sm dark:bg-slate-900">
                  <pre className="text-xs whitespace-pre-wrap">
                    {log.details}
                  </pre>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <div className="text-sm font-medium">IP Address</div>
              <div className="text-muted-foreground text-sm">
                {log.ipAddress || 'Not recorded'}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Timestamp</div>
              <div className="text-muted-foreground text-sm">
                {formatDate(log.createdAt)}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AdminLogsDataTable() {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
    pageCount: 0,
    total: 0,
  })
  const [actionFilter, setActionFilter] = useState<string>('ALL')

  const columns: ColumnDef<AdminLog>[] = [
    {
      accessorKey: 'createdAt',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Timestamp
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => formatDate(row.getValue('createdAt')),
    },
    {
      accessorKey: 'admin',
      header: 'Admin',
      cell: ({ row }) => {
        const admin = row.original.admin
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{getInitials(admin.name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{admin.name}</div>
              <div className="text-muted-foreground text-xs">{admin.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'action',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Action
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <Badge variant="outline">{row.getValue('action')}</Badge>
      },
    },
    {
      accessorKey: 'entityType',
      header: 'Entity Type',
      cell: ({ row }) => {
        const entityType = row.getValue('entityType')
        return entityType ? (
          <Badge variant="secondary">{entityType as string}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    },
    {
      accessorKey: 'ipAddress',
      header: 'IP Address',
      cell: ({ row }) => {
        return (
          <span className="text-muted-foreground">
            {row.getValue('ipAddress') || '-'}
          </span>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const log = row.original
        return (
          <div className="flex justify-end">
            <LogDetailsDialog log={log} />
          </div>
        )
      },
    },
  ]

  const fetchLogs = async (page = 1, searchQuery = '', action = '') => {
    setLoading(true)
    try {
      const pageSize = pagination.pageSize
      const skip = (page - 1) * pageSize

      let url = `/api/admin-logs?skip=${skip}&take=${pageSize}`
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`
      }
      if (action && action !== 'ALL') {
        url += `&action=${encodeURIComponent(action)}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch logs')
      }

      const data = await response.json()
      setLogs(data.logs)
      setPagination({
        ...pagination,
        pageCount: Math.ceil(data.total / pageSize),
        total: data.total,
      })
    } catch (error) {
      console.error('Error fetching logs:', error)
      toast.error('Failed to load admin logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs(pagination.pageIndex + 1, searchQuery, actionFilter)
  }, [pagination.pageIndex, pagination.pageSize, searchQuery, actionFilter])

  const table = useReactTable({
    data: logs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    },
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function'
          ? updater({
              pageIndex: pagination.pageIndex,
              pageSize: pagination.pageSize,
            })
          : updater
      setPagination({
        ...pagination,
        pageIndex: newPagination.pageIndex,
        pageSize: newPagination.pageSize,
      })
    },
    manualPagination: true,
    pageCount: pagination.pageCount,
  })

  // Get unique action values for the filter dropdown
  const uniqueActions = Array.from(new Set(logs.map((log) => log.action)))

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 py-4">
        <Input
          placeholder="Search logs..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="max-w-sm"
        />
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All actions</SelectItem>
            {uniqueActions.map((action) => (
              <SelectItem key={action} value={action}>
                {action}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {loading ? 'Loading...' : 'No logs found.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-muted-foreground text-sm">
          Showing{' '}
          <strong>
            {table.getRowModel().rows.length
              ? pagination.pageIndex * pagination.pageSize + 1
              : 0}
          </strong>{' '}
          to{' '}
          <strong>
            {Math.min(
              (pagination.pageIndex + 1) * pagination.pageSize,
              pagination.total
            )}
          </strong>{' '}
          of <strong>{pagination.total}</strong> entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
