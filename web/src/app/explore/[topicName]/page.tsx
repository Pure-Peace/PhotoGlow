import { Metadata } from 'next'
import { api } from '@/api'
import { Post } from '@photoglow/shared/types/post'
import { Topic } from '@photoglow/shared/types/topic'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { ExploreTopic } from '@/components/explore/explore-topic'

interface ExploreTopicPageProps {
  params: Promise<{ topicName: string }>
}

export async function generateMetadata({
  params,
}: ExploreTopicPageProps): Promise<Metadata> {
  const { topicName } = await params
  return {
    title: `#${topicName} - PhotoGlow`,
    description: `Explore photos and posts tagged with #${topicName} on PhotoGlow`,
  }
}

export default async function ExploreTopicPage({
  params,
}: ExploreTopicPageProps) {
  const { topicName } = await params
  let topic: Topic
  let posts: Post[]

  // Fetch initial topic data and posts from the server
  try {
    const res = await api.getTopicPosts(topicName, {
      offset: 0,
      limit: 18,
      order: 'desc',
    })
    topic = res.topic
    posts = res.posts
  } catch (error) {
    return <NotFound />
  }

  return <ExploreTopic topic={topic} posts={posts} />
}

export function NotFound() {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center px-4 py-16">
      <div className="mb-6 text-6xl">
        <Search className="size-12" />
      </div>
      <h1 className="mb-4 text-center text-3xl font-bold">Topic Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md text-center">
        Sorry, we couldn&apos;t find the topic you&apos;re looking for. It might
        have been removed or doesn&apos;t exist.
      </p>
      <Link
        href="/explore"
        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-6 py-2.5 text-sm font-medium transition-colors"
      >
        Explore Other Topics
      </Link>
    </div>
  )
}
