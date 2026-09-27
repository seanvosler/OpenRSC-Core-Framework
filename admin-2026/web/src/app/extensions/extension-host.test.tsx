import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

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
  it('requires a ready message from the configured extension origin', async () => {
    render(<ExtensionHost extension={extension} />)

    fireEvent.load(screen.getByTitle('World Viewer'))
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
  })
})
