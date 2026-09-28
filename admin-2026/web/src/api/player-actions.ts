import { adminApiBaseUrl } from '@/api/client'

export interface PlayerMessageRequest {
  serverName: string
  databaseId: number
  message: string
}

export interface AdminMutationResult {
  requestId: string
  success: boolean
  action: string
  serverName: string | null
  target: string | null
  errorCode: string | null
  detail: string | null
}

export async function sendPlayerMessage(
  token: string,
  request: PlayerMessageRequest,
): Promise<AdminMutationResult> {
  const response = await fetch(`${adminApiBaseUrl}/players/message`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  const result = (await response.json()) as AdminMutationResult

  if (!response.ok) {
    throw new Error(result.detail ?? result.errorCode ?? `HTTP ${response.status}`)
  }

  return result
}
