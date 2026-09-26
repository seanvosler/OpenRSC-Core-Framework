import { useEffect, useRef, useState } from 'react'

import {
  Activity,
  Ban,
  Boxes,
  Clock3,
  Coins,
  Database,
  Footprints,
  HeartPulse,
  MessageSquare,
  Radio,
  RefreshCcw,
  Save,
  Send,
  Server,
  ShieldAlert,
  Skull,
  Sparkles,
  Users,
} from 'lucide-react'
import { Background, Controls, ReactFlow } from '@xyflow/react'
import { Line, LineChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts'

import { useAdminEvents } from '@/api/queries/admin-events'
import { usePlayers } from '@/api/queries/players'
import { usePluginInventory } from '@/api/queries/plugin-inventory'
import { useServerStatus } from '@/api/queries/server-status'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

function formatMillis(value: number) {
  return `${value < 10 ? value.toFixed(2) : value.toFixed(0)} ms`
}

function formatUptime(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor((totalSeconds % 86_400) / 3_600)
  const minutes = Math.floor((totalSeconds % 3_600) / 60)

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

const flowNodes = [
  { id: 'player', position: { x: 0, y: 70 }, data: { label: 'Player enters area' }, type: 'input' },
  { id: 'trigger', position: { x: 190, y: 70 }, data: { label: 'NPC Talk Trigger' } },
  { id: 'plugin', position: { x: 390, y: 70 }, data: { label: 'Dragon Slayer' } },
  { id: 'stage', position: { x: 590, y: 10 }, data: { label: 'Quest stage updated' }, type: 'output' },
  { id: 'reward', position: { x: 590, y: 130 }, data: { label: 'Reward + unlocks' }, type: 'output' },
]

const flowEdges = [
  { id: 'a', source: 'player', target: 'trigger' },
  { id: 'b', source: 'trigger', target: 'plugin' },
  { id: 'c', source: 'plugin', target: 'stage', animated: true },
  { id: 'd', source: 'plugin', target: 'reward', animated: true },
]

function describeAdminEvent(type: string, data: Record<string, unknown>) {
  const username = typeof data.username === 'string' ? data.username : 'Player'

  if (type === 'player.logged_in') return `${username} logged in`
  if (type === 'player.logged_out') return `${username} logged out`
  return type
}

export function OverviewPage() {
  const { events: adminEvents, connectionState: eventConnectionState } = useAdminEvents()
  const statusQuery = useServerStatus()
  const playersQuery = usePlayers()
  const pluginQuery = usePluginInventory()
  const server = statusQuery.data?.servers[0]
  const playerList = playersQuery.data?.servers[0]
  const pluginInventory = pluginQuery.data?.servers[0]
  const [tickData, setTickData] = useState<Array<{ t: string; ms: number }>>([])
  const lastRecordedTick = useRef<number | null>(null)

  useEffect(() => {
    if (!server || server.currentTick === lastRecordedTick.current) return

    const timestamp = statusQuery.data?.generatedAtEpochMillis ?? Date.now()
    const label = new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    setTickData((current) => [...current, { t: label, ms: server.tick.durationMillis }].slice(-30))
    lastRecordedTick.current = server.currentTick
  }, [server, statusQuery.data?.generatedAtEpochMillis])

  const apiState = statusQuery.isError
    ? 'Disconnected'
    : statusQuery.isPending
      ? 'Connecting…'
      : server
        ? 'Connected'
        : 'No servers'

  const pluginCards =
    pluginInventory?.plugins
      .filter((plugin) => plugin.quest || plugin.minigame)
      .slice(0, 8) ?? []

  const stats = [
    { label: 'Online Players', value: server ? String(server.world.players) : '—', icon: Users, tone: 'text-emerald-300' },
    { label: 'NPCs', value: server ? server.world.npcs.toLocaleString() : '—', icon: Skull, tone: 'text-sky-300' },
    { label: 'Tick Duration', value: server ? formatMillis(server.tick.durationMillis) : '—', icon: Activity, tone: 'text-amber-200' },
    { label: 'Late', value: server ? formatMillis(server.tick.lateMillis) : '—', icon: Clock3, tone: server?.tick.lateMillis ? 'text-amber-200' : 'text-emerald-300' },
    { label: 'Tick Rate', value: server ? `${server.gameTickMillis} ms` : '—', icon: HeartPulse, tone: 'text-foreground' },
    { label: 'Current Tick', value: server ? server.currentTick.toLocaleString() : '—', icon: Radio, tone: 'text-sky-300' },
    { label: 'Uptime', value: server ? formatUptime(server.uptimeMillis) : '—', icon: Server, tone: 'text-foreground' },
    { label: 'Admin API', value: apiState, icon: Database, tone: statusQuery.isError ? 'text-red-300' : 'text-emerald-300' },
  ]

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <Card key={label} className="panel-etched min-w-0 gap-3 py-4">
            <CardHeader className="flex flex-row items-center justify-between px-4">
              <CardDescription className="text-xs">{label}</CardDescription>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className={"px-4 text-xl font-semibold " + tone}>{value}</CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <Card className="panel-etched">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="size-4 text-primary" /> Live Players</CardTitle>
            <CardDescription>
              {playerList
                ? `${playerList.onlineCount} online · privacy-safe summaries`
                : playersQuery.isError
                  ? 'Player API unavailable'
                  : 'Loading online players…'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Combat</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Fatigue</TableHead>
                  <TableHead>Group</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playerList?.players.length ? (
                  playerList.players.slice(0, 5).map((player) => (
                    <TableRow key={player.databaseId}>
                      <TableCell className="font-medium text-sky-100">{player.username}</TableCell>
                      <TableCell>{player.combatLevel}</TableCell>
                      <TableCell className="font-mono text-xs">{player.x}, {player.y}</TableCell>
                      <TableCell>{player.fatigue}</TableCell>
                      <TableCell>{player.groupName}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                      {playersQuery.isError ? 'Player data unavailable.' : 'No players are currently online.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="panel-etched">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Boxes className="size-4 text-primary" /> Plugins & Content</CardTitle>
            <CardDescription>
              {pluginInventory
                ? `${pluginInventory.instantiatedPlugins} live handlers · ${pluginInventory.quests} quests · ${pluginInventory.minigames} minigames`
                : pluginQuery.isError
                  ? 'Plugin inventory unavailable'
                  : 'Loading live plugin inventory…'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {pluginCards.length ? (
              pluginCards.map((plugin) => (
                <div key={plugin.className} className="rounded-md border bg-background/35 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {plugin.quest?.name ?? plugin.minigame?.name ?? plugin.simpleName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {plugin.triggerNames.length} triggers · {plugin.kinds.join(', ')}
                      </div>
                    </div>
                    <Badge variant="outline" className={plugin.quest?.members || plugin.minigame?.members ? 'border-amber-500/40 text-amber-200' : 'border-emerald-500/40 text-emerald-300'}>
                      {plugin.quest ? 'Quest' : 'Minigame'}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                {pluginQuery.isError ? 'Start the Admin API to load plugin data.' : 'Waiting for plugin inventory…'}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="panel-etched">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><HeartPulse className="size-4 text-primary" /> Server Performance</CardTitle>
            <CardDescription>{server ? 'Live tick duration sampled every 2 seconds' : 'Waiting for Admin API'}</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tickData}>
                <XAxis dataKey="t" stroke="currentColor" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 'auto']} stroke="currentColor" tick={{ fontSize: 11 }} width={42} />
                <ChartTooltip contentStyle={{ background: '#171a17', border: '1px solid #6e5b35', borderRadius: 6 }} />
                <Line type="monotone" dataKey="ms" stroke="#68c477" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="panel-etched">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /> Plugin Flow</CardTitle>
            <CardDescription>Dragon Slayer · simplified</CardDescription>
          </CardHeader>
          <CardContent className="h-64 overflow-hidden rounded-md">
            <ReactFlow nodes={flowNodes} edges={flowEdges} fitView nodesDraggable={false} nodesConnectable={false} elementsSelectable={false}>
              <Background gap={18} size={1} />
              <Controls showInteractive={false} />
            </ReactFlow>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1.15fr]">
        <Card className="panel-etched">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldAlert className="size-4 text-primary" /> Admin Utilities</CardTitle>
            <CardDescription>Planned GUI wrappers · disabled until auth and command APIs exist</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <Button disabled variant="outline"><MessageSquare /> Message</Button>
            <Button disabled variant="outline"><Footprints /> Teleport</Button>
            <Button disabled variant="outline"><Ban /> Kick</Button>
            <Button disabled variant="destructive"><Ban /> Ban</Button>
            <Button disabled variant="outline"><Radio /> Broadcast</Button>
            <Button disabled variant="outline"><Save /> Save All</Button>
            <Button disabled variant="outline"><RefreshCcw /> Restart</Button>
            <Button disabled variant="outline"><Send /> Event Tool</Button>
          </CardContent>
        </Card>

        <Card className="panel-etched">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Coins className="size-4 text-primary" /> Recent Activity</CardTitle>
            <CardDescription>
              Live Admin event stream · {eventConnectionState}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {adminEvents.length ? (
              adminEvents.slice(0, 8).map((event) => (
                <div key={event.id} className="grid grid-cols-[68px_1fr_auto] gap-2 border-b border-border/50 py-2 text-sm last:border-0">
                  <span className="font-mono text-xs text-muted-foreground">
                    {new Date(event.timestampEpochMillis).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                  <span>{describeAdminEvent(event.type, event.data)}</span>
                  <Badge variant="outline" className="text-[10px]">{event.serverName}</Badge>
                </div>
              ))
            ) : (
              <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                {eventConnectionState === 'connected'
                  ? 'Waiting for player login/logout activity…'
                  : 'Connecting to the live event stream…'}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
