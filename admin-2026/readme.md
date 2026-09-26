# Admin 2026

Admin 2026 is a GUI control plane for OpenRSC.

Its central purpose is to make OpenRSC's existing administrative tools, plugin system, runtime state, logs, diagnostics, and server data accessible through a modern browser-based interface.

The project should prefer **surfacing and organizing existing OpenRSC capabilities** over inventing parallel systems.

## Central goal

Admin 2026 should answer four questions for operators and developers:

1. **What is happening right now?**
2. **What data and tools does the server already expose?**
3. **What administrative actions can I safely perform?**
4. **What plugins/content systems are loaded, active, slow, failing, or reloadable?**

The working sequence is:

```text
inventory
   ↓
expose
   ↓
visualize
   ↓
operate
```

That sequence should guide implementation priorities.

## Product definition

Admin 2026 is not just a moderation panel.

It is intended to become the primary GUI for:

- server health and status
- live world state
- player inspection
- moderation
- administrative utilities
- plugin/content inspection
- plugin utilities
- runtime diagnostics
- logs and historical data
- developer/debug tooling
- multi-world operations where applicable

OpenRSC remains authoritative.

The browser never becomes a second game server and never gains arbitrary access to mutable Java objects.

## Core product principle

If OpenRSC already has a capability, Admin 2026 should expose it cleanly before creating a new one.

Examples:

```text
existing Server tick metrics
        ↓
ServerStatus / TickMetrics DTO
        ↓
admin API
        ↓
dashboard charts/cards
```

```text
existing staff command behavior
        ↓
explicit admin service method
        ↓
authorized API command
        ↓
GUI action + audit record
```

```text
PluginHandler state
        ↓
PluginStatus DTOs
        ↓
plugin API
        ↓
plugin explorer / diagnostics UI
```

## Existing OpenRSC capabilities to surface

### Server/runtime

- server lifecycle
- world instances
- TCP/WebSocket listeners
- uptime
- tick duration
- tick lateness
- tick-stage timings
- packet opcode counts and timings
- JVM/runtime state
- multiple configured servers via `Server.serversList`

### World state

- players
- NPCs
- game objects
- shops
- quests
- minigames
- clans
- parties
- market
- regions
- snapshots
- pathfinding/debug state

### Administrative tools

OpenRSC already contains a mature command ecosystem including operations such as:

- message
- teleport
- kick
- mute/unmute
- ban/unban
- save all
- broadcast
- graceful update/restart
- shutdown
- player stat/inventory/bank operations
- spawn/remove NPCs/items/objects
- event controls
- world/debug utilities

Admin 2026 should provide safe GUI wrappers around useful operations rather than exposing arbitrary command strings.

### Plugin system

OpenRSC already has:

- plugin discovery
- trigger registration
- plugin instances
- quests
- minigames
- shops
- plugin execution
- plugin thread pool
- load/unload/reload behavior

The plugin system is a first-class Admin 2026 domain.

### Data/logging

OpenRSC already exposes or persists significant data around:

- players
- accounts
- moderation
- logins
- staff actions
- trades
- chat/logging
- spawns
- world definitions
- server activity

Before introducing new storage, Admin 2026 should inventory and reuse what already exists.

## Dashboard information architecture

### 1. Overview

The landing page should answer: "Is the server healthy?"

Potential widgets:

- active server/world
- uptime
- online player count
- NPC/entity counts
- tick duration
- tick lateness
- tick-stage timings
- packet throughput/timing
- JVM memory
- database health
- listener/network state
- plugin state
- recent warnings/errors
- recent admin actions

### 2. Players

Searchable player list and inspector.

Potential views:

- live online players
- profile/identity
- coordinates
- stats
- inventory
- equipment
- bank
- quests
- fatigue/health
- clan/party
- current activity
- moderation state
- recent events/logins
- account relationships where policy allows

### 3. Admin utilities

A discoverable GUI catalog of supported administrative actions.

Examples:

- message player
- teleport player
- kick
- mute/unmute
- ban/unban
- broadcast
- save all
- graceful restart/update
- shutdown
- world/event controls
- spawn/debug utilities

Each utility should clearly show:

- required capability
- inputs
- target
- confirmation where appropriate
- result
- audit record

### 4. Plugins & content

A primary workspace for the OpenRSC plugin system.

Display:

- loaded plugin classes
- trigger types
- quests
- minigames
- shops
- registrations
- invocation counts
- execution timing
- recent failures
- reload state
- dependency/content relationships where available

Planned utilities may include:

- inspect plugin
- inspect triggers
- filter errors
- reload supported plugin sets
- compare plugin activity over time
- trace a quest/content flow

### 5. World tooling

Potential views:

- NPC inspector
- object inspector
- shop inspector
- spawn browser
- snapshot browser
- region/tile information
- live world map
- pathfinding/debug overlays

### 6. Logs & history

Use existing OpenRSC persistence where possible.

Potential areas:

- staff actions
- login history
- moderation history
- trade history
- chat logs
- generic logs
- plugin failures
- server errors
- economy activity
- historical operational metrics

### 7. Developer tools

Potential tools:

- tick profiler
- packet opcode metrics
- event/debug stream
- plugin timing
- snapshot inspection
- pathfinding diagnostics
- PCAP controls/inspection where safe
- runtime configuration viewer

## Architecture

Use a narrow boundary:

```text
Browser GUI
    |
    | HTTP queries / explicit commands
    | WebSocket or SSE live events
    v
Admin 2026 API / adapter layer
    |
    | DTOs
    | authorization
    | audit
    | safe adapters
    v
Existing OpenRSC systems
    |
    +-- Server
    +-- World
    +-- Player / NPC / entities
    +-- PluginHandler
    +-- GameEventHandler
    +-- GameDatabase / logging
    +-- existing admin command/domain behavior
```

Admin 2026 should primarily be an **adapter and presentation layer**.

## Key integration points

### `Server.java`

Primary source for lifecycle, world reference, plugin handler, event handler, database, networking, uptime, tick timings, packet metrics, and server registry.

### `World.java`

Primary source for players, NPCs, shops, quests, minigames, world state, snapshots, and pathfinding/debug state.

### `Player.java`

Primary source for live player inspection. Never serialize `Player` directly.

### `PluginHandler.java`

Primary source for plugin inventory, trigger relationships, execution, and reload behavior.

### `GameDatabase.java`

Primary source for persisted data and existing administrative/logging capabilities.

### `Group.java`

Existing staff identities can seed dashboard role mappings, but API authorization should remain capability-oriented.

## Admin API model

### Queries

Read-only access to existing server data.

Examples: `server.status`, `servers.list`, `world.status`, `players.list`, `players.get`, `plugins.list`, `plugins.get`, `logs.search`, `snapshots.list`.

### DTOs

Stable transport objects such as `ServerStatus`, `WorldStatus`, `PlayerSummary`, `PlayerDetails`, `PluginSummary`, `PluginDetails`, `TickMetrics`, `PacketMetrics`, `AdminUtility`, and `AuditRecord`.

### Commands

Explicit wrappers around supported operations such as `player.message`, `player.teleport`, `player.kick`, `player.mute`, `player.ban`, `world.broadcast`, `world.saveAll`, `server.restart`, and `plugin.reload`.

Never expose arbitrary `::command` execution from the browser.

### Events

Use live events for meaningful runtime changes such as login/logout, deaths, moderation actions, plugin failures/reloads, server lifecycle changes, and selected world events.

Do not stream every packet or every tick by default.

## Security

The GUI is privileged infrastructure.

Requirements:

- disabled or private-bound by default
- authenticated operator identity
- capability-based authorization
- server-side validation
- audit every mutation
- no arbitrary Java execution
- no arbitrary SQL
- no shell access
- no credential exposure
- sensitive player/account fields role-gated

Technical availability does not imply that sensitive data should be exposed.

Private messages, IP addresses, linked accounts, and recovery/security data require explicit policy decisions.

## Performance

Admin 2026 must not interfere with game operation.

Prefer:

- existing counters and metrics
- snapshot DTOs
- bounded event queues
- rate-limited expensive queries
- asynchronous dashboard delivery
- incremental aggregation

Avoid:

- full-world serialization
- synchronous remote work in game processing
- unbounded event streams
- duplicate instrumentation where OpenRSC already records the data

## Implementation strategy

The project should progress in this order:

### 1. Inventory

Document what OpenRSC already provides: runtime metrics, staff/admin tools, plugin capabilities, logs, DB queries, snapshots, and developer/debug utilities.

### 2. Expose

Create safe, typed API adapters over existing capabilities.

### 3. Visualize

Build UI surfaces that make the exposed data useful.

### 4. Operate

Add explicit authorized GUI actions for existing administrative tools.

### 5. Extend

Only after the above should Admin 2026 add significant new server capabilities.

## First useful release

A useful first release should include:

- server overview
- live player list
- player inspector
- plugin inventory
- admin utility catalog
- login/logout live feed
- one or two safe administrative actions
- audit trail

This is more valuable than a broad empty dashboard shell.

## Current implementation status

The first frontend scaffold now exists under `admin-2026/web/`.

Implemented and verified:

- React + TypeScript + Vite SPA
- Tailwind CSS 4 + shadcn/ui primitives
- TanStack Router and TanStack Query providers
- TanStack Table, Recharts, React Flow, React Hook Form, and Zod dependencies
- RSC Classic theme tokens and responsive application shell
- routed areas for Overview, Players, World, Plugins, Utilities, Logs, Developer, and Settings
- mock-backed overview with server metrics, player table, plugin/content cards, tick chart, plugin-flow diagram, admin utilities, and activity feed
- reserved `src/api/generated/` location for future OpenAPI-generated client/types
- Vitest + React Testing Library smoke-test baseline
- successful production build
- successful local browser render of the dashboard

The overview is intentionally **mock-backed** today. No Java Admin API has been added yet, and the GUI must not imply that sample values or actions are connected to a live OpenRSC server.

The next implementation milestone is to inventory the existing OpenRSC runtime surfaces and expose the first real read-only Java contract, beginning with `ServerStatus` / `WorldStatus`.

### Local frontend development

From the repository root:

```bash
cd admin-2026/web
npm install
npm run dev
```

Verification:

```bash
npm run test
npm run build
```

The working frontend architecture is documented in `admin-2026/docs/gui-stack.md`, and current work state is tracked in `admin-2026/docs/tasklist.md`.

## Non-goals

- rewrite OpenRSC
- replace its plugin system
- replace its database layer
- recreate existing admin commands
- expose arbitrary command execution
- build a second source of truth
- introduce distributed infrastructure without need
- make dashboard availability required for gameplay

## Progress tracking

The canonical lightweight tracker is `admin-2026/docs/tasklist.md`.

The tasklist should reflect the same guiding sequence:

**inventory → expose → visualize → operate → extend**
