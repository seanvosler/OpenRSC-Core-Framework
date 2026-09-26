import { Link, Outlet } from '@tanstack/react-router'
import {
  Activity,
  Boxes,
  Bug,
  Earth,
  FileClock,
  Gauge,
  Settings,
  ShieldCheck,
  Bot,
  Users,
  Wrench,
} from 'lucide-react'

import { useServerStatus } from '@/api/queries/server-status'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { to: '/', label: 'Overview', icon: Gauge },
  { to: '/players', label: 'Players', icon: Users },
  { to: '/world', label: 'World', icon: Earth },
  { to: '/plugins', label: 'Plugins', icon: Boxes },
  { to: '/utilities', label: 'Utilities', icon: Wrench },
  { to: '/logs', label: 'Logs', icon: FileClock },
  { to: '/developer', label: 'Developer', icon: Bug },
  { to: '/developer/synthetic-players', label: 'Synthetic', icon: Bot },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const

export function AppShell() {
  const statusQuery = useServerStatus()
  const server = statusQuery.data?.servers[0]
  const isConnected = Boolean(server && !statusQuery.isError)
  const connectionLabel = statusQuery.isPending
    ? 'Connecting'
    : isConnected
      ? 'Online'
      : 'Disconnected'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="rsc-header sticky top-0 z-20 flex h-16 items-center gap-4 border-b px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-9 place-items-center rounded-md border border-primary/50 bg-primary/10 text-primary">
            <ShieldCheck className="size-5" />
          </div>
          <div className="min-w-0">
            <h1 className="rsc-title truncate text-xl font-semibold tracking-wide">OpenRSC Control Centre</h1>
            <p className="hidden text-[11px] uppercase tracking-[0.2em] text-muted-foreground sm:block">
              Manage · Monitor · Extend · Preserve
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3 text-sm">
          <Badge variant="outline" className="hidden border-primary/40 bg-primary/5 text-primary sm:inline-flex">
            <Earth className="size-3.5" /> {server?.name ?? 'No server'}
          </Badge>
          <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${isConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.7)]' : 'bg-red-400'}`} />
            <span className="hidden text-muted-foreground sm:inline">{connectionLabel}</span>
          </div>
          <Separator orientation="vertical" className="h-7" />
          <div className="text-right leading-tight">
            <div className="font-medium">Local Operator</div>
            <div className="text-xs text-muted-foreground">Auth pending</div>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-4rem)] grid-cols-[72px_1fr] md:grid-cols-[190px_1fr]">
        <aside className="rsc-sidebar border-r px-2 py-4 md:px-3">
          <nav className="space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to as never}
                activeOptions={{ exact: to === '/' }}
                className="group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground [&.active]:bg-primary/15 [&.active]:text-primary"
              >
                <Icon className="size-5 shrink-0" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-8 hidden rounded-md border border-border/70 bg-card/30 p-3 text-xs text-muted-foreground md:block">
            <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
              <Activity className="size-4 text-primary" />
              {server?.name ?? 'OpenRSC'}
            </div>
            “Same world. New possibilities.”
          </div>
        </aside>

        <main className="min-w-0 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
