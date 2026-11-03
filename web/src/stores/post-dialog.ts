import { create } from 'zustand'

import type { Post } from '@photoglow/shared/types/post'

export interface PostDialogStore {
  isOpen: boolean
  // only use the key to record the history
  historys: Record<string, null>
  post: Post
  postDialog: (href?: string, post?: Post) => void
  closeDialog: (options?: { skipHistoryBack?: boolean }) => void
  setPost: (post: Post) => void
  clearPost: () => void
}

export const defaultPost = (): Post => {
  return {
    id: '',
    type: 'PHOTO',
    visibility: 'PUBLIC',
    media: [],
    cover: '',
    title: '',
    content: '',
    location: {
      id: '',
      name: '',
      city: '',
      country: '',
    },
    author: {
      id: '',
      username: '',
      displayName: '',
      avatar: '',
      status: 'ACTIVE',
      twoFactorEnabled: false,
      lastActiveAt: '',
      followersCount: 0,
      followingCount: 0,
      createdAt: '',
      updatedAt: '',
    },
    comments: undefined,
    interactions: {
      likes: {
        count: 0,
        hasLiked: false,
      },
      comments: {
        count: 0,
        hasCommented: false,
      },
      saves: { count: 0, hasSaved: false },
      shares: { count: 0, hasShared: false },
    },
    createdAt: '',
    updatedAt: '',
    score: 0,
    commentsCount: 0,
    likesCount: 0,
    savesCount: 0,
    lastActiveAt: '',
  }
}

export const usePostDialogStore = create<PostDialogStore>((set) => ({
  isOpen: false,
  historys: {},
  post: defaultPost(),
  postDialog: (href, post) => {
    if (href) {
      // record the history before we pushState
      set((state) => ({
        isOpen: true,
        historys: { ...state.historys, [href]: null },
      }))
      window.history.pushState({}, '', href)
    } else {
      set({ isOpen: true })
    }

    if (post) {
      set((state) => ({
        post: { ...state.post, ...post },
      }))
    }
  },
  closeDialog: (options = {}) => {
    // default dialog behavior is set the history back
    if (!options.skipHistoryBack) {
      window.history.back()
    }
    set({ isOpen: false })
  },
  setPost: (post: Post) => {
    set((state) => ({
      post: { ...state.post, ...post },
    }))
  },
  clearPost: () => {
    set({ post: defaultPost() })
  },
}))
