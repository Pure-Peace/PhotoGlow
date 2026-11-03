export type UpdateUserProfileData = {
  displayName?: string
  username?: string
  bio?: string
  avatar?: Blob
}

export type UpdateUserEmailData = {
  currentPassword: string
  verificationCode: string
  newEmail: string
}

// Types for upload response and progress
export type UploadProgress = {
  progress: number // 0-100
  bytesUploaded: number
  totalBytes: number
}

// Export this type to fix the linter error
export type UploadMediaResponse = {
  url: string
  draftId: string
  mediaType: 'image' | 'video'
}

export type SendEmailVerificationCodeData = {
  accessToken?: string
  email: string
  type: 'signup' | 'reset-password' | 'change-email'
}

export interface MentionUser {
  key: string
  id: string
  displayName: string
  avatar: string | null
}

export interface MentionTopic {
  key: string
  id: string
  description: string | null
}

export interface CreatePostData {
  title: string
  content?: string
  visibility: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS'
  type?: 'PHOTO' | 'VIDEO' | 'ARTICLE'
  locationId?: string
  media: Array<{
    url: string
    type: 'image' | 'video'
    alt?: string
    order?: number
    draftId?: string
  }>
  topicIds?: string[]
  tagIds?: string[]
}

export interface UpdatePostData {
  title?: string
  content?: string
  visibility?: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS'
  type?: 'PHOTO' | 'VIDEO' | 'ARTICLE'
  locationId?: string
  media?: Array<{
    url: string
    type: 'image' | 'video'
    alt?: string
    order?: number
    draftId?: string
  }>
  topicIds?: string[]
  tagIds?: string[]
}
