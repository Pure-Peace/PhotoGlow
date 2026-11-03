'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
import {
  ArrowUpDown,
  MoreHorizontal,
  Search,
  UserRoundCheck,
  UserRoundX,
  LayoutIcon,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

interface User {
  id: string
  email: string
  username: string
  displayName?: string
  avatar?: string
  bio?: string
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED'
  createdAt: string
  lastActiveAt: string
}

function UserDetailsDialog({
  user,
  onUpdate,
}: {
  user: User
  onUpdate: (updatedUser: User) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: user.username,
    displayName: user.displayName || '',
    email: user.email,
    bio: user.bio || '',
    avatar: user.avatar || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = (await response.json()) as {
          message: string
          errors: {
            fieldErrors: Record<string, string[]>
            formErrors: string[]
          }
        }
        toast.error(JSON.stringify(data))
        return
      }

      const updatedUser = { ...user, ...formData }
      onUpdate(updatedUser)
      setIsEditing(false)
      toast.success('User updated successfully')
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Failed to update user')
    }
  }

  const handleAvatarDelete = async () => {
    try {
      const response = await fetch(`/api/users/${user.id}/avatar`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete avatar')
      }

      setFormData({ ...formData, avatar: '' })
      onUpdate({ ...user, avatar: '' })
      toast.success('Avatar deleted successfully')
    } catch (error) {
      console.error('Error deleting avatar:', error)
      toast.error('Failed to delete avatar')
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center justify-between">
            {isEditing ? 'Edit User' : 'User Details'}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <X className="h-4 w-4" />
              ) : (
                <Pencil className="h-4 w-4" />
              )}
            </Button>
          </DialogTitle>
          <DialogDescription>
            View and manage user information
          </DialogDescription>
        </DialogHeader>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={formData.avatar} />
                <AvatarFallback className="text-lg">
                  {getInitials(formData.displayName || formData.username)}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleAvatarDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Avatar
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  disabled={!isEditing}
                  rows={4}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-1">
              <div className="text-sm font-medium">Account Status</div>
              <div className="text-muted-foreground text-sm">
                Current status:{' '}
                <Badge
                  variant={
                    user.status === 'ACTIVE'
                      ? 'default'
                      : user.status === 'SUSPENDED'
                        ? 'secondary'
                        : 'destructive'
                  }
                  className="capitalize"
                >
                  {user.status.toLowerCase()}
                </Badge>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Registration Date</div>
              <div className="text-muted-foreground text-sm">
                {formatDate(user.createdAt)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Last Active</div>
              <div className="text-muted-foreground text-sm">
                {formatDate(user.lastActiveAt)}
              </div>
            </div>
          </form>
        </div>
        <DialogFooter>
          {isEditing && (
            <>
              <Button type="submit" onClick={handleSubmit}>
                Save changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setFormData({
                    username: user.username,
                    displayName: user.displayName || '',
                    email: user.email,
                    bio: user.bio || '',
                    avatar: user.avatar || '',
                  })
                }}
              >
                Cancel
              </Button>
            </>
          )}
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function UsersDataTable() {
  const router = useRouter()

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
    pageCount: 0,
    total: 0,
  })

  const handleStatusChange = async (
    userId: string,
    status: 'ACTIVE' | 'SUSPENDED' | 'DELETED'
  ) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user status')
      }

      setUsers(
        users.map((user) => (user.id === userId ? { ...user, status } : user))
      )

      toast.success(`User ${userId} is now ${status.toLowerCase()}`)
    } catch (error) {
      console.error('Error updating user status:', error)
      toast.error('Failed to update user status')
    }
  }

  const handleUserUpdate = (updatedUser: User) => {
    setUsers(
      users.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    )
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'username',
      header: 'User',
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-3 pl-2">
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback>
                {getInitials(user.displayName || user.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">
                {user.displayName || user.username}
              </span>
              <span className="text-muted-foreground text-sm">
                @{user.username}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <div className="flex items-center gap-2">
            <Badge
              variant={
                status === 'ACTIVE'
                  ? 'default'
                  : status === 'SUSPENDED'
                    ? 'secondary'
                    : 'destructive'
              }
              className="capitalize"
            >
              {status.toLowerCase()}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent"
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => formatDate(row.getValue('createdAt')),
    },
    {
      accessorKey: 'lastActiveAt',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent"
          >
            Last Active
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => formatDate(row.getValue('lastActiveAt')),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original
        return <UserDetailsDialog user={user} onUpdate={handleUserUpdate} />
      },
    },
    {
      id: 'change-status',
      cell: ({ row }) => {
        return (
          <Select
            onValueChange={(value: 'ACTIVE' | 'SUSPENDED' | 'DELETED') =>
              handleStatusChange(row.original.id, value)
            }
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Change status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">
                <div className="flex items-center">
                  <UserRoundCheck className="mr-2 h-4 w-4" />
                  Active
                </div>
              </SelectItem>
              <SelectItem value="SUSPENDED">
                <div className="flex items-center">
                  <UserRoundX className="mr-2 h-4 w-4" />
                  Suspended
                </div>
              </SelectItem>
              <SelectItem value="DELETED">
                <div className="flex items-center">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Deleted
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        )
      },
    },
  ]

  const fetchUsers = async (page = 1, searchQuery = '') => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/users?page=${page}&search=${searchQuery}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      setUsers(data.users)
      setPagination({
        pageIndex: data.pagination.page - 1,
        pageSize: data.pagination.pageSize,
        pageCount: data.pagination.totalPages,
        total: data.pagination.total,
      })
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newPagination = updater(table.getState().pagination)
        fetchUsers(newPagination.pageIndex + 1)
      }
    },
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
    manualPagination: true,
    pageCount: pagination.pageCount,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search users..."
            className="max-w-xs"
            value={
              (table.getColumn('username')?.getFilterValue() as string) || ''
            }
            onChange={(e) => {
              table.getColumn('username')?.setFilterValue(e.target.value)
              fetchUsers(1, e.target.value)
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <LayoutIcon className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
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
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: pagination.pageSize }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((column, cellIndex) => (
                    <TableCell key={cellIndex} className="h-16">
                      <div className="bg-muted h-4 w-full animate-pulse rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
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
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="text-muted-foreground flex-1 text-sm">
          Showing{' '}
          {table.getState().pagination.pageIndex * pagination.pageSize + 1} to{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * pagination.pageSize,
            pagination.total
          )}{' '}
          of {pagination.total} users
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
