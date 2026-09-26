import type { ColumnDef } from '@tanstack/react-table'
import { Boxes, Puzzle, ScrollText, Store, Workflow } from 'lucide-react'

import type { PluginSummary } from '@/api/plugins'
import { usePluginInventory } from '@/api/queries/plugin-inventory'
import { DataTable, dataTableFeatures } from '@/components/data-table/data-table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function displayName(plugin: PluginSummary) {
  return plugin.quest?.name ?? plugin.minigame?.name ?? plugin.simpleName
}

function shortPackage(packageName: string) {
  return packageName.replace(/^com\.openrsc\.server\.plugins\./, '')
}

const columns: ColumnDef<typeof dataTableFeatures, PluginSummary>[] = [
  {
    accessorFn: displayName,
    id: 'name',
    header: 'Plugin',
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-sky-100">{displayName(row.original)}</div>
        <div className="font-mono text-[11px] text-muted-foreground">{row.original.simpleName}</div>
      </div>
    ),
  },
  {
    accessorKey: 'kinds',
    header: 'Kinds',
    cell: ({ row }) => (
      <div className="flex max-w-56 flex-wrap gap-1">
        {row.original.kinds.map((kind) => (
          <Badge key={kind} variant="outline" className="text-[10px]">
            {kind}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    accessorFn: (plugin) => plugin.triggerNames.join(' '),
    id: 'triggers',
    header: 'Triggers',
    cell: ({ row }) => (
      <div className="max-w-md text-xs text-muted-foreground">
        {row.original.triggerNames.length
          ? row.original.triggerNames.slice(0, 4).join(', ') +
            (row.original.triggerNames.length > 4
              ? ` +${row.original.triggerNames.length - 4}`
              : '')
          : '—'}
      </div>
    ),
  },
  {
    accessorFn: (plugin) => shortPackage(plugin.packageName),
    id: 'package',
    header: 'Package',
    cell: ({ row }) => (
      <div className="max-w-72 truncate font-mono text-[11px] text-muted-foreground">
        {shortPackage(row.original.packageName)}
      </div>
    ),
  },
  {
    accessorFn: (plugin) =>
      plugin.quest
        ? `${plugin.quest.members ? 'Members' : 'Free'} · ${plugin.quest.points} QP`
        : plugin.minigame
          ? plugin.minigame.members
            ? 'Members'
            : 'Free'
          : '',
    id: 'content',
    header: 'Content',
    cell: ({ row }) => {
      const plugin = row.original
      if (plugin.quest) {
        return (
          <span className="text-xs">
            {plugin.quest.members ? 'Members' : 'Free'} · {plugin.quest.points} QP
          </span>
        )
      }
      if (plugin.minigame) {
        return <span className="text-xs">{plugin.minigame.members ? 'Members' : 'Free'}</span>
      }
      return <span className="text-muted-foreground">—</span>
    },
  },
]
export function PluginsPage() {
  const query = usePluginInventory()
  const inventory = query.data?.servers[0]

  if (query.isPending) {
    return <div className="p-6 text-sm text-muted-foreground">Loading plugin inventory…</div>
  }

  if (query.isError || !inventory) {
    return (
      <div className="p-6">
        <Card className="panel-etched border-destructive/50">
          <CardHeader>
            <CardTitle>Plugin inventory unavailable</CardTitle>
            <CardDescription>
              Start OpenRSC with the Admin 2026 listener enabled, then refresh this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const metrics = [
    { label: 'Handlers', value: inventory.instantiatedPlugins, icon: Boxes },
    { label: 'Trigger types', value: inventory.triggerTypes, icon: Workflow },
    { label: 'Quests', value: inventory.quests, icon: ScrollText },
    { label: 'Minigames', value: inventory.minigames, icon: Puzzle },
    { label: 'Shops', value: inventory.shops, icon: Store },
  ]

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="rsc-title text-2xl font-semibold">Plugins & Content</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Live read-only inventory from {inventory.serverName}.
          </p>
        </div>
        <Badge variant="outline" className={inventory.reloading ? 'border-amber-500/40 text-amber-200' : 'border-emerald-500/40 text-emerald-300'}>
          {inventory.reloading ? 'Reloading' : 'Loaded'}
        </Badge>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
          <CardTitle>Instantiated plugin handlers</CardTitle>
          <CardDescription>
            Search and sort live handler metadata. No mutable plugin instances cross the API boundary.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={inventory.plugins}
            searchPlaceholder="Search plugin, trigger, package…"
          />
        </CardContent>
      </Card>
    </div>
  )
}
