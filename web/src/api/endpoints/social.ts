import { buildUrl, authorizationHeader, respError } from '@/lib/utils'

async function followUser(
  accessToken: string,
  userId: string,
  following: boolean
) {
  const res = await fetch(buildUrl(`social/follow/${userId}`), {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    body: JSON.stringify({ following }),
    headers: {
      ...authorizationHeader(accessToken),
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    throw await respError(res)
  }

  const { following: newFollowing } = await res.json()
  return newFollowing
}

// Block a user
async function blockUser(
  accessToken: string,
  userId: string
): Promise<boolean> {
  const res = await fetch(buildUrl(`social/block/${userId}`), {
    method: 'POST',
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

// Unblock a user
async function unblockUser(
  accessToken: string,
  userId: string
): Promise<boolean> {
  const res = await fetch(buildUrl(`social/unblock/${userId}`), {
    method: 'POST',
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

// Get blocked users
async function getBlockedUsers(accessToken: string) {
  const res = await fetch(buildUrl('social/me/blocked'), {
    headers: {
      ...authorizationHeader(accessToken),
    },
    credentials: 'include',
    cache: 'no-store',
  })

  if (!res.ok) {
    throw await respError(res)
  }

  return res.json()
}

// Get user followers
async function getUserFollowers(username: string, accessToken?: string) {
  const res = await fetch(buildUrl(`social/followers/${username}`), {
    headers: authorizationHeader(accessToken),
    credentials: 'include',
    cache: 'no-store',
  })

  if (!res.ok) {
    throw await respError(res)
  }

  return res.json()
}

// Get user following
async function getUserFollowing(username: string, accessToken?: string) {
  const res = await fetch(buildUrl(`social/following/${username}`), {
    headers: authorizationHeader(accessToken),
    credentials: 'include',
    cache: 'no-store',
  })

  if (!res.ok) {
    throw await respError(res)
  }

  return res.json()
}

export {
  followUser,
  blockUser,
  unblockUser,
  getBlockedUsers,
  getUserFollowers,
  getUserFollowing,
}
