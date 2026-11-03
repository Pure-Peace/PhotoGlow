import 'server-only'

import { cookies, headers } from 'next/headers'
import { cache } from 'react'
import type { UserWithAccessToken } from '@photoglow/shared/types/user'
import { TokenType } from '@photoglow/shared/types/user'

import { api } from '@/api'

export const ssrAuth = cache(async (): Promise<UserWithAccessToken | null> => {
  const headersList = await headers()
  let accessToken = headersList.get(TokenType.ACCESS_TOKEN)

  // if accessToken is not exist, try to refresh it
  if (!accessToken) {
    const cookie = await cookies()
    const refreshToken = cookie.get(TokenType.REFRESH_TOKEN)?.value

    // if refreshToken is not exist, return null
    if (!refreshToken) return null

    const newAccessToken = await api.refreshAccessToken(refreshToken)
    if (!newAccessToken) return null

    accessToken = newAccessToken as string
  }

  // fetch user info
  const user = await api.getUserInfo(accessToken)
  if (!user) return null

  return {
    accessToken,
    user,
  }
})
