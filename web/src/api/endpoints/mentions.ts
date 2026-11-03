import { buildUrl, authorizationHeader } from '@/lib/utils'
import { MentionUser, MentionTopic } from '@photoglow/shared/types/api'

// Mentions functions
async function searchMentionUsers(
  query: string,
  accessToken?: string
): Promise<MentionUser[]> {
  const response = await fetch(
    buildUrl(`mentions/users?query=${encodeURIComponent(query)}`),
    {
      headers: {
        ...authorizationHeader(accessToken),
      },
      credentials: 'include',
      cache: 'no-store',
    }
  )
  return response.json()
}

async function searchMentionTopics(query: string): Promise<MentionTopic[]> {
  const response = await fetch(
    buildUrl(`mentions/topics?query=${encodeURIComponent(query)}`)
  )
  return response.json()
}

export { searchMentionUsers, searchMentionTopics }
