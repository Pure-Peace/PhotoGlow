'use client'

import { useEffect, useRef, useState } from 'react'
import { Heart, Save, Camera } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import { EmptyState, PostGrid } from '../post/post-grid'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api } from '@/api'
import type { Post, PostType, PostListType } from '@photoglow/shared/types/post'
import { useAuthStore } from '@/stores/auth'
import { useOnScreen } from '@/hooks/use-onscreen'

interface TabButtonProps {
  icon: React.ElementType
  children?: React.ReactNode
}

const icons = {
  posts: Camera,
  saved: Save,
  liked: Heart,
}

export function TabButton({
  icon,
  children,
  ...props
}: React.ComponentProps<'button'> & TabButtonProps) {
  const Icon = icon

  return (
    <button {...props}>
      <Icon className="h-5 w-5" />
      <span className="sm:ml-2">{children}</span>
    </button>
  )
}

export function ProfileTabs({
  username,
  defaultTab = 'posts',
}: {
  username: string
  defaultTab?: PostListType
}) {
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get('tab')
  const { accessToken, isReady, user } = useAuthStore()

  const [tab, setTab] = useState<PostListType>(
    tabFromUrl && ['posts', 'saved', 'liked'].includes(tabFromUrl)
      ? (tabFromUrl as PostListType)
      : defaultTab
  )
  const [postList, setPostList] = useState<Record<PostListType, Post[]>>({
    posts: [],
    saved: [],
    liked: [],
  })
  const [loading, setLoading] = useState(true)
  const [offset, setOffset] = useState<Record<PostListType, number>>({
    posts: 0,
    saved: 0,
    liked: 0,
  })

  /* const [hasMore, setHasMore] = useState<Record<PostListType, boolean>>({
    posts: true,
    saved: true,
    liked: true,
  }) */

  const ref = useRef<HTMLDivElement>(null)
  const isOnScreen = useOnScreen(ref)

  const updatePostGrid = async () => {
    if (!isReady) return

    try {
      setLoading(true)
      const posts = await api.getPostList({
        accessToken: accessToken || undefined,
        username: username,
        type: tab as PostType,
        limit: 18,
        offset: offset[tab],
      })
      setPostList((prev) => ({
        ...prev,
        [tab]: [...prev[tab], ...posts],
      }))
      setOffset((prev) => ({
        ...prev,
        [tab]: prev[tab] + 18,
      }))
      /* setHasMore((prev) => ({
        ...prev,
        [tab]: posts.length === 18,
      })) */
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    updatePostGrid()
  }, [tab, accessToken, isReady, username])

  useEffect(() => {
    if (isOnScreen && !loading) {
      updatePostGrid()
    }
  }, [isOnScreen])

  return (
    <>
      <Tabs
        className="relative gap-4"
        value={tab}
        onValueChange={(value) => setTab(value as PostListType)}
      >
        <TabsList className="mb-2 w-full gap-4 sm:w-fit">
          <TabsTrigger value="posts" asChild>
            <TabButton icon={icons.posts}>Posts</TabButton>
          </TabsTrigger>
          <TabsTrigger value="saved" asChild>
            <TabButton icon={icons.saved}>Saved</TabButton>
          </TabsTrigger>
          <TabsTrigger value="liked" asChild>
            <TabButton icon={icons.liked}>Liked</TabButton>
          </TabsTrigger>
        </TabsList>

        {/* photo grid */}
        <PostGrid
          posts={postList[tab]}
          loading={loading}
          customEmptyState={
            user?.username !== username && (
              <EmptyState
                title="Nothing to see here"
                showUpload={false}
                subtitle={`This user has not ${tab} anything yet`}
                icon={icons[tab]}
              />
            )
          }
        />
      </Tabs>

      {/* observer */}
      <div ref={ref} className="h-0" />

      {/* <div className="flex justify-center">
        {!loading && hasMore[tab] ? (
          <Button
            disabled={loading}
            className="text-muted-foreground w-full"
            variant="ghost"
            onClick={updatePostGrid}
          >
            Load more
          </Button>
        ) : (
          postList[tab].length > 0 && (
            <p className="text-muted-foreground my-4 text-sm">No more posts</p>
          )
        )}
      </div> */}
    </>
  )
}
