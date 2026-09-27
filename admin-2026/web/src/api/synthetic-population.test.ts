import { afterEach, describe, expect, it, vi } from 'vitest'

import { getSyntheticPopulation } from '@/api/synthetic-population'

const payload = {
  generatedAtEpochMillis: 1_790_000_000_000,
  servers: [
    {
      serverName: 'Runescape',
      running: true,
      actorCount: 1,
      actors: [
        {
          playerIndex: 0,
          databaseId: -1,
          username: 'Synthbot01',
          behavior: 'MINER',
          state: 'mining-dispatched',
          decisionCount: 12,
          x: 120,
          y: 648,
        },
      ],
    },
  ],
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getSyntheticPopulation', () => {
  it('returns synthetic runtime metadata', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(payload), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    await expect(getSyntheticPopulation()).resolves.toEqual(payload)
  })

  it('rejects non-success responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })))

    await expect(getSyntheticPopulation()).rejects.toThrow('HTTP 503')
  })
})
