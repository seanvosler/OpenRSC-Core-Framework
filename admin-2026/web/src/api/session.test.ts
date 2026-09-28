import { afterEach, describe, expect, it, vi } from 'vitest'

import { getAdminSession } from '@/api/session'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getAdminSession', () => {
  it('sends the bearer token and returns operator capabilities', async () => {
    const payload = {
      authMode: 'local-bearer',
      mutationsEnabled: true,
      operator: {
        name: 'Local Admin GUI',
        groupId: 1,
        groupName: 'Admin',
        capabilities: ['players.message', 'players.read'],
      },
    }

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(getAdminSession('test-token')).resolves.toEqual(payload)
    expect(fetchMock).toHaveBeenCalledWith(
      '/admin/api/session',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    )
  })

  it('rejects unauthorized sessions', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 401 })))

    await expect(getAdminSession('bad-token')).rejects.toThrow('HTTP 401')
  })
})
