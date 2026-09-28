import { adminApiBaseUrl } from '@/api/client'

export interface AdminOperator {
  name: string
  groupId: number
  groupName: string
  capabilities: string[]
}

export interface AdminSession {
  authMode: string
  mutationsEnabled: boolean
  operator: AdminOperator
}

export async function getAdminSession(token: string): Promise<AdminSession> {
  const response = await fetch(`${adminApiBaseUrl}/session`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Admin session request failed with HTTP ${response.status}`)
  }

  return response.json() as Promise<AdminSession>
}
