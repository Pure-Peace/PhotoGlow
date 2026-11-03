import { ssrAuth } from '@/lib/auth'
import { api } from '@/api'
import { ChatMain } from '@/components/chat/chat-main'
import { redirect } from 'next/navigation'

export async function generateMetadata() {
  return {
    title: 'Chat | PhotoGlow',
    description: 'Chat with other users on PhotoGlow',
  }
}

export default async function ChatPageWithData({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; conversationId?: string }>
}) {
  const { userId, conversationId } = await searchParams

  // Get auth data
  const authData = await ssrAuth()

  if (!authData) {
    redirect('/')
  }

  // Get conversations and potentially active conversation
  const initialData = await api.getUserConversations(authData.accessToken, {
    targetUserId: userId,
    conversationId,
    includeMessages: true,
  })

  return (
    <ChatMain
      authData={authData}
      initialData={initialData}
      selectedUserId={userId}
    />
  )
}
