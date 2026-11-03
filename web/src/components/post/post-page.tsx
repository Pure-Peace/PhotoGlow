'use client'

import { useEffect, useState } from 'react'
import { PostMain } from './post-main'
import { Post404 } from './post-404'
import { api } from '@/api'
import { useSSRAuth } from '@/app/context/ssr-auth-context'
import type { Post } from '@photoglow/shared/types/post'

interface PostPageProps {
  postId: string
  initialPost?: Post
}

export function PostPageContent({ postId, initialPost }: PostPageProps) {
  const [isInitial, setIsInitial] = useState(true)

  const [post, setPost] = useState<Post | null>(initialPost || null)
  const [error, setError] = useState(false)
  const auth = useSSRAuth()

  useEffect(() => {
    async function fetchPost() {
      try {
        const data = await api.getPost(postId, auth?.accessToken)
        setPost(data)
      } catch (err) {
        console.error('Failed to fetch post:', err)
        setError(true)
      }
    }

    if (isInitial) {
      if (!post) {
        fetchPost()
      }
      setIsInitial(false)
      return
    }

    fetchPost()
  }, [postId, auth?.accessToken, isInitial])

  if (error) {
    return <Post404 />
  }

  if (!post) {
    return null // or a loading spinner
  }

  return <PostMain post={post} />
}
