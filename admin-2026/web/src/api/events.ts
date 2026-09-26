import { adminApiBaseUrl } from '@/api/client'

export interface AdminEvent {
  id: number
  type: string
  timestampEpochMillis: number
  serverName: string
  data: Record<string, unknown>
}

export const adminEventsUrl = `${adminApiBaseUrl}/events`
