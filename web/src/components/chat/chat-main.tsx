'use client'

import type {
  ChatMessage,
  Conversation,
  ConversationPreview,
} from '@photoglow/shared/types/chat'
import type { UserWithAccessToken } from '@photoglow/shared/types/user'
import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import {
  Send,
  User as UserIcon,
  Plus,
  LogIn,
  ChevronLeft,
  ChevronDown,
} from 'lucide-react'
import Link from 'next/link'
import { formatTime } from '@/lib/date'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Search } from '@/components/search/search'
import type { User } from '@photoglow/shared/types/user'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { AuthButton } from '@/components/auth/auth-button'
import { useSocket } from '@/hooks/use-socket'
import { useNotificationsStore } from '@/stores/notifications'

type ChatMainProps = {
  authData: UserWithAccessToken
  initialData: {
    conversations: ConversationPreview[]
    activeConversation?: Conversation
  }
  selectedUserId?: string
}

// Helper functions
const getInitials = (name: string) => {
  return name.substring(0, 2).toUpperCase()
}

// Types
type ChatState = {
  conversations: ConversationPreview[]
  selectedConversation: Conversation | null
  messages: ChatMessage[]
  lastReadPositions: Record<string, string>
}

export function ChatMain({
  authData,
  initialData,
  selectedUserId,
}: ChatMainProps) {
  const router = useRouter()
  const { socket, isConnected, lastError } = useSocket(authData.accessToken)

  // State
  const [state, setState] = useState<ChatState>({
    conversations: initialData?.conversations || [],
    selectedConversation: initialData?.activeConversation || null,
    messages: initialData?.activeConversation?.messages || [],
    lastReadPositions: {},
  })

  // Computed value instead of state
  const selectedUser = state.selectedConversation?.participants[0] || null

  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [newChatOpen, setNewChatOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const messageContainerRef = useRef<HTMLDivElement>(null)

  const { subUnreadCount } = useNotificationsStore()

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    const container = messageContainerRef.current
    if (container) {
      // Ensure complete scroll to bottom
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight
      })
    }
  }, [])

  // Check if near bottom
  const isNearBottom = useCallback(() => {
    const container = messageContainerRef.current
    if (!container) return true

    const threshold = 100 // pixels from bottom
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight
    return distanceFromBottom < threshold
  }, [])

  // Handle scroll event
  const handleScroll = useCallback(() => {
    setShowScrollToBottom(!isNearBottom())
  }, [isNearBottom])

  // Listen for scroll events
  useEffect(() => {
    const container = messageContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // Initialize scroll position
  useEffect(() => {
    scrollToBottom()
  }, [state.selectedConversation?.id])

  // Mark messages as read
  const markMessagesAsRead = async (messageIds: string[]) => {
    if (!messageIds.length) return

    try {
      await api.markMessagesAsRead(authData.accessToken, messageIds)

      // Update local message state
      setState((prev) => ({
        ...prev,
        messages: prev.messages.map((message) => ({
          ...message,
          read: messageIds.includes(message.id) ? true : message.read,
        })),
        conversations: prev.conversations.map((conv) => ({
          ...conv,
          unreadCount:
            conv.id === state.selectedConversation?.id ? 0 : conv.unreadCount,
        })),
      }))

      // set store
      subUnreadCount(messageIds.length)
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  // Mark messages as read when switching conversations
  useEffect(() => {
    if (state.selectedConversation) {
      const unreadMessages = state.messages
        .filter(
          (message) => !message.read && message.sender.id !== authData.user.id
        )
        .map((message) => message.id)

      if (unreadMessages.length) {
        markMessagesAsRead(unreadMessages)
      }
    }
  }, [state.selectedConversation])

  // Socket event handlers
  useEffect(() => {
    if (!socket) return

    // Listen for new messages
    socket.on('new_message', (message: ChatMessage) => {
      if (message.conversationId === state.selectedConversation?.id) {
        const wasAtBottom = isNearBottom()

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, message],
        }))

        // Scroll to bottom if at bottom or message is from current user
        if (wasAtBottom || message.sender.id === authData.user.id) {
          setTimeout(scrollToBottom, 0)
        } else {
          setShowScrollToBottom(true)
        }

        // Mark message as read if it's from others and viewing conversation
        if (message.sender.id !== authData.user.id) {
          markMessagesAsRead([message.id])
        }
      }

      // Update conversations list
      setState((prev) => ({
        ...prev,
        conversations: prev.conversations.map((conv) => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              lastMessage: message,
              updatedAt: message.createdAt,
              unreadCount:
                conv.id === state.selectedConversation?.id
                  ? 0
                  : conv.unreadCount + 1,
            }
          }
          return conv
        }),
      }))
    })

    // Listen for message status updates (read status)
    socket.on(
      'message_status_update',
      (data: { messageIds: string[]; read: boolean }) => {
        setState((prev) => ({
          ...prev,
          messages: prev.messages.map((message) => ({
            ...message,
            read: data.messageIds.includes(message.id)
              ? data.read
              : message.read,
          })),
        }))
      }
    )

    // Handle reconnection
    socket.on('connect', () => {
      console.log('Socket reconnected')
      // Rejoin conversation room if needed
      if (state.selectedConversation?.id) {
        socket.emit('join_conversation', {
          conversationId: state.selectedConversation.id,
        })
      }
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    // Keep-alive ping
    const pingInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('ping')
      }
    }, 30000) // Send ping every 30 seconds

    return () => {
      socket.off('new_message')
      socket.off('message_status_update')
      socket.off('connect')
      socket.off('disconnect')
      socket.off('connect_error')
      clearInterval(pingInterval)
    }
  }, [
    socket,
    state.selectedConversation?.id,
    authData.user.id,
    isNearBottom,
    scrollToBottom,
  ])

  // Join conversation room
  useEffect(() => {
    if (!socket || !state.selectedConversation?.id) return

    // Join current conversation room
    socket.emit('join_conversation', {
      conversationId: state.selectedConversation.id,
    })

    // Cleanup on leave
    return () => {
      if (socket.connected) {
        socket.emit('leave_conversation', {
          conversationId: state.selectedConversation?.id,
        })
      }
    }
  }, [socket, state.selectedConversation?.id])

  // Modified send message function to use API instead of socket
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setLoading(true)
    try {
      let conversationId = state.selectedConversation?.id

      // Create new conversation
      if (!conversationId && selectedUser) {
        conversationId = await api.createConversation(
          authData.accessToken,
          selectedUser.id,
          newMessage
        )

        await fetchConversationData({ conversationId })
        router.push(`/chat?conversationId=${conversationId}`, { scroll: false })
        setNewMessage('')
        return
      }

      if (!conversationId) return

      // Send message through API
      const message = await api.sendMessage(
        authData.accessToken,
        conversationId,
        newMessage
      )

      // !! prevent duplicate message display
      // Optimistically update UI
      /* setState((prev) => ({
        ...prev,
        messages: [...prev.messages, message],
      })) */

      setNewMessage('')
      scrollToBottom()
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserSelect = async (user: User) => {
    if (user.id === authData.user.id) return

    setNewChatOpen(false)
    setLoading(true)

    try {
      await fetchConversationData({ targetUserId: user.id })
      router.push(`/chat?userId=${user.id}`, { scroll: false })
    } catch (error) {
      console.error('Error selecting user:', error)
    } finally {
      setLoading(false)
    }
  }

  // API interaction functions
  const fetchConversationData = async (options: {
    conversationId?: string
    targetUserId?: string
  }) => {
    try {
      const data = await api.getUserConversations(authData.accessToken, {
        ...options,
        includeMessages: true,
      })
      if (data.activeConversation) {
        setState((prev) => ({
          ...prev,
          selectedConversation: data.activeConversation ?? null,
          messages: data.activeConversation?.messages ?? [],
          ...(data.conversations && { conversations: data.conversations }),
        }))
      }

      return data
    } catch (error) {
      console.error('Error fetching conversation data:', error)
      return null
    }
  }

  const fetchConversations = async () => {
    try {
      const data = await api.getUserConversations(authData.accessToken)
      setState((prev) => ({
        ...prev,
        conversations: data.conversations,
        ...(data.activeConversation && {
          selectedConversation: data.activeConversation,
          messages: data.activeConversation.messages,
        }),
      }))
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  const handleSelectConversation = async (
    conversation: ConversationPreview
  ) => {
    setLoading(true)
    try {
      await fetchConversationData({ conversationId: conversation.id })
      router.push(`/chat?conversationId=${conversation.id}`, { scroll: false })
    } catch (error) {
      console.error('Error selecting conversation:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!initialData.conversations && !selectedUserId) {
      fetchConversations()
    }
  }, [])

  // Render helpers
  const renderConversationList = () => (
    <div
      className={cn(
        'border-border flex h-full w-full flex-col border-b lg:w-80 lg:border-r lg:border-b-0',
        selectedUser && 'hidden lg:block'
      )}
    >
      <div className="flex h-full flex-1 flex-col">
        <div className="border-border flex h-16 shrink-0 items-center gap-3 border-b px-4">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
            <DialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="ml-auto"
                title="New Message"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="flex h-full max-h-[800px] flex-col sm:max-w-[500px] md:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>New Message</DialogTitle>
                <DialogDescription>
                  Search for users to start a conversation
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 py-4">
                <Search
                  placeholder="Search for users..."
                  onSelectItem={(item) => {
                    if (item.type === 'user') {
                      handleUserSelect(item as unknown as User)
                    }
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative flex-1">
          <div className="absolute inset-0 overflow-y-auto">
            {state.conversations.length === 0 ? (
              <div className="text-muted-foreground flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-muted mb-4 rounded-full p-4">
                  <UserIcon className="h-6 w-6" />
                </div>
                <p className="font-medium">No conversations yet</p>
                <p className="text-muted-foreground mt-2 text-sm">
                  Start a new conversation
                </p>
              </div>
            ) : (
              state.conversations.map((conversation, index) => (
                <div
                  key={`conversation-${index}`}
                  className={cn(
                    'hover:bg-accent/50 cursor-pointer border-b p-3 transition-all',
                    state.selectedConversation?.id === conversation.id &&
                      'bg-accent',
                    conversation.unreadCount > 0 &&
                      'border-l-primary border-l-4'
                  )}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={conversation.participants[0]?.avatar}
                        alt={conversation.participants[0]?.displayName}
                      />
                      <AvatarFallback>
                        {getInitials(
                          conversation.participants[0]?.displayName || 'User'
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate font-medium">
                          {conversation.participants[0]?.displayName}
                        </span>
                        <span
                          className="text-muted-foreground text-xs"
                          suppressHydrationWarning
                        >
                          {conversation.lastMessage
                            ? formatTime(conversation.lastMessage.createdAt)
                            : formatTime(conversation.updatedAt)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-muted-foreground truncate text-sm">
                          {conversation.lastMessage?.content ||
                            'No messages yet'}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-primary text-primary-foreground ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderMessageArea = () => (
    <div
      className={cn(
        'flex h-full flex-1 flex-col',
        !selectedUser && 'hidden lg:flex'
      )}
    >
      {selectedUser ? (
        <>
          {/* Header with back button on mobile */}
          <div className="border-border flex h-16 shrink-0 items-center gap-3 border-b px-4">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 lg:hidden"
              onClick={() =>
                setState((prev) => ({ ...prev, selectedConversation: null }))
              }
            >
              <ChevronLeft />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={selectedUser?.avatar}
                alt={selectedUser?.displayName}
              />
              <AvatarFallback>
                {getInitials(selectedUser?.displayName || 'User')}
              </AvatarFallback>
            </Avatar>
            <div>
              <Link
                href={`/@${selectedUser.username}`}
                className="font-medium hover:underline"
              >
                {selectedUser?.displayName}
              </Link>
              <p className="text-muted-foreground text-xs">
                @{selectedUser?.username}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="relative flex-1">
            <div
              ref={messageContainerRef}
              className="absolute inset-0 overflow-y-auto px-4"
              data-messages-container
            >
              {state.messages.length === 0 ? (
                <div className="text-muted-foreground flex h-full flex-col items-center justify-center text-center">
                  <div className="bg-muted mb-4 rounded-full p-4">
                    <UserIcon className="h-6 w-6" />
                  </div>
                  <p className="font-medium">Start a conversation</p>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Send your first message to {selectedUser.displayName}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 py-4">
                  {state.messages.map((message) => (
                    <div
                      key={message.id}
                      id={`message-${message.id}`}
                      data-message-id={message.id}
                      className={`flex ${
                        message.sender.id === authData.user.id
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={cn(
                          'max-w-[85%] rounded-2xl px-4 py-2 transition-colors sm:max-w-[70%]',
                          message.sender.id === authData.user.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-accent hover:bg-accent/90'
                        )}
                      >
                        <p className="text-sm break-words">{message.content}</p>
                        <div
                          suppressHydrationWarning
                          className={cn(
                            'mt-1 flex items-center gap-2 text-xs',
                            message.sender.id === authData.user.id
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground'
                          )}
                        >
                          {formatTime(message.createdAt)}
                          {message.sender.id !== authData.user.id &&
                            message.read && <span>• Read</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* New Message Indicator */}
            {showScrollToBottom && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-full shadow-lg"
                  onClick={scrollToBottom}
                >
                  <ChevronDown className="mr-1 h-4 w-4" />
                  New Messages
                </Button>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-border shrink-0 border-t p-4">
            <div className="flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="max-h-[120px] min-h-[44px] resize-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading || !newMessage.trim()}
                size="icon"
                className="h-11 w-11"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-muted-foreground flex h-full flex-col items-center justify-center p-4 text-center">
          <div className="bg-muted mb-4 rounded-full p-4">
            <UserIcon className="h-6 w-6" />
          </div>
          <h2 className="text-foreground text-lg font-semibold">
            Your Messages
          </h2>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm">
            Select a conversation or start a new one
          </p>
          <Button
            onClick={() => setNewChatOpen(true)}
            variant="outline"
            className="mt-4"
          >
            <Plus className="mr-2 h-4 w-4" /> New Message
          </Button>
        </div>
      )}
    </div>
  )

  if (!authData.accessToken) {
    return <NotLoggedIn />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mx-auto max-w-4xl overflow-hidden p-0">
        <div className="flex h-[80vh] flex-col lg:h-[70vh] lg:flex-row">
          {renderConversationList()}
          {renderMessageArea()}
        </div>
      </Card>
    </div>
  )
}

function NotLoggedIn() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 px-4 text-center">
      <h1 className="text-2xl font-bold">Start Chatting</h1>
      <p className="text-muted-foreground max-w-md">
        Sign in to start conversations with other users
      </p>
      <Button asChild>
        <AuthButton>
          <LogIn className="mr-2 h-4 w-4" />
          Sign In
        </AuthButton>
      </Button>
    </div>
  )
}
