import {
  WebSocketGateway,
  WebSocketServer,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  WsException,
  SubscribeMessage,
} from '@nestjs/websockets'
import { Injectable, Logger } from '@nestjs/common'
import { Server, Socket } from 'socket.io'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { siteKeys } from '@photoglow/shared/env'
import { TokenService } from '@/infra/token/token.service'

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env[siteKeys.frontendUrl],
    credentials: true,
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name)
  private readonly connectedClients = new Map<string, Socket>()

  @WebSocketServer()
  server!: Server

  constructor(
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaService
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.query.token as string
      if (!token) {
        throw new WsException('Unauthorized')
      }

      const userId = await this.tokenService.validateAccessToken(token)
      this.connectedClients.set(userId, client)
      this.logger.log(`Client connected: ${userId}`)

      // Join user's rooms (conversations)
      const conversations = await this.prisma.conversation.findMany({
        where: {
          participants: {
            some: {
              id: userId,
            },
          },
        },
      })
      conversations.forEach((conv) => {
        client.join(`conversation:${conv.id}`)
      })
    } catch (err) {
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socket] of this.connectedClients.entries()) {
      if (socket === client) {
        this.connectedClients.delete(userId)
        this.logger.log(`Client disconnected: ${userId}`)
        break
      }
    }
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    client: Socket,
    data: { conversationId: string }
  ) {
    client.join(`conversation:${data.conversationId}`)
  }

  @SubscribeMessage('leave_conversation')
  async handleLeaveConversation(
    client: Socket,
    data: { conversationId: string }
  ) {
    client.leave(`conversation:${data.conversationId}`)
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    client: Socket,
    data: { conversationId: string; content: string }
  ) {
    try {
      const token = client.handshake.query.token as string
      const userId = await this.tokenService.validateAccessToken(token)

      // Create and save the message
      const message = await this.prisma.message.create({
        data: {
          content: data.content,
          senderId: userId,
          conversationId: data.conversationId,
        },
        include: {
          sender: true,
        },
      })

      // Emit to all participants in the conversation
      this.server
        .to(`conversation:${data.conversationId}`)
        .emit('new_message', message)

      return message
    } catch (error) {
      this.logger.error('Error sending message:', error)
      throw new WsException('Failed to send message')
    }
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(client: Socket, data: { messageIds: string[] }) {
    try {
      const token = client.handshake.query.token as string
      const userId = await this.tokenService.validateAccessToken(token)

      // Update messages as read
      await this.prisma.message.updateMany({
        where: {
          id: {
            in: data.messageIds,
          },
          conversation: {
            participants: {
              some: {
                id: userId,
              },
            },
          },
        },
        data: {
          read: true,
        },
      })

      // Notify other participants
      const messages = await this.prisma.message.findMany({
        where: {
          id: {
            in: data.messageIds,
          },
        },
        include: {
          conversation: {
            include: {
              participants: true,
            },
          },
        },
      })

      messages.forEach((message) => {
        const conversationId = message.conversationId
        this.server
          .to(`conversation:${conversationId}`)
          .emit('message_status_update', {
            messageIds: data.messageIds,
            read: true,
          })
      })
    } catch (error) {
      this.logger.error('Error marking messages as read:', error)
      throw new WsException('Failed to mark messages as read')
    }
  }
}
