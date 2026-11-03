'use client'

import { PostCard } from '@/components/post/post-card'
import { cn } from '@/lib/utils'
import type { Post } from '@photoglow/shared/types/post'
import { ImagePlus, Plus } from 'lucide-react'
import { Button } from '../ui/button'
import { useUploadDialogStore } from '@/stores/upload-dialog'
import { Skeleton } from '../ui/skeleton'
import { useRouter } from 'next/navigation'
import { useMediaQuery } from 'react-responsive'

export function PostGrid({
  posts,
  loading,
  customEmptyState,
  className,
}: {
  posts: Post[]
  loading: boolean
  customEmptyState?: React.ReactNode
  className?: string
}) {
  if (loading && !posts?.length) {
    return (
      <div
        className={cn(
          'grid grid-cols-2 gap-x-2 gap-y-3 sm:grid-cols-2 md:grid-cols-3 md:gap-x-4 md:gap-y-6 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6',
          className
        )}
      >
        {/* skeleton */}
        {Array.from({ length: 1 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[3/4] rounded-xl" />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-10" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!posts?.length) {
    return customEmptyState || <EmptyState />
  }

  return (
    <div
      className={cn(
        'relative grid grid-cols-2 gap-x-2 gap-y-3 sm:grid-cols-2 md:grid-cols-3 md:gap-x-4 md:gap-y-6 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6',
        className
      )}
    >
      {posts.map((post, index) => (
        <PostCard key={`${post.id}-${index}`} post={post} />
      ))}

      {/* Loading indicator */}
      {loading && (
        <div className="absolute bottom-0 left-1/2 z-10 h-8 -translate-x-1/2">
          <div className="border-muted-foreground size-6 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
      )}
    </div>
  )
}

export function EmptyState({
  title,
  subtitle,
  showUpload = true,
  icon,
}: {
  title?: string
  subtitle?: string
  showUpload?: boolean
  icon?: React.ElementType
}) {
  const { setUploadDialog } = useUploadDialogStore()
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })
  const router = useRouter()

  const Icon = icon || ImagePlus
  const defaultTitle = 'No photos yet'
  const defaultSubtitle = 'Your gallery is waiting for your creative moments'

  return (
    <div className="border-card-200 mx-6 mt-8 flex min-h-[400px] flex-col items-center justify-center">
      <div className="flex flex-col items-center space-y-6 px-4 text-center">
        <Icon className="size-12" />

        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight">
            {title || defaultTitle}
          </h3>
          <p className="max-w-md">{subtitle || defaultSubtitle}</p>
        </div>

        {showUpload && (
          <>
            <Button
              size="lg"
              className="group relative overflow-hidden"
              onClick={() => {
                if (isMobile) {
                  router.push('/upload')
                } else {
                  setUploadDialog(true)
                }
              }}
            >
              <Plus className="size-5 transition-transform group-hover:rotate-90" />
              Start Uploading
            </Button>

            <p className="text-muted-foreground max-w-[300px] text-sm">
              Share your photos with the world and inspire others with your
              unique perspective
            </p>
          </>
        )}
      </div>
    </div>
  )
}
