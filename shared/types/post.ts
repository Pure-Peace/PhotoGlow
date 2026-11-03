import type { Prisma } from '@photoglow/database'
import type { User } from './user'

export const PostType = {
  PHOTO: 'PHOTO',
  VIDEO: 'VIDEO',
  ARTICLE: 'ARTICLE',
} as const

export const PostVisibility = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
  FOLLOWERS: 'FOLLOWERS',
} as const

export type PostType = (typeof PostType)[keyof typeof PostType]
export type PostVisibility =
  (typeof PostVisibility)[keyof typeof PostVisibility]

export type MediaType = 'image' | 'video'

export type PostListType = 'posts' | 'saved' | 'liked'

export interface Media {
  id: string
  postId: string
  url: string
  type: MediaType
  alt?: string | null
  order?: number
}

export interface Location {
  id: string
  name: string
  city: string
  country: string
}

export interface Topic {
  id: string
  name: string
  description?: string
}

export interface Tag {
  id: string
  name: string
  type: string
}

export type PostWithAuthor = Prisma.PostGetPayload<{
  include: {
    author: true
    media: true
  }
}>

export interface InteractionData {
  likes: {
    count: number
    hasLiked: boolean
  }
  saves: {
    count: number
    hasSaved: boolean
  }
  comments: {
    count: number
    hasCommented: boolean
  }
  shares: {
    count: number
    hasShared: boolean
  }
}

export interface PostMetadata {
  id: string
  title: string
  type: PostType
  visibility: PostVisibility
  cover?: string
  author: User
  createdAt: string
  updatedAt: string
}

export interface Post extends PostMetadata {
  media: Media[]
  interactions: InteractionData
  comments?: CommentData[]
  content?: string
  location?: {
    id: string
    name: string
    city: string
    country: string
  }
  score: number
  commentsCount: number
  likesCount: number
  savesCount: number
  lastActiveAt: string
  topics?: { id: string; name: string }[]
  tags?: { id: string; name: string; type: string }[]
}

export interface CommentData {
  id: string
  content: string
  author: User
  createdAt: string
  likes: number
  repliesCount: number
  hasLiked: boolean
  parentId: string | null
  replyTo: string | null
  level: number
}
