'use client'

import { useEffect, useRef } from 'react'

export function useGlobalWebSocket(onMessage) {
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('taskflow_token')
    if (!token) return

    const WS_URL = process.env.NEXT_PUBLIC_WS_URL
    const ws = new WebSocket(`${WS_URL}?token=${token}`)

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        onMessageRef.current?.(msg)
      } catch {}
    }

    ws.onerror = () => {}

    return () => {
      if (ws.readyState === WebSocket.OPEN) ws.close()
    }
  }, [])
}
