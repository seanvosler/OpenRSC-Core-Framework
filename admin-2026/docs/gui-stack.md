# Admin 2026 GUI Stack

_Last updated: 2026-09-26_

This document defines the preferred frontend architecture and design system for Admin 2026.

The frontend goal is:

> **2003 visual language, 2026 interaction design.**

Admin 2026 should feel visually connected to early/mid-2000s RuneScape-era websites and tooling while preserving modern accessibility, responsiveness, performance, and developer ergonomics.

## Primary goals

The GUI stack should be:

- easy for agents to understand and extend
- strongly typed
- explicit about server contracts
- optimized for tables, logs, charts, diagrams, and operational workflows
- easy to theme deeply
- lightweight enough to remain a frontend rather than becoming a second backend
- compatible with a Java/OpenRSC API and live event stream
- testable at unit, component, and browser levels

## Recommended stack

| Layer | Choice | Role |
|---|---|---|
| App | React + TypeScript + Vite | SPA runtime and build tooling |
| UI system | shadcn/ui + Base UI | Source-owned accessible primitives |
| Styling | Tailwind CSS 4 | Design tokens, utilities, responsive layout |
| Icons | Lucide | Consistent iconography |
| Server state | TanStack Query | Queries, caching, mutations, invalidation |
| Routing | TanStack Router | Typed routes and search params |
| Tables | TanStack Table v9 | Headless typed data grids |
| Charts | Recharts via shadcn chart patterns | Operational metrics visualization |
| Diagrams | React Flow / `@xyflow/react` | Plugin, quest, event, topology diagrams |
| Forms | React Hook Form + Zod | Typed forms and validation |
| API contracts | OpenAPI-generated TypeScript client/types | Java ↔ TypeScript contract bridge |
| Unit/component tests | Vitest + React Testing Library | Fast frontend verification |
| Browser tests | Playwright | End-to-end admin workflows |

## Why Vite

OpenRSC is already the backend.

Admin 2026 does not need a second Node application server unless a future requirement proves otherwise.

Preferred topology:

```text
OpenRSC Java Server
├── game runtime
├── admin REST API
├── admin live event stream
└── authentication / authorization
        |
        v
Admin 2026 SPA
React + TypeScript + Vite
```

Benefits:

- minimal runtime architecture
- fast local development
- straightforward static deployment
- fewer moving parts
- clear ownership of security/auth on the Java side
- easy integration with a reverse proxy or static asset serving later

## Why shadcn/ui

Admin 2026 should favor source-owned UI primitives over a large opaque component framework.

shadcn/ui is a strong fit because components live in our repository and can be inspected, modified, themed, and tested directly.

This is especially useful for agentic development:

- agents can inspect the actual component implementation
- patterns remain local and discoverable
- customization does not require wrapper layers
- accessibility primitives remain standardized
- theme changes can be applied consistently

Use shadcn components as a starting point, not as a constraint.

## Theme strategy

The application should use modern semantic design tokens with an RSC-inspired default theme.

Do **not** hardcode nostalgic colors throughout components.

Create a theme layer such as:

```text
src/theme/
├── tokens.css
├── rsc-classic.css
└── modern-dark.css
```

Suggested RSC visual tokens:

```text
--rsc-stone
--rsc-charcoal
--rsc-parchment
--rsc-bronze
--rsc-gold
--rsc-forest
--rsc-burgundy
--rsc-text
--rsc-muted
--rsc-border-light
--rsc-border-dark
```

Map these onto semantic application tokens such as:

```text
--background
--foreground
--card
--card-foreground
--primary
--primary-foreground
--secondary
--destructive
--muted
--border
--input
--ring
```

### Visual direction

Use:

- charcoal and stone backgrounds
- parchment/sand content surfaces
- bronze/dull-gold borders
- forest green navigation accents
- burgundy/desaturated red destructive states
- subtle 1–2px beveled borders
- inset highlights and separators
- compact information density
- small pixel/bitmap-inspired accent typography where appropriate

Do not sacrifice:

- keyboard navigation
- focus states
- readable font sizing
- contrast
- responsive layout
- semantic HTML
- accessible dialogs/forms
- good loading/error states

## Layout concept

A desktop-first operations layout is appropriate, while still supporting smaller screens.

Conceptually:

```text
+------------------------------------------------------+
| OpenRSC Control Centre             World: Preservation |
+--------------+---------------------------------------+
| Overview     | SERVER STATUS                         |
| Players      |                                       |
| World        | Online 143       Tick 612 ms          |
| Plugins      | NPCs 1,284       Late 0 ms            |
| Utilities    | Memory 624 MB     Plugins 386          |
| Logs         |                                       |
| Developer    +---------------------------------------+
|              | RECENT ACTIVITY                       |
|              | 14:33 Alice logged in                 |
|              | 14:32 Plugin invoked                  |
+--------------+---------------------------------------+
```

Implementation should remain normal responsive React layout, not literal retro window chrome.

## Folder structure

Organize primarily by domain.

Recommended shape:

```text
admin-2026/web/
├── src/
│   ├── app/
│   │   ├── router.tsx
│   │   ├── providers.tsx
│   │   └── shell/
│   │
│   ├── features/
│   │   ├── overview/
│   │   ├── players/
│   │   ├── plugins/
│   │   ├── utilities/
│   │   ├── world/
│   │   ├── logs/
│   │   └── developer/
│   │
│   ├── api/
│   │   ├── client.ts
│   │   ├── queries/
│   │   └── generated/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── data-table/
│   │   ├── charts/
│   │   ├── diagrams/
│   │   └── layout/
│   │
│   ├── theme/
│   │   ├── tokens.css
│   │   ├── rsc-classic.css
│   │   └── modern-dark.css
│   │
│   └── lib/
│
└── tests/
```

Rules:

- domain-specific code belongs under `features/`
- truly reusable primitives belong under `components/`
- generated API types are never manually edited
- API access should not be scattered directly through components
- styling tokens live in `theme/`

## API contract strategy

Java and TypeScript contracts should not be maintained manually in parallel.

Preferred flow:

```text
Java Admin DTOs / routes
        ↓
OpenAPI schema
        ↓
generated TypeScript client + types
        ↓
TanStack Query wrappers
        ↓
feature components
```

Benefits:

- one authoritative contract
- frontend compile errors when backend contracts change
- less agent confusion
- fewer duplicated type definitions
- easier API discovery

Generated code should live under:

```text
src/api/generated/
```

and should be treated as generated-only.

## Data fetching

Use TanStack Query for server state.

Patterns:

- one query key convention
- feature-local query wrappers
- explicit invalidation after mutations
- bounded refetch intervals
- polling only for low-frequency state
- live events for meaningful changes

Example conceptual query keys:

```text
['server', serverId, 'status']
['server', serverId, 'players']
['server', serverId, 'player', playerId]
['server', serverId, 'plugins']
['server', serverId, 'logs', filters]
```

Do not put transient UI-only state into TanStack Query.

## Live events

Use WebSocket or SSE for meaningful live changes.

Good live-event candidates:

- player login/logout
- admin action completed
- plugin failure
- plugin reload
- server lifecycle change
- important world/moderation events

Do not stream every tick or every packet by default.

Live events should update/invalidate TanStack Query state rather than create a second parallel state model.

## Tables

Tables are core infrastructure for this project.

Expected table-heavy areas include:

- players
- plugins
- quests
- NPCs
- objects
- shops
- items
- spawns
- logs
- trades
- login history
- staff actions
- packet opcodes
- plugin timings
- snapshots

Build a consistent internal `DataTable` pattern over TanStack Table.

Expected capabilities:

- sorting
- filtering
- global search
- pagination
- column visibility
- row selection
- row actions
- saved preferences where useful
- server-side pagination for large datasets

Do not reinvent table behavior per feature.

## Charts

Use Recharts through shared chart primitives.

Primary chart use cases:

- tick duration over time
- tick-stage breakdown
- packet rates
- packet latency
- JVM memory
- player population
- plugin invocation rates
- plugin execution timing
- moderation/economy trends

Charts should have:

- consistent tooltip behavior
- consistent date/time formatting
- empty/error/loading states
- accessible text equivalents where practical

Do not create charts for data better expressed as a table or single metric.

## Diagrams

Use React Flow for interactive node/edge diagrams.

Potential Admin 2026 uses:

### Plugin graph

```text
Plugin
 ├── TalkToNpcTrigger
 ├── ObjectActionTrigger
 └── PlayerKilledTrigger
```

### Quest flow

```text
NPC / trigger
     ↓
Quest stage
     ↓
required item/action
     ↓
next stage
```

### Runtime topology

```text
Client
  ↓
Netty
  ↓
Packet parser
  ↓
Player / World
  ↓
Plugin trigger
  ↓
Game event
  ↓
Database/logging
```

Diagrams should be used when relationships matter, not simply for decoration.

## Forms and administrative actions

Use React Hook Form + Zod for operator forms.

Administrative forms should expose:

- target
- typed fields
- validation
- required capability
- danger level
- optional reason
- confirmation behavior
- result
- audit reference

Potential danger levels:

```text
safe
caution
destructive
critical
```

These levels are presentation hints; authorization remains server-side.

## Admin utility catalog

Administrative operations should be discoverable and consistently represented.

A utility descriptor may include:

```text
id
name
category
description
requiredCapability
inputSchema
dangerLevel
supportsDryRun
auditType
```

This metadata is for UI discovery and form composition.

It must never become more authoritative than server-side validation and command behavior.

## Routing

Use typed routes.

Likely route tree:

```text
/
/overview
/players
/players/:playerId
/plugins
/plugins/:pluginId
/utilities
/world
/logs
/developer
```

Server/world context should be represented consistently in route/search state.

## State ownership

Use:

- TanStack Query for server state
- URL/search params for shareable navigation/filter state
- component/local state for temporary UI state
- small context providers only for global UI concerns such as theme/authenticated operator

Avoid introducing a broad client state store until a demonstrated need exists.

## Testing strategy

### Vitest

Test:

- utility functions
- DTO/view-model transforms
- table filter helpers
- form schemas
- query helpers

### React Testing Library

Test:

- important components
- permission-based rendering
- loading/error/empty states
- admin utility forms

### Playwright

Test critical workflows:

- login/auth bootstrap
- server overview loads
- find a player
- inspect a player
- inspect plugins
- execute a safe admin action
- unauthorized action is unavailable/rejected
- live event causes visible update

## Accessibility

Retro styling must not reduce accessibility.

Requirements:

- visible keyboard focus
- semantic controls
- labels for all form elements
- keyboard-operable tables/dialogs
- no color-only status meanings
- sufficient contrast
- reduced-motion support where appropriate

## Agentic development rules

Agents should be able to infer where work belongs.

Rules:

1. Put feature-specific UI under the corresponding `features/<domain>/` directory.
2. Add generic reusable components only after at least one real use case exists.
3. Never edit generated API files manually.
4. Prefer existing shared table/chart/form patterns.
5. Do not fetch APIs directly from arbitrary components.
6. Keep theme values in tokens rather than hardcoded component CSS.
7. Add tests for new admin mutation workflows.
8. Keep visual nostalgia separate from business logic.

## Implementation status

The frontend scaffold described here now exists in `admin-2026/web/`.

Completed:

- Vite + React + TypeScript scaffold
- Tailwind CSS 4
- shadcn/ui initialization and core primitives
- TanStack Router
- TanStack Query provider
- RSC Classic semantic theme tokens
- application shell/sidebar and placeholder domain routes
- representative mock overview using shadcn tables/cards, Recharts, and React Flow
- Vitest + React Testing Library smoke test
- successful production build and browser render

Installed but not yet abstracted into shared project patterns:

- TanStack Table
- React Hook Form + Zod
- Playwright

Still to implement:

- reusable `DataTable`
- shared chart/diagram primitives
- reusable admin action/form pattern
- OpenAPI generation workflow
- Playwright browser-test baseline
- route-level lazy loading/code splitting
- optional Modern Dark theme

The current theme tokens live in `src/index.css` during the scaffold phase. They may be split into `src/theme/` once the theme system grows; agents should not create that split merely for cosmetic organization.

## Initial scaffold milestone

The initial GUI scaffold target was:

- Vite + React + TypeScript
- Tailwind CSS 4
- shadcn/ui base components
- TanStack Router
- TanStack Query
- theme token system
- RSC Classic theme
- application shell/sidebar
- placeholder domain routes
- shared DataTable foundation
- shared metric/card primitives
- OpenAPI client generation wiring
- Vitest
- Playwright

Most of this scaffold now exists. Use `docs/tasklist.md` as the authoritative source for which remaining scaffold items are incomplete; do not infer completion from this design document alone.

## Decision summary

The preferred GUI baseline is:

```text
React
TypeScript
Vite

shadcn/ui
Base UI
Tailwind CSS 4
Lucide

TanStack Query
TanStack Table
TanStack Router

React Flow
Recharts

React Hook Form
Zod

OpenAPI-generated client

Vitest
React Testing Library
Playwright
```

Primary design rule:

> Build accessible modern components first. Apply the RSC identity through tokens, layout, typography, borders, and composition rather than through outdated interaction patterns.
