import type { WorldSnapshot } from '@/api/world-snapshot'

export const ADMIN_EXTENSION_BRIDGE_VERSION = 1 as const

export interface AdminExtensionContext {
  server: { name: string } | null
}

export type AdminContextChangedMessage = {
  source: 'openrsc-admin'
  type: 'context.changed'
  version: typeof ADMIN_EXTENSION_BRIDGE_VERSION
  context: AdminExtensionContext
}

export type AdminWorldSnapshotMessage = {
  source: 'openrsc-admin'
  type: 'world.snapshot'
  version: typeof ADMIN_EXTENSION_BRIDGE_VERSION
  snapshot: WorldSnapshot
}

export type AdminToExtensionMessage = AdminContextChangedMessage | AdminWorldSnapshotMessage

export type ExtensionToAdminMessage =
  | { source: 'openrsc-world-viewer'; type: 'viewer.ready'; version: typeof ADMIN_EXTENSION_BRIDGE_VERSION }
  | { source: 'openrsc-world-viewer'; type: 'context.applied'; version: typeof ADMIN_EXTENSION_BRIDGE_VERSION; serverName: string | null }
