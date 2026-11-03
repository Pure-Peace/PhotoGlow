'use client'

import { api } from '@/api'
import { PostGrid } from '@/components/post/post-grid'
import { Button } from '@/components/ui/button'
import { useOnScreen } from '@/hooks/use-onscreen'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import type { Post } from '@photoglow/shared/types/post'
import type { UserWithAccessToken } from '@photoglow/shared/types/user'
import { useState, useRef, useEffect } from 'react'

// TODO
const categories: any[] = [
  /*   { name: 'All', active: true },
  { name: 'Photography', active: false },
  { name: 'Nature', active: false },
  { name: 'Travel', active: false },
  { name: 'Food', active: false },
  { name: 'Fashion', active: false },
  { name: 'Art', active: false }, */
]

interface HomePageProps {
  ssrAuth: UserWithAccessToken | null
  initialPosts: Post[]
}

export function HomePage({ initialPosts }: HomePageProps) {
  const { accessToken } = useAuthStore()

  const [postList, setPostList] = useState<Post[]>(initialPosts ?? [])
  const [loading, setLoading] = useState(true)
  const [offset, setOffset] = useState(initialPosts?.length ?? 0)
  const [hasMore, setHasMore] = useState(true)

  const ref = useRef<HTMLDivElement>(null)
  const isOnScreen = useOnScreen(ref)

  const updatePostGrid = async () => {
    if (!hasMore) return

    try {
      setLoading(true)
      const posts = await api.getPostList({
        accessToken: accessToken || undefined,
        limit: 18,
        offset,
      })
      setPostList((prev) => [...prev, ...posts])
      setOffset((prev) => prev + 18)
      setHasMore(posts && posts.length > 0)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOnScreen) {
      updatePostGrid()
    }
  }, [isOnScreen])

  return (
    <div className="min-h-full pt-4 md:pt-6">
      <div className="flex items-center gap-4 px-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.name}
              variant={category.active ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'h-6 rounded-full text-xs md:h-8',
                category.active ? 'bg-primary' : 'bg-background'
              )}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      <PostGrid
        className="px-2 py-4 md:px-4 md:py-6"
        posts={postList}
        loading={loading}
      />

      {/* observer */}
      <div ref={ref} className="h-0" />
    </div>
  )
}
