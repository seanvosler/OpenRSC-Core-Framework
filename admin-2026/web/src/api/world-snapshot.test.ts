import { afterEach, describe, expect, it, vi } from 'vitest'

import { getWorldSnapshot } from '@/api/world-snapshot'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getWorldSnapshot', () => {
  it('requests a versioned authoritative snapshot for the selected server', async () => {
    const payload = {
      version: 1,
      serverName: 'Runescape',
      generatedAtEpochMillis: 1_790_000_000_000,
      serverTick: 123,
      players: [],
      npcs: [],
      groundItems: [],
    }

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(getWorldSnapshot('Runescape')).resolves.toEqual(payload)
    expect(fetchMock).toHaveBeenCalledWith(
      '/admin/api/world/snapshot?serverName=Runescape',
      expect.objectContaining({
        headers: { Accept: 'application/json' },
      }),
    )
  })

  it('rejects snapshot failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 404 })))

    await expect(getWorldSnapshot('Missing')).rejects.toThrow('HTTP 404')
  })
})
