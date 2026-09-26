import { afterEach, describe, expect, it, vi } from 'vitest'

import { getPluginInventory } from '@/api/plugins'

const payload = {
  generatedAtEpochMillis: 1_790_455_218_024,
  servers: [
    {
      serverName: 'Runescape',
      reloading: false,
      instantiatedPlugins: 455,
      triggerTypes: 31,
      quests: 50,
      minigames: 9,
      shops: 92,
      plugins: [
        {
          className: 'com.openrsc.server.plugins.authentic.quests.free.DragonSlayer',
          simpleName: 'DragonSlayer',
          packageName: 'com.openrsc.server.plugins.authentic.quests.free',
          triggerNames: ['KillNpcTrigger', 'TalkNpcTrigger'],
          kinds: ['quest', 'trigger-handler'],
          quest: {
            id: 16,
            name: 'Dragon slayer',
            points: 2,
            members: false,
          },
          minigame: null,
        },
      ],
    },
  ],
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getPluginInventory', () => {
  it('returns plugin inventory metadata', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(payload), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    await expect(getPluginInventory()).resolves.toEqual(payload)
  })

  it('rejects non-success responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 500 })))

    await expect(getPluginInventory()).rejects.toThrow('HTTP 500')
  })
})
