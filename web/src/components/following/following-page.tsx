'use client'

import type { Post } from '@photoglow/shared/types/post'
import { PostGrid } from '@/components/post/post-grid'
import { Button } from '@/components/ui/button'
import { LogIn, Users } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth'
import { AuthButton } from '@/components/auth/auth-button'
import { useSSRAuth } from '@/app/context/ssr-auth-context'
import { api } from '@/api'
import { useOnScreen } from '@/hooks/use-onscreen'
import { useState, useRef, useEffect } from 'react'

interface FollowingPageProps {
  initialPosts: Post[] | null
}

export function FollowingPage({ initialPosts }: FollowingPageProps) {
  const ssrAuth = useSSRAuth()
  const { user, accessToken } = useAuthStore()

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
        accessToken: accessToken || ssrAuth?.accessToken || undefined,
        limit: 18,
        offset,
        filter: 'following',
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

  if (!ssrAuth && !user) {
    return <NotLoggedIn />
  }

  const Display =
    initialPosts && initialPosts.length > 0 ? (
      <>
        <PostGrid
          className="px-2 py-2 md:px-4"
          posts={postList}
          loading={loading}
        />
        {/* observer */}
        <div ref={ref} className="h-0" />
      </>
    ) : (
      <EmptyState />
    )

  return (
    <div className="min-h-full pt-4 md:pt-6">
      <div className="mb-4 px-4">
        <h1 className="text-xl font-bold md:text-2xl">Following Feed</h1>
        <p className="text-muted-foreground text-sm">
          See the latest posts from people you follow
        </p>
      </div>

      {Display}
    </div>
  )
}

export function NotLoggedIn() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 px-4 text-center">
      <div className="flex items-center justify-center">
        <Users className="size-12" />
      </div>
      <h1 className="text-2xl font-bold">See Posts from People You Follow</h1>
      <p className="text-muted-foreground max-w-md">
        Sign in to see photos and videos from users you follow
      </p>
      <Button asChild>
        <AuthButton>
          <LogIn className="mr-2 h-4 w-4" />
          Sign In
        </AuthButton>
      </Button>
    </div>
  )
}

export function EmptyState() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center space-y-6 px-4 text-center">
      <div className="bg-muted/30 flex h-20 w-20 items-center justify-center rounded-full">
        <Users className="size-12" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-medium">No posts to show</h2>
        <p className="max-w-md">
          Follow more users to see their content in your feed
        </p>
      </div>
      <Button asChild size="lg">
        <Link href="/">
          <Users className="mr-2 h-4 w-4" />
          Discover Users
        </Link>
      </Button>
    </div>
  )
}
