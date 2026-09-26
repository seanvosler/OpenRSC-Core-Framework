import { adminApiBaseUrl } from '@/api/client'

export interface QuestMetadata {
  id: number
  name: string
  points: number
  members: boolean
}

export interface MiniGameMetadata {
  id: number
  name: string
  members: boolean
}

export interface PluginSummary {
  className: string
  simpleName: string
  packageName: string
  triggerNames: string[]
  kinds: string[]
  quest: QuestMetadata | null
  minigame: MiniGameMetadata | null
}

export interface PluginInventory {
  serverName: string
  reloading: boolean
  instantiatedPlugins: number
  triggerTypes: number
  quests: number
  minigames: number
  shops: number
  plugins: PluginSummary[]
}

export interface PluginInventoryResponse {
  generatedAtEpochMillis: number
  servers: PluginInventory[]
}

export async function getPluginInventory(): Promise<PluginInventoryResponse> {
  const response = await fetch(`${adminApiBaseUrl}/plugins`, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Admin plugin request failed with HTTP ${response.status}`)
  }

  return response.json() as Promise<PluginInventoryResponse>
}
