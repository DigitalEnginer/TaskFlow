'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useBoardStore } from '@/store/boardStore'

export function useWebSocket(boardId) {
  const wsRef = useRef(null)
  const { moveCard, addCard, updateCard, deleteCard, setOnlineUsers,
          addColumn, updateColumn, deleteColumn, reorderColumns } = useBoardStore()

  useEffect(() => {
    if (!boardId) return

    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('taskflow_token')
        : null

    if (!token) return

    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}?token=${token}&boardId=${boardId}`
    )

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'JOIN_BOARD', payload: { boardId } }))
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)

        switch (msg.type) {
          case 'USERS_ONLINE':
            setOnlineUsers(msg.payload.users)
            break
          case 'CARD_MOVED':
            moveCard(msg.payload)
            break
          case 'CARD_CREATED':
            addCard(msg.payload.card)
            break
          case 'CARD_UPDATED':
            updateCard(msg.payload.card)
            break
          case 'CARD_DELETED':
            deleteCard(msg.payload)
            break
          case 'COLUMN_CREATED':
            addColumn(msg.payload.column)
            break
          case 'COLUMN_UPDATED':
            updateColumn(msg.payload.column)
            break
          case 'COLUMN_DELETED':
            deleteColumn(msg.payload.columnId)
            break
          case 'COLUMNS_REORDERED':
            reorderColumns(msg.payload.columnOrder)
            break
        }
      } catch (err) {
        console.error('WS parse error:', err)
      }
    }

    ws.onerror = () => console.warn('WS: не удалось подключиться к', process.env.NEXT_PUBLIC_WS_URL)

    wsRef.current = ws

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'LEAVE_BOARD', payload: { boardId } }))
      }
      ws.close()
    }
  }, [boardId])

  const send = useCallback((type, payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload, boardId }))
    }
  }, [boardId])

  return { send }
}
