import { create } from 'zustand'
import { api } from '@/api'
import { UploadMediaResponse } from '@photoglow/shared/types/api'

// Define a new type for draft media
export type DraftMedia = {
  url: string
  draftId: string
  mediaType: 'image' | 'video'
  isDraft: true
}

export type UploadFormData = {
  title: string
  content: string
  media: (File | DraftMedia)[] // Can be either a File or a DraftMedia
  topics: string[]
  mentions: string[]
  location?: string
  locationId?: string
  visibility: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS'
  type?: 'PHOTO' | 'VIDEO' | 'ARTICLE'
  topicIds?: string[]
  tagIds?: string[]
}

// Add a store for tracking media draft mappings
export type MediaDraftMapping = {
  [fileId: string]: string // Maps file identifier to draft ID
}

export interface UploadStore {
  // Form data
  formData: UploadFormData
  // Loading state
  isLoading: boolean
  // Currently editing image
  editingImage: { file: File; index: number } | null
  uploadProgress: number[]
  // Media error message
  mediaError: string | null
  // Media drafts loading state
  isLoadingDrafts: boolean
  // Map to track which files came from drafts
  mediaDraftMap: MediaDraftMapping

  // Actions
  setFormData: (data: Partial<UploadFormData>) => void
  setIsLoading: (isLoading: boolean) => void
  setEditingImage: (image: { file: File; index: number } | null) => void
  setMediaError: (error: string | null) => void

  // Media actions
  addMedia: (files: File[]) => void
  removeMedia: (index: number) => void
  reorderMedia: (startIndex: number, endIndex: number) => void
  updateMedia: (index: number, file: File) => void

  // Media drafts actions
  loadMediaDrafts: (accessToken: string) => Promise<UploadMediaResponse[]>
  setMediaFromDrafts: (drafts: UploadMediaResponse[]) => void
  getDraftIdForFile: (file: File) => string | null
  // Helper to check if a media item is a draft
  isMediaDraft: (media: File | DraftMedia) => media is DraftMedia

  clearUploadProgress: () => void
  setUploadProgress: (index: number, progress: number) => void

  // Reset state
  reset: () => void
}

export const defaultFormData = (): UploadFormData => {
  return {
    title: '',
    content: '',
    media: [],
    topics: [],
    mentions: [],
    type: 'PHOTO',
    visibility: 'PUBLIC',
    topicIds: [],
    tagIds: [],
  }
}

export const useUploadStore = create<UploadStore>((set, get) => ({
  // Initial state
  formData: defaultFormData(),
  isLoading: false,
  editingImage: null,
  uploadProgress: [],
  mediaError: null,
  isLoadingDrafts: false,
  mediaDraftMap: {},

  // Form actions
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  setIsLoading: (isLoading) => set({ isLoading }),
  setEditingImage: (image) => set({ editingImage: image }),
  setMediaError: (error) => set({ mediaError: error }),

  // Media actions
  addMedia: (files) =>
    set((state) => {
      const newMedia = [...state.formData.media]
      for (const file of files) {
        if (newMedia.length < 9) {
          newMedia.push(file)
        }
      }
      return {
        formData: {
          ...state.formData,
          media: newMedia,
        },
      }
    }),

  removeMedia: (index) =>
    set((state) => {
      const newMedia = [...state.formData.media]
      const removedMedia = newMedia[index]
      newMedia.splice(index, 1)

      const newUploadProgress = [...state.uploadProgress]
      newUploadProgress.splice(index, 1)

      // For File objects, handle the draft map
      if (removedMedia instanceof File) {
        const fileId = removedMedia?.name || `file-${index}`
        const newDraftMap = { ...state.mediaDraftMap }
        if (newDraftMap[fileId]) {
          delete newDraftMap[fileId]
        }
        return {
          formData: {
            ...state.formData,
            media: newMedia,
          },
          uploadProgress: newUploadProgress,
          mediaDraftMap: newDraftMap,
        }
      }

      return {
        formData: {
          ...state.formData,
          media: newMedia,
        },
        uploadProgress: newUploadProgress,
      }
    }),

  reorderMedia: (startIndex, endIndex) =>
    set((state) => {
      const newMedia = [...state.formData.media]
      const [removed] = newMedia.splice(startIndex, 1)
      newMedia.splice(endIndex, 0, removed)
      const newUploadProgress = [...state.uploadProgress]
      newUploadProgress.splice(startIndex, 1)
      newUploadProgress.splice(endIndex, 0, state.uploadProgress[startIndex])
      return {
        formData: {
          ...state.formData,
          media: newMedia,
        },
        uploadProgress: newUploadProgress,
      }
    }),

  updateMedia: (index, file) =>
    set((state) => {
      const newMedia = [...state.formData.media]
      const oldMedia = newMedia[index]

      // Only update if the old media is a File object
      if (oldMedia instanceof File) {
        const oldFileId = oldMedia?.name || `file-${index}`

        // Update the file
        newMedia[index] = file

        // Update draft mapping if needed
        const newDraftMap = { ...state.mediaDraftMap }
        if (newDraftMap[oldFileId]) {
          const draftId = newDraftMap[oldFileId]
          delete newDraftMap[oldFileId]
          newDraftMap[file.name] = draftId
        }

        return {
          formData: {
            ...state.formData,
            media: newMedia,
          },
          mediaDraftMap: newDraftMap,
        }
      }

      return state
    }),

  // Media drafts actions
  loadMediaDrafts: async (accessToken: string) => {
    try {
      set({ isLoadingDrafts: true })
      const drafts = await api.getUserMediaDrafts(accessToken)
      return drafts
    } catch (error) {
      console.error('Failed to load media drafts:', error)
      return []
    } finally {
      set({ isLoadingDrafts: false })
    }
  },

  setMediaFromDrafts: (drafts: UploadMediaResponse[]) => {
    // Don't process if no drafts
    if (drafts.length === 0) return

    // Convert drafts to DraftMedia objects
    const draftMedia = drafts.map((draft) => ({
      url: draft.url,
      draftId: draft.draftId,
      mediaType: draft.mediaType,
      isDraft: true as const,
    }))

    set((state) => ({
      formData: {
        ...state.formData,
        media: [...state.formData.media, ...draftMedia].slice(0, 9), // Ensure we don't exceed MAX_IMAGES
      },
    }))
  },

  // Helper to get draft ID for a file
  getDraftIdForFile: (file: File) => {
    const { mediaDraftMap } = get()
    return mediaDraftMap[file.name] || null
  },

  // Helper to check if a media item is a draft
  isMediaDraft: (media): media is DraftMedia => {
    return (media as DraftMedia).isDraft === true
  },

  setUploadProgress: (index, progress) =>
    set((state) => {
      const newUploadProgress = [...state.uploadProgress]
      newUploadProgress[index] = progress
      return { uploadProgress: newUploadProgress }
    }),

  clearUploadProgress: () =>
    set(() => ({
      uploadProgress: [],
    })),

  // Reset state
  reset: () =>
    set({
      formData: defaultFormData(),
      isLoading: false,
      editingImage: null,
      uploadProgress: [],
      mediaError: null,
      mediaDraftMap: {},
    }),
}))
