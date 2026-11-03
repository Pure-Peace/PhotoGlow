import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export function useSocket(accessToken: string | null) {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastError, setLastError] = useState<Error | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  useEffect(() => {
    if (!accessToken) return

    const connectSocket = () => {
      try {
        // Initialize Socket.IO connection
        const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
          query: { token: accessToken },
          reconnection: true,
          reconnectionAttempts: maxReconnectAttempts,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
          transports: ['websocket'],
        })

        // Setup event handlers
        socket.on('connect', () => {
          console.log('Socket connected')
          setIsConnected(true)
          setLastError(null)
          reconnectAttempts.current = 0
        })

        socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error)
          setLastError(error)
          setIsConnected(false)

          // Don't reconnect if token is expired or unauthorized
          if (
            error.message === 'jwt expired' ||
            error.message === 'Unauthorized'
          ) {
            socket.disconnect()
          }
        })

        socket.on('error', (error) => {
          console.error('Socket error:', error)
          setLastError(error)
        })

        socket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason)
          setIsConnected(false)

          // Don't auto-reconnect if server initiated disconnect
          if (reason === 'io server disconnect') {
            socket.disconnect()
          }
          // Try to reconnect if attempts are under limit
          else if (reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current += 1
            socket.connect()
          }
        })

        socket.on('reconnect', (attemptNumber) => {
          console.log(`Socket reconnected after ${attemptNumber} attempts`)
        })

        socket.on('reconnect_error', (error) => {
          console.error('Socket reconnection error:', error)
          setLastError(error)
        })

        socket.on('reconnect_failed', () => {
          console.error('Socket reconnection failed')
          setLastError(new Error('Reconnection failed'))
        })

        socketRef.current = socket

        // Cleanup on unmount or token change
        return () => {
          if (socket) {
            socket.disconnect()
            socketRef.current = null
            setIsConnected(false)
            setLastError(null)
            reconnectAttempts.current = 0
          }
        }
      } catch (error) {
        console.error('Error creating socket connection:', error)
        setLastError(error as Error)
        return () => {}
      }
    }

    const cleanup = connectSocket()
    return cleanup
  }, [accessToken])

  return {
    socket: socketRef.current,
    isConnected,
    lastError,
  }
}
