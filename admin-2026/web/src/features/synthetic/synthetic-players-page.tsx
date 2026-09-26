import { Activity, Bot, MapPin, Power, Skull, Users } from 'lucide-react'

import { usePlayers } from '@/api/queries/players'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export function SyntheticPlayersPage() {
  const playersQuery = usePlayers()
  const server = playersQuery.data?.servers[0]
  const syntheticPlayers = server?.players.filter((player) => player.databaseId < 0) ?? []

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="outline" className="border-amber-500/40 text-amber-300">
              Developer utility
            </Badge>
            <Badge variant="outline">Experimental</Badge>
          </div>
          <h2 className="rsc-title text-2xl font-semibold">Synthetic Population</h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Configure and observe development-only server-side test players. Lifecycle mutations remain
            disabled until Admin authentication, capabilities, audit, and synthetic teardown are ready.
          </p>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        <Card className="panel-etched gap-2 py-4">
          <CardHeader className="flex flex-row items-center justify-between px-4">
            <CardDescription className="text-xs">Detected synthetic players</CardDescription>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 text-2xl font-semibold">
            {playersQuery.isPending ? '…' : syntheticPlayers.length}
          </CardContent>
        </Card>

        <Card className="panel-etched gap-2 py-4">
          <CardHeader className="flex flex-row items-center justify-between px-4">
            <CardDescription className="text-xs">Runtime connection</CardDescription>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4">
            <Badge variant="outline" className={playersQuery.isError ? 'text-red-300' : 'text-emerald-300'}>
              {playersQuery.isPending ? 'Connecting' : playersQuery.isError ? 'Unavailable' : 'Live player feed'}
            </Badge>
          </CardContent>
        </Card>

        <Card className="panel-etched gap-2 py-4">
          <CardHeader className="flex flex-row items-center justify-between px-4">
            <CardDescription className="text-xs">Control plane</CardDescription>
            <Power className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4">
            <Badge variant="outline" className="text-amber-300">Read-only scaffold</Badge>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
        <Card className="panel-etched">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="size-4 text-primary" /> Population configuration
            </CardTitle>
            <CardDescription>
              Proposed command surface. Values are editable locally for layout/testing but are not sent to OpenRSC yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm">
              <span className="text-muted-foreground">Player count</span>
              <Input type="number" min={1} max={100} defaultValue={15} />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="text-muted-foreground">Behavior / scenario</span>
              <select
                defaultValue="mixed-basic"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="mixed-basic">Mixed basic</option>
                <option value="idle">Idle</option>
                <option value="wander">Wander</option>
                <option value="miner">Miner</option>
                <option value="catalog">Catalog scenario (future)</option>
              </select>
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="size-3.5" /> Spawn X
              </span>
              <Input type="number" defaultValue={120} />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="size-3.5" /> Spawn Y
              </span>
              <Input type="number" defaultValue={648} />
            </label>

            <div className="sm:col-span-2 flex flex-wrap gap-2 pt-2">
              <Button disabled title="Requires authenticated, audited Admin mutation API">
                <Bot className="size-4" /> Spawn synthetic players
              </Button>
              <Button variant="destructive" disabled title="Requires clean synthetic teardown + Admin mutation API">
                <Skull className="size-4" /> Stop all synthetic players
              </Button>
            </div>
            <p className="sm:col-span-2 text-xs text-muted-foreground">
              Controls intentionally remain disabled. The eventual backend will accept explicit validated synthetic
              commands rather than arbitrary JVM properties or browser-to-Java mutation.
            </p>
          </CardContent>
        </Card>

        <Card className="panel-etched">
          <CardHeader>
            <CardTitle>Live synthetic actors</CardTitle>
            <CardDescription>
              Currently inferred from the synthetic negative database-ID convention in the normal player API.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {playersQuery.isPending ? (
              <div className="text-sm text-muted-foreground">Loading live players…</div>
            ) : syntheticPlayers.length === 0 ? (
              <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                No synthetic actors are currently visible on {server?.serverName ?? 'the selected server'}.
              </div>
            ) : (
              syntheticPlayers.map((player) => (
                <div key={player.index} className="flex items-center justify-between gap-3 rounded-md border p-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{player.username}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      PID {player.index} · DB {player.databaseId} · {player.x},{player.y}
                    </div>
                  </div>
                  <Badge variant="outline">Lvl {player.combatLevel}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="panel-etched border-amber-500/20">
        <CardHeader>
          <CardTitle>Planned command boundary</CardTitle>
          <CardDescription>
            This page is ready to bind to explicit synthetic lifecycle commands once the backend safety gates are complete.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
          <div><code>synthetic.population.start</code> — validated count, scenario/profile, spawn anchor, seed.</div>
          <div><code>synthetic.population.stop</code> — stop one scenario or all synthetic actors cleanly.</div>
          <div><code>synthetic.population.read</code> — profile, behavior, state, target, seed, age, errors.</div>
          <div><code>synthetic.population.resolve</code> — dry-run catalog/scenario resolution before spawning.</div>
        </CardContent>
      </Card>
    </div>
  )
}
