'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { api } from '@/api'
import { Loader2, Hash } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { debounce } from '@/lib/utils'
import type {
  SearchResultUser,
  SearchResultTopic,
} from '@photoglow/shared/types/search'
import { useAuthStore } from '@/stores/auth'

interface SearchProps {
  placeholder?: string
  onSelectItem: (item: SearchResultUser | SearchResultTopic) => void
}

type SearchResult = SearchResultUser | SearchResultTopic

export function Search({
  placeholder = 'Search users or topics...',
  onSelectItem,
}: SearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { accessToken } = useAuthStore()

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Debounced search function
  const searchItems = useRef(
    debounce(async (searchQuery: string) => {
      if (!searchQuery || searchQuery.length < 2) {
        setResults([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const searchResults = await api.search(
          searchQuery,
          accessToken || undefined
        )

        // Combine users and topics
        const combinedResults: SearchResult[] = [
          ...searchResults.users.map((user) => ({
            ...user,
            type: 'user' as const,
          })),
          ...searchResults.topics.map((topic) => ({
            ...topic,
            type: 'topic' as const,
          })),
        ]

        setResults(combinedResults)
      } catch (error) {
        console.error('Error searching:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
  ).current

  // Call search when query changes
  useEffect(() => {
    searchItems(query)

    // Cleanup
    return () => {
      searchItems.cancel()
    }
  }, [query, searchItems])

  const getInitials = (name?: string) => {
    if (!name) return 'UN'
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className="relative w-full min-w-[300px] md:min-w-[400px]">
      <div className="relative">
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          className="h-11 w-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {loading && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
          </div>
        )}
      </div>

      {query.length > 1 && (
        <div className="border-border bg-card absolute z-50 mt-1 w-full rounded-md border shadow-lg">
          <ScrollArea className="max-h-[400px]">
            {results.length === 0 ? (
              <div className="text-muted-foreground p-4 text-center text-sm">
                {loading ? 'Searching...' : 'No results found'}
              </div>
            ) : (
              <div className="py-2">
                {results.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className="hover:bg-accent cursor-pointer px-6 py-3"
                    onClick={() => onSelectItem(result)}
                  >
                    {result.type === 'user' ? (
                      // User result
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={result.avatar}
                            alt={result.displayName || result.username}
                          />
                          <AvatarFallback>
                            {getInitials(result.displayName || result.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-base font-medium">
                            {result.displayName || result.username}
                          </div>
                          {result.username && (
                            <div className="text-muted-foreground text-sm">
                              @{result.username}
                            </div>
                          )}
                          <div className="text-muted-foreground text-xs">
                            {result.followersCount || 0} followers ·{' '}
                            {result.followingCount || 0} following
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Topic result
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg text-center">
                          <Hash className="text-primary h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-base font-medium">
                            #{result.name}
                          </div>
                          <div className="text-muted-foreground line-clamp-1 text-sm">
                            {result.description ||
                              `Posts tagged with #${result.name}`}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {result.postCount}{' '}
                            {result.postCount === 1 ? 'post' : 'posts'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
