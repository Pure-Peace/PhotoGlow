import { buildUrl, authorizationHeader, respError } from '@/lib/utils'
import { User, UserWithAccessToken } from '@photoglow/shared/types/user'

import { SendEmailVerificationCodeData } from '@photoglow/shared/types/api'

async function refreshAccessToken(
  refreshToken?: string
): Promise<string | null> {
  const res = await fetch(buildUrl('auth/refresh'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
    credentials: 'include',
    cache: 'no-store',
  })

  if (!res.ok) {
    return null
  }

  const { accessToken } = await res.json()
  return accessToken
}

async function getUserInfo(accessToken: string): Promise<User | null> {
  const res = await fetch(buildUrl('auth'), {
    headers: {
      ...authorizationHeader(accessToken),
    },
    credentials: 'include',
    cache: 'no-store',
  })

  if (!res.ok) {
    return null
  }

  const user = (await res.json()) as User

  return user
}

async function getOauthAccounts(accessToken: string): Promise<{
  google: boolean
  github: boolean
  twitter: boolean
  facebook: boolean
}> {
  const res = await fetch(buildUrl('auth/oauth-accounts'), {
    headers: { ...authorizationHeader(accessToken) },
    credentials: 'include',
    cache: 'no-store',
  })

  if (!res.ok) {
    throw await respError(res)
  }

  const oauthAccounts = await res.json()

  return oauthAccounts
}

async function deleteGoogleOAuth(accessToken: string): Promise<void> {
  const res = await fetch(buildUrl('auth/google'), {
    method: 'DELETE',
    headers: { ...authorizationHeader(accessToken) },
    credentials: 'include',
    cache: 'no-store',
  })

  if (!res.ok) {
    throw await respError(res)
  }
}

async function logout() {
  const res = await fetch(buildUrl('auth/logout'), {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
  })

  if (!res.ok) {
    throw await respError(res)
  }
}

async function login(
  email: string,
  password: string
): Promise<UserWithAccessToken> {
  const res = await fetch(buildUrl('auth/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    cache: 'no-store',
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    throw await respError(res)
  }

  const authData = (await res.json()) as UserWithAccessToken
  return authData
}

async function register(
  email: string,
  password: string,
  username: string,
  verification: string
): Promise<UserWithAccessToken> {
  const res = await fetch(buildUrl('auth/register'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    cache: 'no-store',
    body: JSON.stringify({ email, password, username, verification }),
  })

  if (!res.ok) {
    throw await respError(res)
  }

  const authData = (await res.json()) as UserWithAccessToken
  return authData
}

async function sendEmailVerificationCode(data: SendEmailVerificationCodeData) {
  const res = await fetch(buildUrl('auth/verification/send'), {
    method: 'POST',
    body: JSON.stringify({
      email: data.email,
      type: data.type,
    }),
    credentials: 'include',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...authorizationHeader(data.accessToken),
    },
  })

  if (!res.ok) {
    throw await respError(res)
  }

  const { success } = await res.json()
  return success
}

export {
  refreshAccessToken,
  getUserInfo,
  getOauthAccounts,
  deleteGoogleOAuth,
  logout,
  login,
  register,
  sendEmailVerificationCode,
}
