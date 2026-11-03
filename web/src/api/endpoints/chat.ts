import { buildUrl, authorizationHeader, respError } from '@/lib/utils'
import {
  ConversationPreview,
  Conversation,
  ChatMessage,
} from '@photoglow/shared/types/chat'

// Chat functions
async function getUserConversations(
  accessToken: string,
  options?: {
    targetUserId?: string
    conversationId?: string
    includeMessages?: boolean
  }
): Promise<{
  conversations: ConversationPreview[]
  activeConversation?: Conversation
}> {
  const queryParams = new URLSearchParams()
  if (options?.targetUserId) {
    queryParams.append('targetUserId', options.targetUserId)
  }
  if (options?.conversationId) {
    queryParams.append('conversationId', options.conversationId)
  }
  if (options?.includeMessages) {
    queryParams.append('includeMessages', 'true')
  }

  const res = await fetch(
    buildUrl(
      `chat${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    ),
    {
      headers: {
        ...authorizationHeader(accessToken),
      },
      credentials: 'include',
      cache: 'no-store',
    }
  )

  if (!res.ok) {
    throw await respError(res)
  }

  return res.json()
}

async function createConversation(
  accessToken: string,
  participantId: string,
  initialMessage?: string
): Promise<string> {
  const res = await fetch(buildUrl('chat/create'), {
    method: 'POST',
    headers: {
      ...authorizationHeader(accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      participantId,
      initialMessage,
    }),
    credentials: 'include',
    cache: 'no-store',
  })

  if (!res.ok) {
    throw await respError(res)
  }

  const { conversationId } = await res.json()
  return conversationId
}

async function sendMessage(
  accessToken: string,
  conversationId: string,
  content: string
): Promise<ChatMessage> {
  const res = await fetch(buildUrl(`chat/${conversationId}/send`), {
    method: 'POST',
    headers: {
      ...authorizationHeader(accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
    credentials: 'include',
    cache: 'no-store',
  })

  if (!res.ok) {
    throw await respError(res)
  }

  return res.json()
}

async function markMessagesAsRead(
  accessToken: string,
  messageIds: string[]
): Promise<boolean> {
  const res = await fetch(buildUrl('chat/messages/read'), {
    method: 'POST',
    headers: {
      ...authorizationHeader(accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messageIds }),
    credentials: 'include',
    cache: 'no-store',
  })

  if (!res.ok) {
    throw await respError(res)
  }

  const { success } = await res.json()
  return success
}

export {
  getUserConversations,
  createConversation,
  sendMessage,
  markMessagesAsRead,
}
