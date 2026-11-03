'use client'

import { ChevronsLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { TopicPosts } from './topic-post'
import { Topic } from '@photoglow/shared/types/topic'
import { Post } from '@photoglow/shared/types/post'

export function ExploreTopic({
  topic,
  posts,
}: {
  topic: Topic
  posts: Post[]
}) {
  const router = useRouter()

  return (
    <div className="w-full px-4 py-8">
      <div className="mb-4 flex">
        <Button
          className="mr-2"
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ChevronsLeft className="size-5 md:size-6" />
        </Button>
        <div>
          <h2 className="mb-1 md:mb-2 text-2xl md:text-3xl font-bold">#{topic.name}</h2>
          <p className="text-muted-foreground text-sm md:text-base">{topic.description}</p>
          <p className="text-muted-foreground mt-1.5 md:mt-2 text-xs md:text-sm">
            {topic.postCount} posts
          </p>
        </div>
      </div>

      <TopicPosts initialPosts={posts} topicName={topic.name} />
    </div>
  )
}
