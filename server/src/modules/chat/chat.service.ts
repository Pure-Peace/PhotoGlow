import { Injectable, Logger, NotFoundException } from '@nestjs/common'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { sanitizeUser } from '@/common/utils/common'

import { ChatGateway } from './chat.gateway'
import { UserStatus } from '@photoglow/database'

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name)

  constructor(
    private prisma: PrismaService,
    private chatGateway: ChatGateway
  ) {}

  async getConversation(userId: string, conversationId: string): Promise<any> {
    // Check if conversation exists and user is a participant
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        participants: true,
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            sender: true,
          },
        },
      },
    })

    if (!conversation) {
      throw new NotFoundException('Conversation not found')
    }

    // Get the other participants (not the current user)
    const otherParticipants = conversation.participants.filter(
      (p) => p.id !== userId
    )

    // Format messages
    const messages = await this.prisma.message.findMany({
      where: {
        conversationId,
        conversation: {
          participants: {
            some: {
              id: userId,
            },
          },
        },
      },
      include: {
        sender: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Format messages
    const formattedMessages = messages.map((message) => ({
      id: message.id,
      content: message.content,
      sender: sanitizeUser(message.sender),
      conversationId: message.conversationId,
      read: message.read,
      createdAt: message.createdAt.toISOString(),
    }))

    return {
      id: conversation.id,
      participants: otherParticipants.map((user) => sanitizeUser(user)),
      messages: formattedMessages,
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
    }
  }

  async getUserConversations(
    userId: string,
    options?: {
      targetUserId?: string
      conversationId?: string
      includeMessages?: boolean
    }
  ): Promise<{
    conversations: any[]
    activeConversation?: any
  }> {
    // Get all conversations where the user is a participant
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        participants: true,
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    })

    // Format the conversations for the response
    const formattedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        // Get unread count for this user
        const unreadCount = await this.prisma.message.count({
          where: {
            conversationId: conversation.id,
            senderId: { not: userId },
            read: false,
          },
        })

        // Get the other participants (not the current user)
        const otherParticipants = conversation.participants.filter(
          (p) => p.id !== userId
        )

        // Get the last message
        const lastMessage = conversation.messages[0] || null

        return {
          id: conversation.id,
          participants: otherParticipants.map((user) => sanitizeUser(user)),
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                createdAt: lastMessage.createdAt.toISOString(),
                senderId: lastMessage.senderId,
              }
            : null,
          unreadCount,
          createdAt: conversation.createdAt.toISOString(),
          updatedAt: conversation.updatedAt.toISOString(),
        }
      })
    )

    let activeConversation: any = null

    // If conversationId is provided, get the full conversation with messages
    if (options?.conversationId) {
      const conversation = await this.prisma.conversation.findFirst({
        where: {
          id: options.conversationId,
          participants: {
            some: {
              id: userId,
            },
          },
        },
        include: {
          participants: true,
          messages: {
            orderBy: {
              createdAt: 'asc',
            },
            take: 1,
          },
        },
      })

      if (conversation) {
        // Get the other participants (not the current user)
        const otherParticipants = conversation.participants.filter(
          (p) => p.id !== userId
        )

        // Format messages
        const messages = await this.prisma.message.findMany({
          where: {
            conversationId: conversation.id,
            conversation: {
              participants: {
                some: {
                  id: userId,
                },
              },
            },
          },
          include: {
            sender: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        })

        // Format messages
        const formattedMessages = messages.map((message) => ({
          id: message.id,
          content: message.content,
          sender: sanitizeUser(message.sender),
          conversationId: message.conversationId,
          read: message.read,
          createdAt: message.createdAt.toISOString(),
        }))

        activeConversation = {
          id: conversation.id,
          participants: otherParticipants.map((user) => sanitizeUser(user)),
          messages: formattedMessages,
          createdAt: conversation.createdAt.toISOString(),
          updatedAt: conversation.updatedAt.toISOString(),
        }
      }
    }
    // If targetUserId is provided, prepare or get conversation with that user
    else if (options?.targetUserId) {
      // Check if the target user exists
      const targetUser = await this.prisma.user.findUnique({
        where: { id: options.targetUserId, status: UserStatus.ACTIVE },
      })

      if (!targetUser) {
        throw new NotFoundException('Target user not found')
      }

      // Find if there's an existing conversation with the target user
      const existingConversation = formattedConversations.find((conv) =>
        conv.participants.some((p) => p.id === options.targetUserId)
      )

      if (existingConversation) {
        // Get full conversation details
        activeConversation = await this.getConversation(
          userId,
          existingConversation.id
        )
      } else {
        // Prepare a new conversation structure
        activeConversation = {
          id: '',
          participants: [sanitizeUser(targetUser)],
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isNew: true,
        }
      }
    }

    return {
      conversations: formattedConversations,
      activeConversation,
    }
  }

  async createConversation(
    userId: string,
    participantId: string,
    initialMessage?: string
  ): Promise<string> {
    // Check if participant exists
    const participant = await this.prisma.user.findUnique({
      where: { id: participantId, status: UserStatus.ACTIVE },
    })

    if (!participant) {
      throw new NotFoundException('User not found')
    }

    // Check if conversation already exists between these users
    const existingConversation = await this.prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: {
                id: userId,
              },
            },
          },
          {
            participants: {
              some: {
                id: participantId,
              },
            },
          },
        ],
      },
    })

    if (existingConversation) {
      // If initial message is provided, add it to the existing conversation
      if (initialMessage) {
        await this.prisma.message.create({
          data: {
            content: initialMessage,
            senderId: userId,
            conversationId: existingConversation.id,
          },
        })

        // Update the conversation's lastMessageAt
        await this.prisma.conversation.update({
          where: { id: existingConversation.id },
          data: { lastMessageAt: new Date() },
        })
      }

      return existingConversation.id
    }

    // Create a new conversation
    const conversation = await this.prisma.conversation.create({
      data: {
        participants: {
          connect: [{ id: userId }, { id: participantId }],
        },
      },
    })

    // If initial message is provided, add it
    if (initialMessage) {
      await this.prisma.message.create({
        data: {
          content: initialMessage,
          senderId: userId,
          conversationId: conversation.id,
        },
      })
    }

    return conversation.id
  }

  async sendMessage(
    userId: string,
    conversationId: string,
    content: string,
    options: {
      broadcast?: boolean // Whether to broadcast WebSocket message
    } = { broadcast: true }
  ): Promise<any> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: { where: { status: UserStatus.ACTIVE } },
      },
    })

    if (!conversation) {
      throw new Error('Conversation not found')
    }

    // Create message with sender information
    const message = await this.prisma.message.create({
      data: {
        content,
        senderId: userId,
        conversationId,
      },
      include: {
        sender: true,
      },
    })

    // Update conversation's last message timestamp
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    })

    // Create chat notifications for all other participants
    const otherParticipants = conversation.participants.filter(
      (p) => p.id !== userId
    )

    for (const participant of otherParticipants) {
      await this.prisma.notification.create({
        data: {
          type: 'chat',
          actorId: userId,
          targetUserId: participant.id,
          message: content.length > 50 ? content.slice(0, 47) + '...' : content,
          targetType: 'chat',
          read: false,
        },
      })
    }

    // Broadcast WebSocket message if needed
    if (options.broadcast) {
      const conversationRoom = `conversation:${conversation.id}`
      this.chatGateway.server.to(conversationRoom).emit('new_message', {
        ...message,
        sender: sanitizeUser(message.sender),
      })
    }

    return {
      ...message,
      sender: sanitizeUser(message.sender),
    }
  }

  async markMessagesAsRead(
    userId: string,
    messageIds: string[]
  ): Promise<boolean> {
    // Ensure all messages belong to conversations where the user is a participant
    const validMessages = await this.prisma.message.findMany({
      where: {
        id: { in: messageIds },
        conversation: {
          participants: {
            some: {
              id: userId,
            },
          },
        },
        senderId: { not: userId }, // Only mark messages from others as read
      },
      include: {
        sender: true,
      },
    })

    const validMessageIds = validMessages.map((m) => m.id)

    if (validMessageIds.length === 0) {
      return false
    }

    // Mark messages as read
    await this.prisma.message.updateMany({
      where: {
        id: { in: validMessageIds },
      },
      data: {
        read: true,
      },
    })

    // Mark corresponding chat notifications as read
    for (const message of validMessages) {
      await this.prisma.notification.updateMany({
        where: {
          type: 'chat',
          actorId: message.senderId,
          targetUserId: userId,
          read: false,
        },
        data: {
          read: true,
        },
      })
    }

    return true
  }
}
