import { adminApiBaseUrl } from '@/api/client'

export interface SyntheticActorSummary {
  playerIndex: number
  databaseId: number
  username: string
  behavior: string
  state: string
  decisionCount: number
  x: number
  y: number
}

export interface SyntheticPopulationSummary {
  serverName: string
  running: boolean
  actorCount: number
  actors: SyntheticActorSummary[]
}

export interface SyntheticPopulationResponse {
  generatedAtEpochMillis: number
  servers: SyntheticPopulationSummary[]
}

export async function getSyntheticPopulation(): Promise<SyntheticPopulationResponse> {
  const response = await fetch(`${adminApiBaseUrl}/synthetic-population`, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Synthetic population request failed with HTTP ${response.status}`)
  }

  return response.json() as Promise<SyntheticPopulationResponse>
}
