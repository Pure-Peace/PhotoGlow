import { Post, PostType } from '@photoglow/shared/types/post'
import { buildUrl, authorizationHeader, respError } from '../../lib/utils'
import { CreatePostData, UpdatePostData } from '@photoglow/shared/types/api'

async function getPost(postId: string, accessToken?: string): Promise<Post> {
  const res = await fetch(buildUrl(`posts/${postId}`), {
    cache: 'no-store',
    credentials: 'include',
    headers: authorizationHeader(accessToken),
  })

  if (!res.ok) {
    throw await respError(res)
  }

  return res.json()
}

async function getPostList(options?: {
  accessToken?: string
  limit?: number
  offset?: number
  order?: 'asc' | 'desc'
  filter?: 'following'
  username?: string
  type?: PostType
}): Promise<Post[]> {
  const queryParams = new URLSearchParams()

  if (options?.limit) {
    queryParams.set('limit', options.limit.toString())
  }

  if (options?.offset) {
    queryParams.set('offset', options.offset.toString())
  }

  if (options?.order) {
    queryParams.set('order', options.order)
  }

  if (options?.filter) {
    queryParams.set('filter', options.filter)
  }

  if (options?.username) {
    queryParams.set('username', options.username)
  }

  if (options?.type) {
    queryParams.set('type', options.type)
  }

  const res = await fetch(buildUrl(`posts?${queryParams}`), {
    cache: 'no-store',
    credentials: 'include',
    headers: authorizationHeader(options?.accessToken),
  })

  if (!res.ok) {
    throw await respError(res)
  }

  return res.json()
}

async function submitPost(
  accessToken: string,
  postData: CreatePostData
): Promise<string> {
  const res = await fetch(buildUrl('posts/create'), {
    method: 'POST',
    body: JSON.stringify(postData),
    credentials: 'include',
    cache: 'no-store',
    headers: {
      ...authorizationHeader(accessToken),
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    throw await respError(res)
  }

  const { id } = await res.json()
  return id
}

// Delete post
async function deletePost(
  accessToken: string,
  postId: string
): Promise<boolean> {
  const res = await fetch(buildUrl(`posts/${postId}`), {
    method: 'DELETE',
    credentials: 'include',
    cache: 'no-store',
    headers: {
      ...authorizationHeader(accessToken),
    },
  })

  if (!res.ok) {
    throw await respError(res)
  }

  const { success } = await res.json()
  return success
}

// Edit post
async function editPost(
  accessToken: string,
  postId: string,
  updates: UpdatePostData
): Promise<boolean> {
  const res = await fetch(buildUrl(`posts/${postId}`), {
    method: 'PUT',
    body: JSON.stringify(updates),
    credentials: 'include',
    cache: 'no-store',
    headers: {
      ...authorizationHeader(accessToken),
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    throw await respError(res)
  }

  const { success } = await res.json()
  return success
}

export { getPost, getPostList, submitPost, deletePost, editPost }
