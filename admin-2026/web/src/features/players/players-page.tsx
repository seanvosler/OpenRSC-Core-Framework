import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { KeyRound, MapPin, MessageSquare, Shield, Star, Users, Waves } from 'lucide-react'

import { sendPlayerMessage } from '@/api/player-actions'
import type { PlayerSummary } from '@/api/players'
import { usePlayers } from '@/api/queries/players'
import { getAdminSession } from '@/api/session'
import type { AdminSession } from '@/api/session'
import { DataTable, dataTableFeatures } from '@/components/data-table/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

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

  const [token, setToken] = useState('')
  const [session, setSession] = useState<AdminSession | null>(null)
  const [sessionError, setSessionError] = useState('')
  const [selectedPlayerId, setSelectedPlayerId] = useState('')
  const [message, setMessage] = useState('')
  const [mutationStatus, setMutationStatus] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const selectedPlayer = useMemo(
    () => list?.players.find((player) => player.databaseId === Number(selectedPlayerId)),
    [list?.players, selectedPlayerId],
  )

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

  const connectOperator = async (event: FormEvent) => {
    event.preventDefault()
    setSessionError('')
    setMutationStatus('')
    setIsConnecting(true)

    try {
      const nextSession = await getAdminSession(token.trim())
      setSession(nextSession)
    } catch (error) {
      setSession(null)
      setSessionError(error instanceof Error ? error.message : 'Unable to authenticate operator')
    } finally {
      setIsConnecting(false)
    }
  }

  const sendAlert = async (event: FormEvent) => {
    event.preventDefault()
    if (!session || !selectedPlayer) return

    setMutationStatus('')
    setIsSending(true)
    try {
      const result = await sendPlayerMessage(token.trim(), {
        serverName: list.serverName,
        databaseId: selectedPlayer.databaseId,
        message,
      })
      setMutationStatus(`Delivered · request ${result.requestId.slice(0, 8)}`)
      setMessage('')
    } catch (error) {
      setMutationStatus(error instanceof Error ? error.message : 'Unable to send player alert')
    } finally {
      setIsSending(false)
    }
  }

  const canMessage = session?.operator.capabilities.includes('players.message') ?? false

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
            <KeyRound className="size-4 text-primary" /> Operator session
          </CardTitle>
          <CardDescription>
            Local-development bearer auth only. The token stays in this page's memory and is not written to Vite config or URLs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={connectOperator} className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Local Admin 2026 bearer token"
              autoComplete="off"
            />
            <Button type="submit" variant="outline" disabled={!token.trim() || isConnecting}>
              {isConnecting ? 'Checking…' : session ? 'Reconnect' : 'Connect'}
            </Button>
          </form>

          {session ? (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-300">
                {session.operator.name}
              </Badge>
              <span className="text-muted-foreground">{session.operator.groupName}</span>
              <span className="text-muted-foreground">
                {canMessage ? 'players.message granted' : 'read-only operator'}
              </span>
            </div>
          ) : null}

          {sessionError ? <p className="text-xs text-destructive">{sessionError}</p> : null}

          <form onSubmit={sendAlert} className="grid gap-3 border-t border-border/60 pt-4 lg:grid-cols-[220px_1fr_auto]">
            <select
              value={selectedPlayerId}
              onChange={(event) => setSelectedPlayerId(event.target.value)}
              disabled={!canMessage || list.players.length === 0}
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus:border-ring disabled:opacity-50"
            >
              <option value="">Select online player…</option>
              {list.players.map((player) => (
                <option key={player.databaseId} value={player.databaseId}>
                  {player.username} · DB {player.databaseId}
                </option>
              ))}
            </select>
            <Input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Administrator alert message"
              maxLength={240}
              disabled={!canMessage}
            />
            <Button
              type="submit"
              disabled={!canMessage || !selectedPlayer || !message.trim() || isSending}
            >
              <MessageSquare />
              {isSending ? 'Sending…' : 'Send alert'}
            </Button>
          </form>

          {mutationStatus ? <p className="text-xs text-muted-foreground">{mutationStatus}</p> : null}
        </CardContent>
      </Card>

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
