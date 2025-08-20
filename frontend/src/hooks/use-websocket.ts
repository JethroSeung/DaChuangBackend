'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { WebSocketMessage, WebSocketConfig } from '@/types'

interface UseWebSocketOptions extends Partial<WebSocketConfig> {
  onMessage?: (message: WebSocketMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
  enabled?: boolean
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    enabled = true,
    reconnectAttempts = 5,
    reconnectDelay = 1000,
    heartbeatInterval = 30000,
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const wsMessage: WebSocketMessage = {
        type: message.type || 'message',
        data: message.data || message,
        timestamp: new Date().toISOString(),
        id: message.id || Math.random().toString(36).substr(2, 9),
      }
      wsRef.current.send(JSON.stringify(wsMessage))
      return true
    }
    return false
  }, [])

  const startHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearInterval(heartbeatTimeoutRef.current)
    }

    heartbeatTimeoutRef.current = setInterval(() => {
      sendMessage({ type: 'ping' })
    }, heartbeatInterval)
  }, [heartbeatInterval, sendMessage])

  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearInterval(heartbeatTimeoutRef.current)
      heartbeatTimeoutRef.current = null
    }
  }, [])

  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return
    }

    try {
      setConnectionState('connecting')
      setError(null)

      wsRef.current = new WebSocket(url)

      wsRef.current.onopen = () => {
        setIsConnected(true)
        setConnectionState('connected')
        reconnectAttemptsRef.current = 0
        onConnect?.()
        startHeartbeat()
      }

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          setLastMessage(message)
          onMessage?.(message)
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
        }
      }

      wsRef.current.onclose = () => {
        setIsConnected(false)
        setConnectionState('disconnected')
        stopHeartbeat()
        onDisconnect?.()

        // Attempt to reconnect if enabled and within retry limits
        if (enabled && reconnectAttemptsRef.current < reconnectAttempts) {
          reconnectAttemptsRef.current++
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectDelay * reconnectAttemptsRef.current)
        }
      }

      wsRef.current.onerror = (event) => {
        setConnectionState('error')
        setError('WebSocket connection error')
        onError?.(event)
      }
    } catch (err) {
      setConnectionState('error')
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [url, enabled, onConnect, onMessage, onDisconnect, onError, reconnectAttempts, reconnectDelay, startHeartbeat, stopHeartbeat])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    stopHeartbeat()

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    setIsConnected(false)
    setConnectionState('disconnected')
  }, [stopHeartbeat])

  const reconnect = useCallback(() => {
    disconnect()
    reconnectAttemptsRef.current = 0
    setTimeout(connect, 100)
  }, [connect, disconnect])

  useEffect(() => {
    if (enabled) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [enabled, connect, disconnect])

  return {
    isConnected,
    connectionState,
    lastMessage,
    error,
    sendMessage,
    reconnect,
    disconnect,
  }
}
