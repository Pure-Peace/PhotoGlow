import { ssrAuth } from '@/lib/auth'
import { api } from '@/api'
import { FollowingPage } from '@/components/following/following-page'

export async function generateMetadata() {
  return {
    title: 'Following Feed | PhotoGlow',
    description: 'See photos and videos from people you follow on PhotoGlow',
  }
}

export default async function FollowingPageWithData() {
  const authData = await ssrAuth()
  const initialPosts = authData
    ? await api.getPostList({
        accessToken: authData.accessToken,
        filter: 'following',
      })
    : null

  return <FollowingPage initialPosts={initialPosts} />
}
