# Admin 2026

A modern administration, observability, moderation, and live-world tooling layer for OpenRSC.

This directory contains the project plan and working documentation for adding a browser-based operations console to the OpenRSC Core Framework.

The game server remains authoritative. Admin 2026 observes server state, subscribes to operational events, and sends explicit validated administrative commands.

## Project context

Admin 2026 was originally explored against the 2003Scape Node.js server. The project moved to OpenRSC because OpenRSC provides a substantially richer and actively maintained RSC server foundation.

The architecture and goals remain useful, but implementation should now build on OpenRSC's existing systems rather than recreate them.

Important existing capabilities include:

- Java server runtime
- Netty networking
- configurable TCP/WebSocket server support
- multi-server configuration support in one process
- mature `World` and `Player` models
- plugin triggers and plugin reload infrastructure
- quests, minigames, shops, clans, parties and market systems
- MySQL and SQLite database implementations
- extensive game/staff logging
- mature admin/moderator commands
- staff groups and ranks
- packet timing/count instrumentation
- tick-stage timing instrumentation
- world snapshots
- PCAP logging support
- configurable worlds and feature flags

Admin 2026 should expose and organize these capabilities safely rather than build parallel versions.

## Architectural principle

Do not expose mutable game objects or arbitrary command execution to the browser.

Use a narrow administrative boundary:

```text
Browser dashboard
      |
      | HTTP queries / commands
      | WebSocket/SSE live events
      v
OpenRSC Admin API
      |
      | DTOs, authorization, command handlers, events
      v
OpenRSC server runtime
      |
      +-- Server
      +-- World
      +-- Player / NPC / entities
      +-- PluginHandler
      +-- GameEventHandler
      +-- GameDatabase / logging
      +-- existing staff commands
```

The OpenRSC server must continue to run normally when the dashboard is disabled or unavailable.

## Key OpenRSC integration points

### `server/src/com/openrsc/server/Server.java`

Primary runtime integration point.

It already owns or exposes:

- `World`
- `PluginHandler`
- `GameEventHandler`
- database implementation
- game logger
- player service
- packet filtering
- Netty server channels
- server lifecycle
- server start time
- tick timing metrics
- stage-level tick timings
- incoming/outgoing opcode counts and timings
- private-message counters
- multi-server registry via `Server.serversList`

This should be the first place investigated for server-level status DTOs.

### `server/src/com/openrsc/server/model/world/World.java`

Authoritative live world model.

It already owns or exposes:

- players
- NPCs
- shops
- quests
- minigames
- region manager
- party manager
- clan manager
- market
- world loader
- combat/world state
- snapshots
- pathfinding debug state

This is the natural source for live-world inspection.

### `server/src/com/openrsc/server/model/entity/player/Player.java`

Rich live player state including:

- identity/session information
- stats and experience
- inventory/equipment/bank
- quest stages
- settings
- social state
- trade
- clan/party membership
- combat/activity state
- moderation/rank-related state

Never serialize `Player` directly. Map selected fields into stable admin DTOs.

### `server/src/com/openrsc/server/plugins/handler/PluginHandler.java`

OpenRSC already has a mature plugin system.

It includes:

- trigger discovery
- plugin instance registry
- Guice injection
- quest/minigame/shop registration
- plugin execution
- plugin thread pool
- plugin unload/load/reload behavior

Admin 2026 should instrument this existing system rather than invent plugin metadata/loading from scratch.

### `server/src/com/openrsc/server/database/GameDatabase.java`

The database abstraction already exposes extensive player, moderation, account, logging, spawn and world operations.

Before creating new persistence tables or APIs, inspect existing logging/query structures.

### `server/src/com/openrsc/server/model/entity/player/Group.java`

Existing staff groups include:

- Owner
- Admin
- Super Moderator
- Moderator
- Developer
- Event
- Player Moderator
- Tester
- User

Admin 2026 can use these identities as inputs, but web authorization should still be capability-oriented internally.

## Proposed Admin 2026 stack

### Server-side admin module

Preferred initial direction:

- Java, inside the OpenRSC server project
- isolated under a package such as `com.openrsc.server.admin`
- minimal HTTP API
- WebSocket or SSE live event stream
- explicit DTO mapping
- explicit command handlers
- capability authorization
- reuse existing OpenRSC services and database logging where appropriate

Avoid introducing a second backend runtime unless there is a clear reason.

A useful package shape may be:

```text
server/src/com/openrsc/server/admin/
├── AdminService.java
├── AdminEventBus.java
├── auth/
├── commands/
├── dto/
├── routes/
└── telemetry/
```

This is a direction, not a fixed requirement.

### Dashboard

Recommended:

- React
- TypeScript
- Next.js or a lightweight Vite application
- TanStack Query
- Tailwind CSS
- shadcn/ui or similarly lightweight component primitives

Choose Next.js only if its server-side capabilities provide value. OpenRSC itself should remain the authoritative backend.

### Historical/admin data

OpenRSC already persists significant operational history.

Before creating a new analytics database:

1. inventory existing OpenRSC log tables and queries
2. identify missing event classes
3. extend existing logging where appropriate
4. introduce separate analytics storage only when necessary

Do not duplicate data simply because a dashboard wants it.

## Core contracts

Admin 2026 should distinguish four concepts.

### Queries

Read-only requests.

Examples:

- `server.status`
- `world.status`
- `players.list`
- `players.get`
- `entities.search`
- `plugins.list`
- `plugins.get`
- `logs.search`

### DTOs

Stable serialized representations.

Examples:

- `ServerStatus`
- `WorldStatus`
- `PlayerSummary`
- `PlayerDetails`
- `EntitySummary`
- `PluginStatus`
- `TickMetrics`
- `PacketMetrics`

DTOs should be smaller and safer than their OpenRSC model objects.

### Commands

Mutations must be explicit.

Examples:

- `player.message`
- `player.teleport`
- `player.kick`
- `player.mute`
- `player.giveItem`
- `world.broadcast`
- `world.saveAll`
- `server.restart`
- `plugin.reload`

Every command should:

1. validate input
2. authenticate the operator
3. authorize the capability
4. resolve targets safely
5. call authoritative OpenRSC behavior
6. record success/failure
7. create an audit record
8. emit an admin event where appropriate

Do not expose a browser endpoint that executes arbitrary `::commands`.

Existing OpenRSC commands are valuable implementation references, not the browser API.

### Events

Events describe facts that occurred.

Examples:

- `player.logged_in`
- `player.logged_out`
- `player.died`
- `trade.completed`
- `plugin.invoked`
- `plugin.failed`
- `server.tick_completed`
- `admin.command_executed`

Start with a small vocabulary.

## Existing observability to leverage

OpenRSC already tracks more server telemetry than the original Admin 2026 plan expected.

`Server.java` contains fields for:

- last tick duration
- lateness
- incoming packet processing duration
- event processing duration
- outgoing packet duration
- world update duration
- player processing duration
- NPC processing duration
- message queue duration
- client update duration
- cleanup duration
- walk action duration
- incoming opcode count/timing
- outgoing opcode count/timing

The first status/metrics API should expose these existing values before introducing new instrumentation.

## Dashboard areas

### Overview

Show:

- configured server/world name
- uptime
- player count
- NPC count
- server lifecycle state
- tick duration and lateness
- tick-stage timings
- JVM memory
- database health
- TCP/WebSocket listener status
- plugin status
- recent warnings/errors

### Players

Searchable live-player table and player inspector.

Potential fields:

- username
- database/player ID
- staff group
- combat level
- coordinates
- health
- fatigue
- session duration
- current activity
- quest state
- inventory/equipment/bank
- clan/party
- moderation state
- recent events

Role-gate sensitive information.

### Moderation

Build on OpenRSC's existing moderation system.

Potential features:

- player lookup
- mute/unmute
- kick
- ban/unban
- staff alerts
- account/IP relationship investigation
- login history
- staff action history
- chat logs where policy permits

Private-message visibility remains an explicit privacy/product decision.

### Plugins/content

Expose the existing plugin system:

- loaded plugin classes
- trigger interfaces
- quests/minigames/shops
- invocation counts
- execution timing
- errors
- reload state

OpenRSC already supports plugin load/unload behavior, so a future controlled plugin reload operation is more realistic here than it was in the 2003Scape plan.

### Developer tools

Potential tools:

- tick profiler
- packet opcode metrics
- snapshot browser
- PCAP/log controls where safe
- plugin timing
- pathfinding debug
- entity inspector
- event queue information

### World operations

Potential operations based on existing OpenRSC capabilities:

- broadcast
- save all
- graceful update/restart
- shutdown
- spawn/remove entities
- event controls
- world reload operations

These should be explicit, authorized, audited commands.

## Security model

Treat the admin surface as privileged infrastructure.

Requirements:

- disabled or private-bound by default
- authenticated operator identity
- explicit capabilities
- server-side validation
- audit every mutation
- no arbitrary Java execution
- no arbitrary SQL
- no shell access
- no direct exposure of database credentials
- no raw session/auth material in payloads

Existing OpenRSC group membership may seed role mappings, but capability checks should control actual dashboard permissions.

Example capabilities:

```text
server.read
server.restart
world.read
world.broadcast
players.read
players.message
players.teleport
players.kick
players.mute
players.ban
plugins.read
plugins.reload
logs.read
logs.staff
```

## Performance rules

The dashboard must not destabilize game processing.

Therefore:

- avoid full-world serialization
- do not synchronously perform remote calls in game/tick paths
- use bounded event queues
- aggregate counters incrementally
- rate-limit expensive queries
- avoid emitting high-volume packet events by default
- use existing timing counters where possible
- fail soft when dashboard consumers disappear

## First vertical slice

The first implementation milestone should remain intentionally small.

### Server side

Implement:

- isolated admin bootstrap
- private/local development access
- `ServerStatus` / `WorldStatus`
- `PlayerSummary`
- `PlayerDetails`
- read-only status endpoint
- player list endpoint
- player detail endpoint
- small admin event bus
- login/logout events
- live event transport
- one audited command, preferably player message first

### Frontend

Implement:

- dashboard shell
- server status view
- live player list
- player inspector
- login/logout feed
- one command UI

### Acceptance criteria

1. normal OpenRSC startup remains unchanged when admin is disabled
2. the server can run without the dashboard
3. the dashboard observes live players
4. login/logout state updates live
5. an authorized operator can perform one audited command
6. unauthorized mutation is rejected
7. admin/dashboard failure does not interrupt game processing

## Phased roadmap

### Phase 0 — OpenRSC architecture and baseline

- map server lifecycle/integration points
- verify local server startup
- identify supported Java/Gradle runtime
- record baseline tick/memory behavior
- inventory existing metrics/logging
- inventory existing admin/mod commands
- inventory database logging/query capabilities
- define DTO/event/command conventions
- define initial auth strategy
- define verification/test strategy

### Phase 1 — Observation

- admin bootstrap
- status API
- players API
- live event stream
- dashboard shell
- player inspector
- tick/packet metrics

### Phase 2 — Controlled operations

- capability model
- mutation audit integration
- message
- teleport
- kick
- mute/ban
- broadcast
- save-all
- graceful restart

### Phase 3 — Plugin observability

- plugin inventory
- trigger inventory
- invocation instrumentation
- timing/error reporting
- controlled reload
- quest/content diagnostics

### Phase 4 — World tooling

- entity inspector
- shops/spawns
- world map
- snapshots
- pathfinding/debug views

### Phase 5 — Historical analytics

- reuse/extend existing logs
- moderation history
- economy flows
- quest/content analytics
- operational trends

### Phase 6 — Multi-world control plane

OpenRSC can run multiple configured servers in one process, so first determine how much multi-world support can be provided directly from `Server.serversList` before adding external infrastructure.

Only add Redis or an external control plane if deployment topology actually requires it.

## Non-goals for the first release

- rewriting OpenRSC
- replacing its database layer
- replacing its networking protocol
- replacing its plugin system
- arbitrary remote command execution
- arbitrary Java/SQL/shell execution
- introducing microservices without need
- storing every packet indefinitely
- making dashboard state authoritative

## Progress tracking

The canonical lightweight tracker is:

- `admin-2026/docs/tasklist.md`

Humans and agents should read it before substantive work and update it as tasks move between **Doing**, **To Do**, **Done**, and **Back Burner**.

Detailed research and rationale belong in this README, `AGENTS.md`, or focused files under `admin-2026/docs/`.
