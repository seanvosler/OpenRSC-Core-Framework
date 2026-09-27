import { ExternalLink, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import type { AdminExtensionDescriptor } from '@/app/extensions/extension-types'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ExtensionHostProps {
  extension: AdminExtensionDescriptor
}

export function ExtensionHost({ extension }: ExtensionHostProps) {
  const [loadKey, setLoadKey] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [bridgeReady, setBridgeReady] = useState(false)
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
        event.data?.type === 'viewer.ready' &&
        event.data?.version === 1
      ) {
        setBridgeReady(true)
      }
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [extensionOrigin])

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
          <p className="text-xs text-muted-foreground">Hosted independently · Phase C bridge</p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline">{bridgeReady ? 'Connected' : loaded ? 'Frame loaded' : 'Connecting'}</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoaded(false)
              setBridgeReady(false)
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
