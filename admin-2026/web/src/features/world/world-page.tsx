import { useMemo } from 'react'

import { useServerStatus } from '@/api/queries/server-status'
import { getAdminExtension } from '@/app/extensions/extension-registry'
import { ExtensionHost } from '@/app/extensions/extension-host'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function WorldPage() {
  const extension = getAdminExtension('world-viewer')
  const statusQuery = useServerStatus()
  const serverName = statusQuery.data?.servers[0]?.name ?? null
  const context = useMemo(() => ({ server: serverName ? { name: serverName } : null }), [serverName])

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

  return <ExtensionHost extension={extension} context={context} />
}
