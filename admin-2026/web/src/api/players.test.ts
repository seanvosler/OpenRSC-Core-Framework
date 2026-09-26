import { afterEach, describe, expect, it, vi } from 'vitest'

import { getPlayers } from '@/api/players'

const payload = {
  generatedAtEpochMillis: 1_790_455_300_000,
  servers: [
    {
      serverName: 'Runescape',
      onlineCount: 1,
      players: [
        {
          databaseId: 42,
          index: 0,
          username: 'Alice',
          combatLevel: 87,
          x: 120,
          y: 640,
          fatigue: 12,
          questPoints: 18,
          groupId: 10,
          groupName: 'User',
        },
      ],
    },
  ],
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getPlayers', () => {
  it('returns privacy-safe online-player summaries', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(payload), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    await expect(getPlayers()).resolves.toEqual(payload)
  })

  it('rejects non-success responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 500 })))

    await expect(getPlayers()).rejects.toThrow('HTTP 500')
  })
})
