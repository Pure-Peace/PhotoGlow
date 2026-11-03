import { HomePage } from '@/components/home-page'
import { api } from '@/api'
import { ssrAuth } from '@/lib/auth'

export default async function Home() {
  const auth = await ssrAuth()
  const initialPosts = await api.getPostList({
    accessToken: auth?.accessToken,
    limit: 18,
    offset: 0,
  })

  return <HomePage initialPosts={initialPosts} ssrAuth={auth} />
}
