import type { User } from './user'

export type NotificationType =
  | 'like'
  | 'comment'
  | 'follow'
  | 'mention'
  | 'reply'
  | 'chat'

export type NotificationTargetType = 'post' | 'comment'

export type Notification = {
  id: string
  type: NotificationType
  read: boolean
  message: string
  actor: User
  createdAt: string
  postId?: string
  commentId?: string
  targetType?: NotificationTargetType
  post?: {
    id: string
    title: string
    cover?: string
    preview?: string
  }
  commentContent?: string
}
