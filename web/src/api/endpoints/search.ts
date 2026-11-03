import { buildUrl, authorizationHeader, respError } from '@/lib/utils'
import { Post } from '@photoglow/shared/types/post'
import {
  SearchResultPost,
  SearchResultUser,
  SearchResultTopic,
} from '@photoglow/shared/types/search'

// Search
async function search(
  query: string,
  accessToken?: string
): Promise<{
  posts: (SearchResultPost | null)[]
  users: SearchResultUser[]
  topics: SearchResultTopic[]
}> {
  const res = await fetch(buildUrl(`search?q=${encodeURIComponent(query)}`), {
    cache: 'no-store',
    credentials: 'include',
    headers: authorizationHeader(accessToken),
  })

  if (!res.ok) {
    throw await respError(res)
  }

  const data = await res.json()

  // Format posts for frontend use if they're null or missing properties
  const posts = Array.isArray(data.posts)
    ? data.posts.map((post: Post) => {
        if (!post) return null

        // Add required properties that might be missing
        return {
          ...post,
          interactions: post.interactions || {
            likes: {
              count: post.likesCount || 0,
              hasLiked: false,
            },
            saves: {
              count: post.savesCount || 0,
              hasSaved: false,
            },
            comments: {
              count: post.commentsCount || 0,
              hasCommented: false,
            },
            shares: {
              count: 0,
              hasShared: false,
            },
          },
          type: post.type || 'PHOTO',
          visibility: post.visibility || 'PUBLIC',
        }
      })
    : []

  // Ensure topics is an array, even if backend doesn't return it
  const topics = Array.isArray(data.topics) ? data.topics : []

  return {
    posts,
    users: Array.isArray(data.users) ? data.users : [],
    topics,
  }
}

export { search }
