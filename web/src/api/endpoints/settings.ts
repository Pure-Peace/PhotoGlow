import { UpdateUserEmailData } from '@photoglow/shared/types/api'
import { buildUrl, authorizationHeader, respError } from '../../lib/utils'

async function updateUserPassword(
  accessToken: string,
  currentPassword: string,
  newPassword: string
) {
  const res = await fetch(buildUrl('settings/password'), {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
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

async function updateUserEmail(accessToken: string, data: UpdateUserEmailData) {
  const res = await fetch(buildUrl('settings/email'), {
    method: 'PUT',
    body: JSON.stringify(data),
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

async function resetPassword(
  email: string,
  verification: string,
  password: string
): Promise<void> {
  const res = await fetch(buildUrl('settings/password/reset'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    cache: 'no-store',
    body: JSON.stringify({ email, verification, password }),
  })

  if (!res.ok) {
    throw await respError(res)
  }
}

export { updateUserPassword, updateUserEmail, resetPassword }
