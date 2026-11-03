/* eslint-disable @next/next/no-img-element */
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
  EyeIcon,
  EyeOffIcon,
  LayoutIcon,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  X,
  Image,
  FileText,
  Video,
  Edit,
  Eye,
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

interface Post {
  id: string
  title: string
  type: 'PHOTO' | 'VIDEO' | 'ARTICLE'
  visibility: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS'
  content?: string
  cover?: string
  media?: string[]
  authorId: string
  author: {
    id: string
    username: string
    displayName?: string
    avatar?: string
  }
  createdAt: string
  updatedAt: string
  lastActiveAt: string
  commentsCount: number
  likesCount: number
  savesCount: number
}

function PostDetailsDialog({
  post,
  onUpdate,
}: {
  post: Post
  onUpdate: (updatedPost: Post) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    title: post.title,
    content: post.content || '',
    visibility: post.visibility,
    type: post.type,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
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

      const updatedPost = { ...post, ...formData }
      onUpdate(updatedPost)
      setIsEditing(false)
      toast.success('Post updated successfully')
    } catch (error) {
      console.error('Error updating post:', error)
      toast.error('Failed to update post')
    }
  }

  const renderTypeIcon = (type: string) => {
    switch (type) {
      case 'PHOTO':
        return <Image className="h-5 w-5" />
      case 'VIDEO':
        return <Video className="h-5 w-5" />
      case 'ARTICLE':
        return <FileText className="h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <Eye className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[800px]">
        <DialogHeader className="space-y-1 pt-4">
          <DialogTitle className="flex items-center justify-between">
            {isEditing ? 'Edit Post' : 'Post Details'}
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
            View and manage post information
          </DialogDescription>
        </DialogHeader>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {(post.media?.length || 0 > 0 || post.cover) && (
              <Carousel className="w-full">
                <CarouselContent>
                  {post.media && post.media.length > 0 ? (
                    post.media.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="overflow-hidden rounded-md">
                          <img
                            src={image}
                            alt={`${post.title} - image ${index + 1}`}
                            className="aspect-video w-full object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))
                  ) : post.cover ? (
                    <CarouselItem>
                      <div className="overflow-hidden rounded-md">
                        <img
                          src={post.cover}
                          alt={post.title}
                          className="aspect-video w-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ) : null}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            )}

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  disabled={!isEditing}
                  rows={6}
                />
              </div>

              {isEditing && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="visibility">Visibility</Label>
                    <Select
                      value={formData.visibility}
                      onValueChange={(
                        value: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS'
                      ) => setFormData({ ...formData, visibility: value })}
                    >
                      <SelectTrigger id="visibility">
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUBLIC">Public</SelectItem>
                        <SelectItem value="PRIVATE">Private</SelectItem>
                        <SelectItem value="FOLLOWERS">
                          Followers Only
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: 'PHOTO' | 'VIDEO' | 'ARTICLE') =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PHOTO">Photo</SelectItem>
                        <SelectItem value="VIDEO">Video</SelectItem>
                        <SelectItem value="ARTICLE">Article</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>

            <Separator />

            <div className="space-y-1">
              <div className="text-sm font-medium">Author</div>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback>
                    {getInitials(
                      post.author.displayName || post.author.username
                    )}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  {post.author.displayName || post.author.username}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Post Status</div>
              <div className="text-muted-foreground text-sm">
                Visibility:{' '}
                <Badge
                  variant={
                    post.visibility === 'PUBLIC'
                      ? 'default'
                      : post.visibility === 'FOLLOWERS'
                        ? 'secondary'
                        : 'outline'
                  }
                  className="capitalize"
                >
                  {post.visibility.toLowerCase()}
                </Badge>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium">Comments</div>
                <div className="text-muted-foreground text-sm">
                  {post.commentsCount}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium">Likes</div>
                <div className="text-muted-foreground text-sm">
                  {post.likesCount}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium">Saves</div>
                <div className="text-muted-foreground text-sm">
                  {post.savesCount}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Created</div>
              <div className="text-muted-foreground text-sm">
                {formatDate(post.createdAt)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Last Updated</div>
              <div className="text-muted-foreground text-sm">
                {formatDate(post.updatedAt)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Last Active</div>
              <div className="text-muted-foreground text-sm">
                {formatDate(post.lastActiveAt)}
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
                    title: post.title,
                    content: post.content || '',
                    visibility: post.visibility,
                    type: post.type,
                  })
                }}
              >
                Cancel
              </Button>
            </>
          )}
          <DialogClose />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function PostsDataTable() {
  const router = useRouter()

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
    pageCount: 0,
    total: 0,
  })

  const handleVisibilityChange = async (
    postId: string,
    visibility: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS'
  ) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility }),
      })

      if (!response.ok) {
        throw new Error('Failed to update post visibility')
      }

      setPosts(
        posts.map((post) =>
          post.id === postId ? { ...post, visibility } : post
        )
      )

      toast.success(`Post visibility updated to ${visibility.toLowerCase()}`)
    } catch (error) {
      console.error('Error updating post visibility:', error)
      toast.error('Failed to update post visibility')
    }
  }

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete post')
      }

      setPosts(posts.filter((post) => post.id !== postId))
      toast.success('Post deleted successfully')
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Failed to delete post')
    }
  }

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(
      posts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    )
  }

  const renderPostTypeIcon = (type: string) => {
    switch (type) {
      case 'PHOTO':
        return <Image className="h-4 w-4 text-blue-500" />
      case 'VIDEO':
        return <Video className="h-4 w-4 text-red-500" />
      case 'ARTICLE':
        return <FileText className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  const columns: ColumnDef<Post>[] = [
    {
      accessorKey: 'title',
      header: 'Post',
      cell: ({ row }) => {
        const post = row.original
        return (
          <div className="flex items-center gap-3 pl-2">
            <div className="relative h-10 w-14 flex-shrink-0 overflow-hidden rounded-sm">
              {post.cover ? (
                <img
                  src={post.cover}
                  alt={post.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="bg-muted flex h-full w-full items-center justify-center">
                  {renderPostTypeIcon(post.type)}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="line-clamp-1 font-medium">{post.title}</span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  {renderPostTypeIcon(post.type)}
                  <span className="capitalize">{post.type.toLowerCase()}</span>
                </span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'author',
      header: 'Author',
      cell: ({ row }) => {
        const author = row.original.author
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={author.avatar} />
              <AvatarFallback>
                {getInitials(author.displayName || author.username)}
              </AvatarFallback>
            </Avatar>
            <span>{author.displayName || author.username}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'visibility',
      header: 'Visibility',
      cell: ({ row }) => {
        const visibility = row.getValue('visibility') as string
        return (
          <Badge
            variant={
              visibility === 'PUBLIC'
                ? 'default'
                : visibility === 'FOLLOWERS'
                  ? 'secondary'
                  : 'outline'
            }
            className="capitalize"
          >
            {visibility.toLowerCase()}
          </Badge>
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
      accessorKey: 'stats',
      header: 'Engagement',
      cell: ({ row }) => {
        const post = row.original
        return (
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground text-xs">💬</span>
              <span className="text-xs">{post.commentsCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground text-xs">❤️</span>
              <span className="text-xs">{post.likesCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground text-xs">🔖</span>
              <span className="text-xs">{post.savesCount}</span>
            </div>
          </div>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const post = row.original
        return (
          <div className="flex items-center gap-2">
            <PostDetailsDialog post={post} onUpdate={handlePostUpdate} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    window.open(
                      `${process.env.NEXT_PUBLIC_API_URL}/@${post.author.username}/${post.id}`,
                      '_blank'
                    )
                  }}
                >
                  View post
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Change visibility</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => handleVisibilityChange(post.id, 'PUBLIC')}
                >
                  <EyeIcon className="mr-2 h-4 w-4" />
                  Public
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleVisibilityChange(post.id, 'FOLLOWERS')}
                >
                  <EyeIcon className="mr-2 h-4 w-4" />
                  Followers only
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleVisibilityChange(post.id, 'PRIVATE')}
                >
                  <EyeOffIcon className="mr-2 h-4 w-4" />
                  Private
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeletePost(post.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const fetchPosts = async (page = 1, searchQuery = '') => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/posts?page=${page}&search=${searchQuery}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }

      const data = await response.json()
      setPosts(data.posts)
      setPagination({
        pageIndex: data.pagination.page - 1,
        pageSize: data.pagination.pageSize,
        pageCount: data.pagination.totalPages,
        total: data.pagination.total,
      })
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const table = useReactTable({
    data: posts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newPagination = updater(table.getState().pagination)
        fetchPosts(newPagination.pageIndex + 1)
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
            placeholder="Search posts..."
            className="max-w-xs"
            value={(table.getColumn('title')?.getFilterValue() as string) || ''}
            onChange={(e) => {
              table.getColumn('title')?.setFilterValue(e.target.value)
              fetchPosts(1, e.target.value)
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
                  No posts found.
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
          of {pagination.total} posts
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
