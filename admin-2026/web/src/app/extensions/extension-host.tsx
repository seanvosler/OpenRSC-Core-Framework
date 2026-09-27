import { ExternalLink, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { ADMIN_EXTENSION_BRIDGE_VERSION, type AdminExtensionContext, type AdminToExtensionMessage } from '@/app/extensions/extension-bridge'
import type { AdminExtensionDescriptor } from '@/app/extensions/extension-types'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ExtensionHostProps {
  extension: AdminExtensionDescriptor
  context?: AdminExtensionContext
}

export function ExtensionHost({ extension, context = { server: null } }: ExtensionHostProps) {
  const [loadKey, setLoadKey] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [bridgeReady, setBridgeReady] = useState(false)
  const [syncedServerName, setSyncedServerName] = useState<string | null | undefined>(undefined)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const extensionOrigin = useMemo(() => {
    if (!extension.url) return null
    try {
      return new URL(extension.url, window.location.href).origin
    } catch {
      return null
    }
  }, [extension.url])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!extensionOrigin || event.origin !== extensionOrigin) return
      if (
        event.data?.source === 'openrsc-world-viewer' &&
        event.data?.version === ADMIN_EXTENSION_BRIDGE_VERSION
      ) {
        if (event.data.type === 'viewer.ready') {
          setBridgeReady(true)
        }
        if (event.data.type === 'context.applied') {
          setSyncedServerName(event.data.serverName ?? null)
        }
      }
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [extensionOrigin])

  useEffect(() => {
    if (!bridgeReady || !extensionOrigin || !iframeRef.current?.contentWindow) return

    const message: AdminToExtensionMessage = {
      source: 'openrsc-admin',
      type: 'context.changed',
      version: ADMIN_EXTENSION_BRIDGE_VERSION,
      context,
    }

    iframeRef.current.contentWindow.postMessage(message, extensionOrigin)
  }, [bridgeReady, context, extensionOrigin])

  if (extension.mode !== 'iframe' || !extension.url) {
    return (
      <Card className="panel-etched">
        <CardHeader>
          <CardTitle>{extension.name}</CardTitle>
          <CardDescription>This extension does not have a hosted entry point configured.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b bg-card/40 px-5 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{extension.name}</h2>
            <Badge variant="outline">Admin Extension</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Hosted independently · Phase B context bridge</p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline">{bridgeReady ? 'Connected' : loaded ? 'Frame loaded' : 'Connecting'}</Badge>
          {syncedServerName !== undefined && (
            <Badge variant="outline">Context: {syncedServerName ?? 'No server'}</Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoaded(false)
              setBridgeReady(false)
              setSyncedServerName(undefined)
              setLoadKey((value) => value + 1)
            }}
          >
            <RefreshCw className="size-4" />
            Reload
          </Button>
          <a
            href={extension.url}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            <ExternalLink className="size-4" />
            Open standalone
          </a>
        </div>
      </div>

      <Card className="m-4 min-h-0 flex-1 overflow-hidden p-0">
        <CardContent className="h-full min-h-[720px] p-0">
          <iframe
            ref={iframeRef}
            key={loadKey}
            title={extension.name}
            src={extension.url}
            className="h-full min-h-[720px] w-full border-0 bg-black"
            onLoad={() => setLoaded(true)}
            allow="fullscreen"
          />
        </CardContent>
      </Card>
    </div>
  )
}
