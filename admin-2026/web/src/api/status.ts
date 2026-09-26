import { adminApiBaseUrl } from '@/api/client'

export interface TickMetrics {
  durationMillis: number
  lateMillis: number
  eventsMillis: number
  incomingPacketsMillis: number
  outgoingPacketsMillis: number
  worldUpdateMillis: number
  playersMillis: number
  npcsMillis: number
  messageQueuesMillis: number
  clientUpdateMillis: number
  cleanupMillis: number
  walkActionsMillis: number
}

export interface WorldStatus {
  players: number
  npcs: number
  shops: number
  snapshots: number
}
export interface ServerStatus {
  name: string
  running: boolean
  restarting: boolean
  shuttingDown: boolean
  uptimeMillis: number
  currentTick: number
  gameTickMillis: number
  tick: TickMetrics
  world: WorldStatus
}

export interface ServerStatusResponse {
  generatedAtEpochMillis: number
  servers: ServerStatus[]
}

export async function getServerStatus(): Promise<ServerStatusResponse> {
  const response = await fetch(`${adminApiBaseUrl}/status`, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Admin status request failed with HTTP ${response.status}`)
  }

  return response.json() as Promise<ServerStatusResponse>
}
