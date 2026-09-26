import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { type AdminEvent, adminEventsUrl } from '@/api/events'
import { playersQueryKey } from '@/api/queries/players'
import { serverStatusQueryKey } from '@/api/queries/server-status'

export type AdminEventConnectionState = 'connecting' | 'connected' | 'disconnected'

export function useAdminEvents(limit = 50) {
  const queryClient = useQueryClient()
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [connectionState, setConnectionState] =
    useState<AdminEventConnectionState>('connecting')

  useEffect(() => {
    const source = new EventSource(adminEventsUrl)

    source.onopen = () => {
      setConnectionState('connected')
    }

    source.onerror = () => {
      setConnectionState('disconnected')
    }

    source.onmessage = (message) => {
      try {
        const event = JSON.parse(message.data) as AdminEvent

        setEvents((current) => {
          if (current.some((item) => item.id === event.id)) return current
          return [event, ...current].slice(0, limit)
        })

        if (event.type === 'player.logged_in' || event.type === 'player.logged_out') {
          void queryClient.invalidateQueries({ queryKey: playersQueryKey })
          void queryClient.invalidateQueries({ queryKey: serverStatusQueryKey })
        }
      } catch {
        // Ignore malformed/non-Admin event frames and leave the stream connected.
      }
    }

    return () => {
      source.close()
    }
  }, [limit, queryClient])

  return { events, connectionState }
}
