import type { AdminExtensionDescriptor } from '@/app/extensions/extension-types'

const worldViewerUrl =
  import.meta.env.VITE_WORLD_VIEWER_URL ?? 'http://127.0.0.1:5173'

export const adminExtensions = [
  {
    id: 'world-viewer',
    name: 'World Viewer',
    route: '/world',
    mode: 'iframe',
    url: worldViewerUrl,
    category: 'World',
    requiredCapabilities: ['world.read'],
  },
] satisfies AdminExtensionDescriptor[]

export function getAdminExtension(id: string) {
  return adminExtensions.find((extension) => extension.id === id)
}
