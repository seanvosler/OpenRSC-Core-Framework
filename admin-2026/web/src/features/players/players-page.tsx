import type { ColumnDef } from '@tanstack/react-table'
import { MapPin, Shield, Star, Users, Waves } from 'lucide-react'

import type { PlayerSummary } from '@/api/players'
import { usePlayers } from '@/api/queries/players'
import { DataTable, dataTableFeatures } from '@/components/data-table/data-table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const columns: ColumnDef<typeof dataTableFeatures, PlayerSummary>[] = [
  {
    accessorKey: 'username',
    header: 'Player',
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-sky-100">{row.original.username}</div>
        <div className="text-[11px] text-muted-foreground">
          DB {row.original.databaseId} · idx {row.original.index}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'combatLevel',
    header: 'Combat',
  },
  {
    accessorFn: (player) => `${player.x}, ${player.y}`,
    id: 'location',
    header: 'Location',
    cell: ({ row }) => (
      <span className="font-mono text-xs">
        {row.original.x}, {row.original.y}
      </span>
    ),
  },
  {
    accessorKey: 'fatigue',
    header: 'Fatigue',
    cell: ({ row }) => <span>{row.original.fatigue}</span>,
  },
  {
    accessorKey: 'questPoints',
    header: 'QP',
  },
  {
    accessorKey: 'groupName',
    header: 'Group',
    cell: ({ row }) => (
      <Badge variant="outline" className="text-[10px]">
        {row.original.groupName}
      </Badge>
    ),
  },
]

export function PlayersPage() {
  const query = usePlayers()
  const list = query.data?.servers[0]

  if (query.isPending) {
    return <div className="p-6 text-sm text-muted-foreground">Loading online players…</div>
  }

  if (query.isError || !list) {
    return (
      <div className="p-6">
        <Card className="panel-etched border-destructive/50">
          <CardHeader>
            <CardTitle>Player list unavailable</CardTitle>
            <CardDescription>
              Start OpenRSC with the Admin 2026 listener enabled, then refresh this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const metrics = [
    { label: 'Online', value: list.onlineCount, icon: Users },
    { label: 'Staff online', value: list.players.filter((player) => player.groupId !== 10).length, icon: Shield },
    { label: 'Average combat', value: list.players.length ? Math.round(list.players.reduce((sum, player) => sum + player.combatLevel, 0) / list.players.length) : 0, icon: Star },
    { label: 'Fatigue total', value: list.players.reduce((sum, player) => sum + player.fatigue, 0), icon: Waves },
  ]

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="rsc-title text-2xl font-semibold">Online Players</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Live privacy-safe summaries from {list.serverName}.
          </p>
        </div>
        <Badge variant="outline" className="border-emerald-500/40 text-emerald-300">
          {list.onlineCount} online
        </Badge>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="panel-etched gap-2 py-4">
            <CardHeader className="flex flex-row items-center justify-between px-4">
              <CardDescription className="text-xs">{label}</CardDescription>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 text-2xl font-semibold">{value.toLocaleString()}</CardContent>
          </Card>
        ))}
      </section>

      <Card className="panel-etched">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" /> Live player summaries
          </CardTitle>
          <CardDescription>
            IP addresses and account-security data are intentionally excluded from this contract.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={list.players}
            searchPlaceholder="Search player, group, location…"
          />
        </CardContent>
      </Card>
    </div>
  )
}
