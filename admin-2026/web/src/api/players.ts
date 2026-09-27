import { adminApiBaseUrl } from '@/api/client'

export interface PlayerSummary {
  databaseId: number
  index: number
  username: string
  combatLevel: number
  x: number
  y: number
  fatigue: number
  questPoints: number
  groupId: number
  groupName: string
  synthetic: boolean
  syntheticBehavior: string
  syntheticState: string
}

export interface PlayerList {
  serverName: string
  onlineCount: number
  players: PlayerSummary[]
}

export interface PlayerListResponse {
  generatedAtEpochMillis: number
  servers: PlayerList[]
}

export async function getPlayers(): Promise<PlayerListResponse> {
  const response = await fetch(`${adminApiBaseUrl}/players`, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Admin players request failed with HTTP ${response.status}`)
  }

  return response.json() as Promise<PlayerListResponse>
}
