'use client'

import { Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import type { Post } from '@photoglow/shared/types/post'
import { UserAvatar } from '@/components/ui/user-avatar'
import { usePostDialogStore } from '@/stores/post-dialog'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/api'
import { toast } from 'sonner'
import { useMediaQuery } from 'react-responsive'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const { postDialog } = usePostDialogStore()
  const { accessToken } = useAuthStore()
  const [likeLoading, setLikeLoading] = useState(false)
  const [liked, setLiked] = useState(post.interactions.likes.hasLiked)
  const [likeCount, setLikeCount] = useState(post.interactions.likes.count)

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })

  const postHref = `/@${post.author.username}/photo/${post.id}`

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // pc: open in dialog
    if (!isMobile) {
      e.preventDefault()
      postDialog(postHref, post)
    }
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (likeLoading) return
    if (!accessToken) {
      toast.error('Please login to continue')
      return
    }

    setLikeLoading(true)
    try {
      const res = await api.likePost(accessToken, post.id, !liked)
      // Update local state
      setLiked(res)
      setLikeCount((prev) => (res ? prev + 1 : prev - 1))
      // Update post object for consistency
      post.interactions.likes.hasLiked = res
      post.interactions.likes.count = res ? likeCount + 1 : likeCount - 1
    } catch (error) {
      console.error('Failed to like/unlike:', error)
      toast.error('Failed to like post')
      // Revert local state on error
      setLiked(post.interactions.likes.hasLiked)
      setLikeCount(post.interactions.likes.count)
    } finally {
      setLikeLoading(false)
    }
  }

  return (
    <div className="group overflow-hidden">
      {/* image */}
      <Link href={postHref} className="block" onClick={onClick}>
        <div className="group/image relative aspect-[3/4] overflow-hidden rounded-3xl transition-all duration-300">
          <div className="absolute inset-0 z-10 bg-black/0 transition-all duration-150 group-hover/image:bg-white/15" />
          <Image
            src={post.cover || ''}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            className="rounded-3xl object-cover"
          />
        </div>
      </Link>

      {/* card body */}
      <div className="mt-1 space-y-1.5 px-1 md:mt-2">
        <Link
          href={postHref}
          onClick={onClick}
          className="line-clamp-2 text-sm font-medium"
        >
          {post.title}
        </Link>

        {/* card footer */}
        <div className="flex w-full items-center justify-between">
          {/* author */}
          <Link
            href={`/@${post.author.username}`}
            className="flex items-center space-x-1"
          >
            {/* avatar */}
            <UserAvatar
              name={post.author.displayName}
              avatar={post.author.avatar}
              className="border-muted size-6 border"
            />

            {/* author name */}
            <div className="text-primary/90 max-w-[100px] overflow-hidden text-sm text-ellipsis whitespace-nowrap transition-colors duration-300 hover:text-blue-500">
              {post.author.displayName}
            </div>
          </Link>

          {/* likes */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={cn(
                'text-primary/80 flex items-center text-sm transition-colors hover:text-rose-600',
                liked && 'text-rose-600',
                likeLoading && 'cursor-not-allowed opacity-50'
              )}
            >
              <Heart
                className={cn('mr-1 h-3.5 w-3.5', liked && 'fill-current')}
              />
              <span>{likeCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
