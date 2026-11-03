import { buildUrl, authorizationHeader, respError } from '@/lib/utils'

async function likePost(accessToken: string, postId: string, liked: boolean) {
  const res = await fetch(buildUrl(`actions/likes/posts/${postId}`), {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    body: JSON.stringify({ liked }),
    headers: {
      ...authorizationHeader(accessToken),
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    throw await respError(res)
  }

  const { liked: newLiked } = await res.json()
  return newLiked
}

async function savePost(accessToken: string, postId: string, saved: boolean) {
  const res = await fetch(buildUrl(`actions/saves/posts/${postId}`), {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    body: JSON.stringify({ saved }),
    headers: {
      ...authorizationHeader(accessToken),
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    throw await respError(res)
  }

  const { saved: newSaved } = await res.json()
  return newSaved
}

async function likeComment(
  accessToken: string,
  commentId: string,
  liked: boolean
): Promise<boolean> {
  const res = await fetch(buildUrl(`actions/likes/comments/${commentId}`), {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    body: JSON.stringify({ liked }),
    headers: {
      ...authorizationHeader(accessToken),
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    throw await respError(res)
  }

  const { liked: newLiked } = await res.json()
  return newLiked
}

export { likePost, savePost, likeComment }
