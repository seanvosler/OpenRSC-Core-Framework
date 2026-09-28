import { useMemo } from 'react'

import { useServerStatus } from '@/api/queries/server-status'
import { useWorldSnapshot } from '@/api/queries/world-snapshot'
import {
  ADMIN_EXTENSION_BRIDGE_VERSION,
  type AdminToExtensionMessage,
} from '@/app/extensions/extension-bridge'
import { getAdminExtension } from '@/app/extensions/extension-registry'
import { ExtensionHost } from '@/app/extensions/extension-host'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function WorldPage() {
  const extension = getAdminExtension('world-viewer')
  const statusQuery = useServerStatus()
  const serverName = statusQuery.data?.servers[0]?.name ?? null
  const snapshotQuery = useWorldSnapshot(serverName)

  const context = useMemo(
    () => ({ server: serverName ? { name: serverName } : null }),
    [serverName],
  )

  const outboundMessages = useMemo<AdminToExtensionMessage[]>(() => {
    if (!snapshotQuery.data) return []

    return [
      {
        source: 'openrsc-admin',
        type: 'world.snapshot',
        version: ADMIN_EXTENSION_BRIDGE_VERSION,
        snapshot: snapshotQuery.data,
      },
    ]
  }, [snapshotQuery.data])

  if (!extension) {
    return (
      <div className="p-6">
        <Card className="panel-etched">
          <CardHeader>
            <CardTitle>World Viewer unavailable</CardTitle>
            <CardDescription>The world-viewer Admin Extension is not registered.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-5 top-14 z-10 text-[11px] text-muted-foreground">
        {snapshotQuery.data
          ? `${snapshotQuery.data.players.length} players · ${snapshotQuery.data.npcs.length} NPCs · ${snapshotQuery.data.groundItems.length} ground items · tick ${snapshotQuery.data.serverTick}`
          : serverName
            ? 'Connecting live world state…'
            : 'No server selected'}
      </div>
      <ExtensionHost
        extension={extension}
        context={context}
        outboundMessages={outboundMessages}
      />
    </div>
  )
}
