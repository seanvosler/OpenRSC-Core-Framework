import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'

import { AppShell } from '@/app/shell/app-shell'
import { OverviewPage } from '@/features/overview/overview-page'
import { PlaceholderPage } from '@/features/shared/placeholder-page'

const rootRoute = createRootRoute({ component: AppShell })

const overviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: OverviewPage,
})

const makePlaceholder = (path: string, title: string, description: string) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path,
    component: () => <PlaceholderPage title={title} description={description} />,
  })

const routeTree = rootRoute.addChildren([
  overviewRoute,
  makePlaceholder('/players', 'Players', 'Live player search, inspection, moderation, and support tools.'),
  makePlaceholder('/world', 'World', 'Entities, shops, spawns, snapshots, maps, and world diagnostics.'),
  makePlaceholder('/plugins', 'Plugins', 'Plugin inventory, triggers, quests, diagnostics, and reload controls.'),
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
