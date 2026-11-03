import type { User } from './user'

export type ConversationPreview = {
  id: string
  participants: User[]
  participantsCount: number
  lastMessage: ChatMessage | null
  unreadCount: number
  lastMessageAt: string
  updatedAt: string
}

export type Conversation = {
  id: string
  participants: User[]
  participantsCount: number
  messages: ChatMessage[]
  lastMessageAt: string
  createdAt: string
  updatedAt: string
}

export type ChatMessage = {
  id: string
  content: string
  sender: User
  conversationId: string
  read: boolean
  createdAt: string
}

export type NewMessageData = {
  content: string
  conversationId?: string
  recipientId?: string
}
