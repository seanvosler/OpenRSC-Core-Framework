import { afterEach, describe, expect, it, vi } from 'vitest'

import { sendPlayerMessage } from '@/api/player-actions'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('sendPlayerMessage', () => {
  it('posts a typed player alert mutation', async () => {
    const result = {
      requestId: 'request-1',
      success: true,
      action: 'players.message',
      serverName: 'Runescape',
      target: 'player:42:Alice',
      errorCode: null,
      detail: 'Message delivered to online player',
    }

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      sendPlayerMessage('test-token', {
        serverName: 'Runescape',
        databaseId: 42,
        message: 'Hello',
      }),
    ).resolves.toEqual(result)

    expect(fetchMock).toHaveBeenCalledWith(
      '/admin/api/players/message',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          serverName: 'Runescape',
          databaseId: 42,
          message: 'Hello',
        }),
      }),
    )
  })

  it('surfaces typed mutation errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            requestId: 'request-2',
            success: false,
            action: 'players.message',
            serverName: 'Runescape',
            target: 'player:42',
            errorCode: 'player_not_online',
            detail: 'Player is not online',
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      ),
    )

    await expect(
      sendPlayerMessage('test-token', {
        serverName: 'Runescape',
        databaseId: 42,
        message: 'Hello',
      }),
    ).rejects.toThrow('Player is not online')
  })
})
