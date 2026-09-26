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

import { useServerStatus } from '@/api/queries/server-status'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
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

const players = [
  { name: 'Alice', combat: 87, location: 'Lumbridge', hp: 100, activity: 'Woodcutting' },
  { name: 'VarrokVet', combat: 99, location: 'Varrock', hp: 100, activity: 'Trading' },
  { name: 'LumbyMage', combat: 92, location: 'Al Kharid', hp: 64, activity: 'High Alchemy' },
  { name: 'IronOak', combat: 76, location: 'Draynor Manor', hp: 80, activity: 'Dragon Slayer' },
  { name: 'SeerScout', combat: 61, location: "Seers' Village", hp: 52, activity: 'Exploring' },
]

const plugins = [
  { name: 'Dragon Slayer', meta: 'Quest · Content', status: 'Active' },
  { name: 'Goblin Diplomacy', meta: 'Quest · NPCs', status: 'Active' },
  { name: 'Clan System', meta: 'Social · Persistent', status: 'Active' },
  { name: 'Market', meta: 'Economy · Trading', status: 'Active' },
  { name: 'Holiday Events', meta: 'Seasonal · World', status: 'Warning' },
  { name: 'Path Trace Overlay', meta: 'Developer · Tools', status: 'Reloadable' },
  { name: 'Quest Flow Inspector', meta: 'Developer · Tools', status: 'Active' },
  { name: 'Spawn Debugger', meta: 'Developer · World', status: 'Error' },
]

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

const events = [
  ['14:33', 'Alice logged in', 'Player'],
  ['14:32', 'Dragon Slayer trigger invoked', 'Plugin'],
  ['14:31', 'Broadcast sent by Admin Rowan', 'Admin'],
  ['14:30', 'Market sync completed', 'World'],
  ['14:28', 'Spawn Debugger reloaded', 'Plugin'],
]

function statusVariant(status: string) {
  if (status === 'Error') return 'destructive' as const
  return 'outline' as const
}

export function OverviewPage() {
  const statusQuery = useServerStatus()
  const server = statusQuery.data?.servers[0]
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
            <CardDescription>Mock player rows · live count above when connected</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Combat</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>HP</TableHead>
                  <TableHead>Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => (
                  <TableRow key={player.name}>
                    <TableCell className="font-medium text-sky-100">{player.name}</TableCell>
                    <TableCell>{player.combat}</TableCell>
                    <TableCell>{player.location}</TableCell>
                    <TableCell className="min-w-28"><Progress value={player.hp} className="h-2" /></TableCell>
                    <TableCell>{player.activity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="panel-etched">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Boxes className="size-4 text-primary" /> Plugins & Content</CardTitle>
            <CardDescription>Real and imagined plugin surfaces</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {plugins.map((plugin) => (
              <div key={plugin.name} className="rounded-md border bg-background/35 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium">{plugin.name}</div>
                    <div className="text-xs text-muted-foreground">{plugin.meta}</div>
                  </div>
                  <Badge variant={statusVariant(plugin.status)} className={plugin.status === 'Active' ? 'border-emerald-500/40 text-emerald-300' : plugin.status === 'Warning' ? 'border-amber-500/40 text-amber-200' : plugin.status === 'Reloadable' ? 'border-sky-500/40 text-sky-300' : ''}>
                    {plugin.status}
                  </Badge>
                </div>
              </div>
            ))}
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
            <CardDescription>Representative live event feed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {events.map(([time, text, kind]) => (
              <div key={time + text} className="grid grid-cols-[52px_1fr_auto] gap-2 border-b border-border/50 py-2 text-sm last:border-0">
                <span className="font-mono text-xs text-muted-foreground">{time}</span>
                <span>{text}</span>
                <Badge variant="outline" className="text-[10px]">{kind}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
