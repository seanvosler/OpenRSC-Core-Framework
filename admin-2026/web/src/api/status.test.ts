import { afterEach, describe, expect, it, vi } from 'vitest'

import { getServerStatus } from '@/api/status'

const responseBody = {
  generatedAtEpochMillis: 1_790_453_706_535,
  servers: [
    {
      name: 'Runescape',
      running: true,
      restarting: false,
      shuttingDown: false,
      uptimeMillis: 16_234,
      currentTick: 25,
      gameTickMillis: 640,
      tick: {
        durationMillis: 24.85,
        lateMillis: 0,
        eventsMillis: 3.18,
        incomingPacketsMillis: 0,
        outgoingPacketsMillis: 0,
        worldUpdateMillis: 0.01,
        playersMillis: 0,
        npcsMillis: 19.77,
        messageQueuesMillis: 0.01,
        clientUpdateMillis: 0,
        cleanupMillis: 0.69,
        walkActionsMillis: 0,
      },
      world: {
        players: 0,
        npcs: 3608,
        shops: 92,
        snapshots: 0,
      },
    },
  ],
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getServerStatus', () => {
  it('returns the typed admin status payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(responseBody), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    await expect(getServerStatus()).resolves.toEqual(responseBody)
  })

  it('rejects non-success responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })))

    await expect(getServerStatus()).rejects.toThrow('HTTP 503')
  })
})
