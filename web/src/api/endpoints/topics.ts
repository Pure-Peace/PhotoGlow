import { buildUrl } from '@/lib/utils'

const getPopularTopics = async () => {
  const response = await fetch(buildUrl('topics/popular'))
  if (!response.ok) {
    throw new Error('Failed to fetch popular topics')
  }
  return response.json()
}

const getTopic = async (topicName: string) => {
  const response = await fetch(buildUrl(`topics/${topicName}`))
  if (!response.ok) {
    throw new Error('Failed to fetch topic')
  }
  return response.json()
}

const getTopicPosts = async (
  topicName: string,
  options: {
    offset?: number
    limit?: number
    order?: 'asc' | 'desc'
  }
) => {
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

  const response = await fetch(
    buildUrl(`topics/${topicName}/posts?${queryParams}`)
  )
  if (!response.ok) {
    throw new Error('Failed to fetch topic posts')
  }
  return response.json()
}

export { getPopularTopics, getTopic, getTopicPosts }
