import type { User } from './user'
import type { PostVisibility } from './post'

export type SearchType = 'user' | 'post' | 'topic'

export interface SearchResultItem {
  id: string
  type: SearchType
}

export interface SearchResultPost extends SearchResultItem {
  type: 'post'
  title: string
  visibility: PostVisibility
  cover: string
  author: User
  createdAt: string
  updatedAt: string
}

export interface SearchResultUser extends User, SearchResultItem {
  type: 'user'
}

export interface SearchResultTopic extends SearchResultItem {
  type: 'topic'
  name: string
  description?: string
  postCount: number
}

export interface SearchResponse {
  posts: (SearchResultPost | null)[]
  users: SearchResultUser[]
  topics: SearchResultTopic[]
}

export interface SearchState {
  query: string
  posts: (SearchResultPost | null)[]
  users: SearchResultUser[]
  topics: SearchResultTopic[]
  loading: boolean
  hasSearched: boolean
}
