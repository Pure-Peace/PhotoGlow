import { buildUrl, authorizationHeader, respError } from '@/lib/utils'
import { CommentData } from '@photoglow/shared/types/post'

async function getComments(
  postId: string,
  options?: {
    accessToken?: string
    parentId?: string
    limit?: number
    offset?: number
  }
): Promise<CommentData[]> {
  const queryParams = new URLSearchParams({
    ...(options?.parentId && { parentId: options.parentId }),
    limit: options?.limit?.toString() || '10',
    offset: options?.offset?.toString() || '0',
  })

  const res = await fetch(buildUrl(`comments/posts/${postId}?${queryParams}`), {
    cache: 'no-store',
    credentials: 'include',
    headers: authorizationHeader(options?.accessToken),
  })

  if (!res.ok) {
    throw await respError(res)
  }

  return res.json()
}

async function createComment(
  accessToken: string,
  postId: string,
  content: string,
  parentId?: string
) {
  const res = await fetch(buildUrl(`comments/posts/${postId}/create`), {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    body: JSON.stringify({ content, parentId }),
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

// Delete comment
async function deleteComment(
  accessToken: string,
  commentId: string
): Promise<boolean> {
  const res = await fetch(buildUrl(`comments/${commentId}`), {
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

export { getComments, createComment, deleteComment }
