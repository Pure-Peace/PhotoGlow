import { buildUrl, authorizationHeader, respError } from '@/lib/utils'

// Report content
async function reportUser(
  accessToken: string,
  userId: string,
  reason: string
): Promise<boolean> {
  const res = await fetch(buildUrl(`moderation/report/user`), {
    method: 'POST',
    body: JSON.stringify({ userId, reason }),
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

// Report content
async function reportPost(
  accessToken: string,
  postId: string,
  reason: string
): Promise<boolean> {
  const res = await fetch(buildUrl(`moderation/report/post`), {
    method: 'POST',
    body: JSON.stringify({ postId, reason }),
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

// Report content
async function reportContent(
  accessToken: string,
  contentType: 'post' | 'user',
  contentId: string,
  reason: string
): Promise<boolean> {
  if (contentType === 'post') {
    return reportPost(accessToken, contentId, reason)
  } else if (contentType === 'user') {
    return reportUser(accessToken, contentId, reason)
  }

  throw new Error('Invalid content type')
}

export { reportUser, reportPost, reportContent }
