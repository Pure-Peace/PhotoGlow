import { api } from '@/api'
import { ExplorePage } from '@/components/explore/explore-page'

export async function generateMetadata() {
  return {
    title: 'Explore | PhotoGlow',
    description: 'Discover trending topics and content from around the world',
  }
}

export default async function ExplorePageWithData() {
  const initialTopics = await api.getPopularTopics()

  return <ExplorePage initialTopics={initialTopics} />
}
