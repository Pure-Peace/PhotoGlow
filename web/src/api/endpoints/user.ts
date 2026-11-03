import { ProfileData } from '@photoglow/shared/types/profile'
import { User } from '@photoglow/shared/types/user'
import { UpdateUserProfileData } from '@photoglow/shared/types/api'
import { buildUrl, authorizationHeader, respError } from '../../lib/utils'

async function getProfileDataByUsername(
  username: string,
  accessToken?: string
): Promise<ProfileData | null> {
  try {
    const res = await fetch(buildUrl(`user/${username}/profile`), {
      cache: 'no-store',
      credentials: 'include',
      headers: authorizationHeader(accessToken),
    })

    if (!res.ok) {
      if (res.status === 404) {
        return null
      }
      throw await respError(res)
    }

    return res.json()
  } catch (error) {
    console.error('Error fetching profile data:', error)
    return null
  }
}

async function updateUserProfile(
  accessToken: string,
  { avatar, username, displayName, bio }: UpdateUserProfileData
): Promise<User> {
  const submitData = new FormData()

  if (username?.trim()) {
    submitData.append('username', username.trim())
  }
  if (displayName?.trim()) {
    submitData.append('displayName', displayName.trim())
  }
  if (bio?.trim()) {
    submitData.append('bio', bio.trim())
  }

  if (avatar) {
    submitData.append('avatar', avatar, 'avatar.png')
  }

  const res = await fetch(buildUrl('user/profile'), {
    method: 'PUT',
    body: submitData,
    credentials: 'include',
    cache: 'no-store',
    headers: {
      ...authorizationHeader(accessToken),
    },
  })

  if (!res.ok) {
    throw await respError(res)
  }

  const { updatedUser } = await res.json()
  return updatedUser
}

async function deleteUser(accessToken: string) {
  const res = await fetch(buildUrl('user'), {
    method: 'DELETE',
    credentials: 'include',
    cache: 'no-store',
    headers: authorizationHeader(accessToken),
  })

  if (!res.ok) {
    throw await respError(res)
  }

  return res.json()
}

export { getProfileDataByUsername, updateUserProfile, deleteUser }
