import { adminApiBaseUrl } from '@/api/client'

export interface WorldPlayerAppearance {
  sprites: number[]
  hair: number
  top: number
  bottom: number
  skin: number
}

export interface WorldPlayerSnapshot {
  databaseId: number
  serverIndex: number
  username: string
  x: number
  y: number
  combatLevel: number
  inCombat: boolean
  sleeping: boolean
  skulled: boolean
  hits: number
  maxHits: number
  appearance: WorldPlayerAppearance
}

export interface WorldNpcSnapshot {
  serverIndex: number
  id: number
  name: string
  x: number
  y: number
  inCombat: boolean
  hits: number
  maxHits: number
}

export interface WorldGroundItemSnapshot {
  id: number
  name: string
  amount: number
  x: number
  y: number
}

export interface WorldSnapshot {
  version: number
  serverName: string
  generatedAtEpochMillis: number
  serverTick: number
  players: WorldPlayerSnapshot[]
  npcs: WorldNpcSnapshot[]
  groundItems: WorldGroundItemSnapshot[]
}

export async function getWorldSnapshot(serverName: string): Promise<WorldSnapshot> {
  const search = new URLSearchParams({ serverName })
  const response = await fetch(`${adminApiBaseUrl}/world/snapshot?${search}`, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Admin world snapshot request failed with HTTP ${response.status}`)
  }

  return response.json() as Promise<WorldSnapshot>
}
