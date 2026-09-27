import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ExtensionHost } from '@/app/extensions/extension-host'
import type { AdminExtensionDescriptor } from '@/app/extensions/extension-types'

const extension: AdminExtensionDescriptor = {
  id: 'world-viewer',
  name: 'World Viewer',
  route: '/world',
  mode: 'iframe',
  url: 'http://127.0.0.1:5173',
}

describe('ExtensionHost', () => {
  it('validates the viewer origin and sends explicit Admin context', async () => {
    render(<ExtensionHost extension={extension} context={{ server: { name: 'Uranium' } }} />)

    const frame = screen.getByTitle('World Viewer') as HTMLIFrameElement
    const postMessage = vi.spyOn(frame.contentWindow!, 'postMessage')

    fireEvent.load(frame)
    expect(screen.getByText('Frame loaded')).toBeInTheDocument()

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'http://malicious.example',
      data: { source: 'openrsc-world-viewer', type: 'viewer.ready', version: 1 },
    }))
    expect(screen.getByText('Frame loaded')).toBeInTheDocument()

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'http://127.0.0.1:5173',
      data: { source: 'openrsc-world-viewer', type: 'viewer.ready', version: 1 },
    }))

    await waitFor(() => expect(screen.getByText('Connected')).toBeInTheDocument())
    await waitFor(() => expect(postMessage).toHaveBeenCalledWith({
      source: 'openrsc-admin',
      type: 'context.changed',
      version: 1,
      context: { server: { name: 'Uranium' } },
    }, 'http://127.0.0.1:5173'))

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'http://127.0.0.1:5173',
      data: {
        source: 'openrsc-world-viewer',
        type: 'context.applied',
        version: 1,
        serverName: 'Uranium',
      },
    }))

    await waitFor(() => expect(screen.getByText('Context: Uranium')).toBeInTheDocument())
  })
})
