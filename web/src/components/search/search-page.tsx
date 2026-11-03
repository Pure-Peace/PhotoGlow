'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Search, Hash } from 'lucide-react'
import Link from 'next/link'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { api } from '@/api'
import { debounce } from '@/lib/utils'
import { PostCard } from '@/components/post/post-card'
import { UserAvatar } from '@/components/ui/user-avatar'
import { Skeleton } from '@/components/ui/skeleton'
import type { Post } from '@photoglow/shared/types/post'
import type {
  SearchState,
  SearchResultTopic,
} from '@photoglow/shared/types/search'
import { useAuthStore } from '@/stores/auth'

interface SearchPageProps {
  initialResults: SearchState | null
}

const UserSkeleton = () => (
  <div className="hover:bg-muted/50 flex items-center gap-4 rounded-lg p-4 transition-colors">
    <Skeleton className="size-12 rounded-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
)

const PostSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="aspect-square w-full rounded-lg" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  </div>
)

const TopicSkeleton = () => (
  <div className="hover:bg-muted/50 flex items-center gap-4 rounded-lg p-4 transition-colors">
    <Skeleton className="h-10 w-10 rounded-lg" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-36" />
    </div>
  </div>
)

function TopicCard({ topic }: { topic: SearchResultTopic }) {
  return (
    <Link
      href={`/explore/${topic.name}`}
      className="hover:bg-muted/50 flex items-center gap-3 rounded-lg p-3 transition-colors sm:gap-4 sm:p-4"
    >
      <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
        <Hash className="text-primary h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-medium sm:text-base">#{topic.name}</p>
        <p className="text-muted-foreground line-clamp-1 text-xs sm:text-sm">
          {topic.description || `Posts tagged with #${topic.name}`}
        </p>
        <p className="text-muted-foreground text-xs">
          {topic.postCount} {topic.postCount === 1 ? 'post' : 'posts'}
        </p>
      </div>
    </Link>
  )
}

export function SearchPage({ initialResults }: SearchPageProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { accessToken } = useAuthStore()
  const initialQuery = searchParams.get('q') || ''

  const [searchState, setSearchState] = useState<SearchState>({
    query: initialQuery,
    posts: initialResults?.posts || [],
    users: initialResults?.users || [],
    topics: initialResults?.topics || [],
    loading: false,
    hasSearched: !!initialResults,
  })

  const updateSearchParams = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (query.trim()) {
        params.set('q', query.trim())
      } else {
        params.delete('q')
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  // Debounce search to prevent too many API calls
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.trim().length === 0) {
        setSearchState((prev) => ({
          ...prev,
          posts: [],
          users: [],
          topics: [],
          loading: false,
          hasSearched: false,
        }))
        updateSearchParams('')
        return
      }

      setSearchState((prev) => ({ ...prev, loading: true }))
      updateSearchParams(query)

      try {
        const { posts, users, topics } = await api.search(
          query,
          accessToken || undefined
        )

        setSearchState((prev) => ({
          ...prev,
          posts: posts,
          users: users,
          topics: topics,
          loading: false,
          hasSearched: true,
        }))
      } catch (error) {
        console.error('Search error:', error)
        setSearchState((prev) => ({
          ...prev,
          loading: false,
          hasSearched: true,
        }))
      }
    }, 300),
    [accessToken, updateSearchParams]
  )

  useEffect(() => {
    if (initialQuery && !initialResults) {
      debouncedSearch(initialQuery)
    }
  }, [initialQuery, debouncedSearch, initialResults])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchState.query.trim()) {
      debouncedSearch(searchState.query)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setSearchState((prev) => ({ ...prev, query: newQuery }))
    debouncedSearch(newQuery)
  }

  const { query, posts, users, topics, loading, hasSearched } = searchState
  const validPosts = posts.filter((post) => post !== null) as unknown as Post[]

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      {/* Title Section */}
      <div className="mb-6 px-4 text-center sm:mb-12 sm:px-0">
        <h1 className="mb-2 text-2xl font-bold sm:mb-4 sm:text-4xl">
          Search PostGlow
        </h1>
        <p className="text-muted-foreground text-sm sm:text-lg">
          Discover amazing photos, talented creators, and more
        </p>
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleSubmit}
        className="mx-auto mb-6 max-w-2xl px-4 sm:mb-12 sm:px-0"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
          <div className="relative flex-1">
            <Input
              type="search"
              placeholder="Search photos, people or tags..."
              className="bg-muted/50 h-11 w-full rounded-full border-none px-4 text-sm sm:h-12 sm:text-base"
              value={query}
              onChange={handleSearchChange}
              required
            />
          </div>
          <Button
            type="submit"
            className="h-11 w-full rounded-full sm:h-12 sm:w-auto"
            size="lg"
            disabled={loading}
          >
            <Search
              className={`${loading ? 'animate-spin' : ''} size-4 sm:size-5`}
            />
            <span className="ml-2 text-sm">
              {loading ? 'Searching...' : 'Search'}
            </span>
          </Button>
        </div>
      </form>

      {/* Search Results */}
      {loading ? (
        <div className="space-y-8 sm:space-y-12">
          {/* Topics Loading Skeleton */}
          <section>
            <h2 className="mb-4 text-xl font-semibold sm:mb-6 sm:text-2xl">
              Topics
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {Array(2)
                .fill(0)
                .map((_, i) => (
                  <TopicSkeleton key={i} />
                ))}
            </div>
          </section>

          {/* Users Loading Skeleton */}
          <section>
            <h2 className="mb-4 text-xl font-semibold sm:mb-6 sm:text-2xl">
              People
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {Array(2)
                .fill(0)
                .map((_, i) => (
                  <UserSkeleton key={i} />
                ))}
            </div>
          </section>

          {/* Posts Loading Skeleton */}
          <section>
            <h2 className="mb-4 text-xl font-semibold sm:mb-6 sm:text-2xl">
              Posts
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {Array(2)
                .fill(0)
                .map((_, i) => (
                  <PostSkeleton key={i} />
                ))}
            </div>
          </section>
        </div>
      ) : validPosts.length > 0 || users.length > 0 || topics.length > 0 ? (
        <div className="space-y-8 sm:space-y-12">
          {/* Topics Section */}
          {topics.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-semibold sm:mb-6 sm:text-2xl">
                Topics ({topics.length})
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                {topics.map((topic) => (
                  <TopicCard key={topic.id} topic={topic} />
                ))}
              </div>
            </section>
          )}

          {/* Users Section */}
          {users.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-semibold sm:mb-6 sm:text-2xl">
                People ({users.length})
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                {users.map((user) => (
                  <Link
                    key={user.id}
                    href={`/@${user.username}`}
                    className="hover:bg-muted/50 flex items-center gap-3 rounded-lg p-3 transition-colors sm:gap-4 sm:p-4"
                  >
                    <UserAvatar
                      name={user.displayName}
                      avatar={user.avatar}
                      className="size-10 sm:size-12"
                    />
                    <div>
                      <p className="text-sm font-medium sm:text-base">
                        {user.displayName}
                      </p>
                      <p className="text-muted-foreground text-xs sm:text-sm">
                        @{user.username}
                      </p>
                      <p className="text-muted-foreground text-xs sm:text-sm">
                        {user.followersCount} followers · {user.followingCount}{' '}
                        following
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Posts Section */}
          {validPosts.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-semibold sm:mb-6 sm:text-2xl">
                Posts ({validPosts.length})
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                {validPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : hasSearched && query ? (
        <EmptyState />
      ) : null}
    </div>
  )
}

export function EmptyState() {
  return (
    <div className="mt-20 flex h-32 flex-col items-center justify-center space-y-4 px-4 text-center sm:h-40">
      <div className="bg-muted/30 flex h-16 w-16 items-center justify-center rounded-full">
        <Search className="size-12" />
      </div>
      <div className="space-y-1">
        <p className="text-base font-medium sm:text-lg">No results found</p>
        <p className="text-muted-foreground">Try adjusting your search terms</p>
      </div>
    </div>
  )
}
