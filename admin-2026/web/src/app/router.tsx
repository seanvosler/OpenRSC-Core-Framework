import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'

import { AppShell } from '@/app/shell/app-shell'
import { OverviewPage } from '@/features/overview/overview-page'
import { PlayersPage } from '@/features/players/players-page'
import { PluginsPage } from '@/features/plugins/plugins-page'
import { SyntheticPlayersPage } from '@/features/synthetic/synthetic-players-page'
import { PlaceholderPage } from '@/features/shared/placeholder-page'

const rootRoute = createRootRoute({ component: AppShell })

const overviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: OverviewPage,
})

const playersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/players',
  component: PlayersPage,
})

const pluginsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/plugins',
  component: PluginsPage,
})

const syntheticPlayersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/developer/synthetic-players',
  component: SyntheticPlayersPage,
})

const makePlaceholder = (path: string, title: string, description: string) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path,
    component: () => <PlaceholderPage title={title} description={description} />,
  })

const routeTree = rootRoute.addChildren([
  overviewRoute,
  playersRoute,
  pluginsRoute,
  syntheticPlayersRoute,
  makePlaceholder('/world', 'World', 'Entities, shops, spawns, snapshots, maps, and world diagnostics.'),
  makePlaceholder('/utilities', 'Utilities', 'Discoverable wrappers around safe OpenRSC administrative actions.'),
  makePlaceholder('/logs', 'Logs', 'Staff, login, trade, moderation, and operational history.'),
  makePlaceholder('/developer', 'Developer', 'Tick, packet, event, pathfinding, and runtime debug tools.'),
  makePlaceholder('/settings', 'Settings', 'Admin 2026 preferences, theme, and environment configuration.'),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
