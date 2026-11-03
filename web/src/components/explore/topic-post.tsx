'use client'

import { api } from '@/api'
import { PostGrid } from '@/components/post/post-grid'
import { useOnScreen } from '@/hooks/use-onscreen'
import type { Post } from '@photoglow/shared/types/post'
import { useState, useRef, useEffect } from 'react'

interface TopicPostsProps {
  initialPosts: Post[]
  topicName: string
}

export function TopicPosts({ initialPosts, topicName }: TopicPostsProps) {
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
      const { posts } = await api.getTopicPosts(topicName, {
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
    <div className="min-h-full w-full pt-4 md:pt-6">
      <PostGrid posts={postList} loading={loading} />

      {/* observer */}
      <div ref={ref} className="h-0" />
    </div>
  )
}
