'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { JSX } from 'react'
import {
  Camera,
  Coffee,
  Flame,
  Mountain,
  Palmtree,
  Shapes,
  Sparkles,
  Tv,
  Users,
  Utensils,
  Music,
  HeartHandshake,
  Shirt,
  Gamepad2,
  Book,
  Hash,
  Compass,
} from 'lucide-react'
import type { Topic } from '@photoglow/shared/types/topic'

const iconClassName = 'mr-2 h-4 w-4'

// Icon mapping for topics
const topicIcons: Record<string, JSX.Element> = {
  trending: <Flame className={iconClassName} />,
  photography: <Camera className={iconClassName} />,
  nature: <Mountain className={iconClassName} />,
  travel: <Palmtree className={iconClassName} />,
  food: <Utensils className={iconClassName} />,
  lifestyle: <Coffee className={iconClassName} />,
  creative: <Sparkles className={iconClassName} />,
  entertainment: <Tv className={iconClassName} />,
  people: <Users className={iconClassName} />,
  art: <Shapes className={iconClassName} />,
  music: <Music className={iconClassName} />,
  community: <HeartHandshake className={iconClassName} />,
  fashion: <Shirt className={iconClassName} />,
  gaming: <Gamepad2 className={iconClassName} />,
  education: <Book className={iconClassName} />,
}

interface ExplorePageProps {
  initialTopics: Topic[] | null
}

export function ExplorePage({ initialTopics }: ExplorePageProps) {
  const router = useRouter()

  if (!initialTopics || initialTopics.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 px-4 text-center">
        <div className="bg-muted rounded-full p-4">
          <Compass className="text-muted-foreground h-8 w-8" />
        </div>
        <h3 className="text-lg font-medium">No Topics Found</h3>
        <p className="text-muted-foreground text-sm">
          We couldn&apos;t find any topics at the moment. Please check back
          later.
        </p>
      </div>
    )
  }

  const handleTopicClick = (topicName: string) => {
    router.push(`/explore/${topicName}`)
  }

  // Group topics by popularity
  const popularTopics = initialTopics.slice(0, 5)
  const otherTopics = initialTopics.slice(5)

  const getTopicIcon = (topicName: string) => {
    const normalizedName = topicName.toLowerCase()
    return topicIcons[normalizedName] || <Hash className="mr-2 h-4 w-4" />
  }

  return (
    <div className="min-h-full pt-4 pb-6 md:pt-6">
      <div className="mb-6 px-4">
        <h1 className="text-xl font-bold md:text-2xl">Explore</h1>
        <p className="text-muted-foreground text-sm">
          Discover trending topics and content from around the world
        </p>
      </div>

      <div className="space-y-8 px-4">
        {/* Popular Topics */}
        <div className="space-y-4">
          <h2 className="text-md font-medium md:text-lg">Popular Topics</h2>
          <div className="flex flex-wrap gap-2">
            {popularTopics.map((topic) => (
              <Button
                key={topic.id}
                variant="outline"
                size="sm"
                onClick={() => handleTopicClick(topic.name)}
                className="bg-background flex items-center rounded-full text-xs md:text-sm"
              >
                {getTopicIcon(topic.name)}
                {topic.name}
                <span className="text-muted-foreground ml-2 text-xs">
                  {topic.postCount} posts
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* All Topics */}
        <div className="space-y-4">
          <h2 className="text-md font-medium md:text-lg">All Topics</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {otherTopics.length > 0 ? (
              otherTopics.map((topic) => (
                <Button
                  key={topic.id}
                  variant="outline"
                  className="h-16 justify-start text-left rounded-full"
                  size="lg"
                  onClick={() => handleTopicClick(topic.name)}
                >
                  {getTopicIcon(topic.name)}
                  <div className="flex flex-col items-start">
                    <span>{topic.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {topic.postCount} posts
                    </span>
                  </div>
                </Button>
              ))
            ) : (
              <div className="text-muted-foreground text-sm">
                No other topics found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
