# AGENTS.md

Guidance for agentic coding workers contributing to Admin 2026 in the OpenRSC Core Framework.

Read this file, `admin-2026/readme.md`, `admin-2026/docs/tasklist.md`, and `admin-2026/docs/gui-stack.md` before implementing substantive Admin 2026 work. Read `admin-2026/docs/next-slices.md` when working on the current plugin/player/event sequence.

## Mission

Build a secure GUI control plane for OpenRSC that inventories, exposes, visualizes, and safely operates existing server capabilities before adding new ones.

The OpenRSC server remains authoritative.

The dashboard:

- reads explicit serialized views of server state
- subscribes to explicit operational events
- sends explicit validated commands
- never mutates arbitrary Java objects directly
- never executes arbitrary in-game command strings supplied by the browser

## Current frontend baseline

A working SPA scaffold exists at `admin-2026/web/`.

Current facts:

- server health/status is live through `GET /admin/api/status`
- activity events and admin actions are still mock/planned
- plugin inventory and the Plugins route are live
- online player summaries and the Players route are live
- Vite/React/TypeScript is the frontend runtime
- Tailwind CSS 4 + shadcn/ui provide the source-owned UI foundation
- TanStack Router/Query are wired
- Recharts displays a live rolling tick-duration series
- React Flow is already used for the plugin-flow concept
- Vitest + React Testing Library cover provider and status-client behavior
- `npm run build` currently succeeds
- OpenAPI client generation, reusable DataTable/form abstractions, Playwright E2E, and route-level code splitting remain unfinished
- the current read-only backend contract is documented in `docs/backend-api.md`

For frontend work, preserve the domain-oriented structure described in `docs/gui-stack.md`. Generated API code belongs in `src/api/generated/` and must never be edited manually.

## Current recommended next slice

Prefer **login/logout events** next. The plugin inventory and online-player summary slices are complete.

The running default world immediately provides substantial plugin data even with zero connected players:

- loaded plugin classes
- trigger registrations
- quests
- minigames
- shops

Use a DTO/snapshot boundary. If `PluginHandler` needs a new accessor, return immutable/snapshot metadata rather than exposing its mutable maps, instances, or loader directly.

Follow plugin inventory with a small `PlayerSummary` API. The initial player contract should exclude IP addresses and other sensitive account/security data.

## Progress tracking

The canonical lightweight progress tracker is:

- `admin-2026/docs/tasklist.md`

When work begins, move the relevant task into **Doing**. Keep **Doing** small, normally one or two items.

When work completes, move it into **Done** in the same PR/commit series whenever practical.

Use only:

- **Doing**
- **To Do**
- **Done**
- **Back Burner**

Keep long design discussion out of the tasklist.

## Repository context

This project is an actively maintained Java RuneScape Classic server framework.

Important facts:

- default branch in this fork: `develop`
- server entrypoint: `com.openrsc.server.Server`
- server build: `server/build.gradle`
- networking: Netty
- database implementations: MySQL and SQLite
- logging: Log4j plus OpenRSC game/staff logging
- plugin system: trigger interfaces loaded and managed by `PluginHandler`
- plugin dependency injection: Guice
- tests: JUnit 5 is already configured in the server Gradle build
- multiple configured server instances can exist in one process via `Server.serversList`

Do not carry assumptions from the old 2003Scape/Node plan into implementation.

## First files to inspect

Before modifying the runtime, inspect at minimum:

- `server/src/com/openrsc/server/Server.java`
- `server/src/com/openrsc/server/ServerConfiguration.java`
- `server/src/com/openrsc/server/model/world/World.java`
- `server/src/com/openrsc/server/model/entity/player/Player.java`
- `server/src/com/openrsc/server/model/entity/player/Group.java`
- `server/src/com/openrsc/server/plugins/handler/PluginHandler.java`
- `server/src/com/openrsc/server/event/rsc/handler/GameEventHandler.java`
- `server/src/com/openrsc/server/database/GameDatabase.java`
- relevant classes under `server/src/com/openrsc/server/database/impl/`
- relevant command plugins under `server/plugins/`
- `Commands.md`

If work touches networking, inspect the Netty pipeline classes under:

- `server/src/com/openrsc/server/net/`

If work touches plugin execution, inspect:

- `server/src/com/openrsc/server/plugins/`
- `server/src/com/openrsc/server/plugins/triggers/`
- `server/src/com/openrsc/server/plugins/handler/`

## Preserve the server runtime

Admin 2026 must remain optional.

A dashboard outage must not:

- stop the game loop
- prevent login
- block saves
- break plugin execution
- break TCP/WebSocket game clients
- make normal server startup depend on a frontend

Admin initialization should fail soft whenever possible.

## Use existing OpenRSC capabilities first

Before creating a new subsystem, check whether OpenRSC already has one.

Examples:

- staff groups already exist
- staff/admin commands already exist
- plugin reload exists
- database logging already exists
- world snapshots already exist
- packet timing/count metrics already exist
- tick-stage timing fields already exist
- PCAP logging already exists
- server lifecycle controls already exist

Admin 2026 should expose and organize these safely rather than recreate them.

## DTO rule

Never serialize OpenRSC model classes wholesale.

Do not directly serialize:

- `Server`
- `World`
- `Player`
- `Npc`
- `GameObject`
- database model objects unless specifically designed for transport

Create DTOs with explicit fields.

Reasons:

- circular references
- accidental sensitive data
- unstable contracts
- oversized payloads
- coupling to implementation details
- accidental method/getter behavior

Good:

```java
public record PlayerSummary(
    int id,
    String username,
    int combatLevel,
    int x,
    int y
) {}
```

Bad:

```java
return player;
```

Use records only if the supported Java runtime makes them appropriate. Verify runtime compatibility first.

## Commands, not arbitrary mutation

Administrative writes must use explicit handlers.

Good conceptual examples:

- `player.message`
- `player.teleport`
- `player.kick`
- `player.mute`
- `world.broadcast`
- `world.saveAll`
- `server.restart`
- `plugin.reload`

Do not implement:

- generic PATCH of player fields
- arbitrary Java method invocation
- arbitrary `::command` execution from the browser
- arbitrary SQL
- shell execution

Existing OpenRSC command implementations are reference implementations for domain behavior and validation.

## Authorization

OpenRSC has established group IDs in `Group.java`.

These groups may seed default dashboard roles, but authorization should be capability-oriented.

Potential capabilities:

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

Do not assume "admin login" means unrestricted access to every future dashboard feature.

## Audit rules

Every state-changing admin command should produce an audit record.

Capture at minimum:

- timestamp
- server/world name
- operator identity
- capability
- command type
- target
- sanitized input summary
- success/failure
- error category
- request/correlation ID where practical

Reuse OpenRSC's existing staff/game logging infrastructure when it fits.

Do not log:

- passwords
- password hashes
- authentication tokens
- session secrets
- raw database credentials

## Existing observability

Before adding instrumentation, inspect `Server.java`.

It already tracks fields for:

- last tick duration
- time late
- incoming packet duration
- event processing duration
- outgoing packet duration
- world update duration
- player processing duration
- NPC processing duration
- message queue duration
- client update duration
- cleanup duration
- walk action duration
- incoming packet opcode counts/timing
- outgoing packet opcode counts/timing

Prefer exposing these existing values first.

Do not add duplicate counters unless existing metrics cannot answer the requirement.

## Plugin system

OpenRSC plugins are not the old 2003Scape function-name modules.

The plugin system uses:

- trigger interfaces
- class discovery
- `PluginJarLoader`
- Guice injection
- trigger-to-instance registration
- a plugin executor
- load/unload/reload behavior

Before adding plugin observability:

1. trace `PluginHandler.handlePlugin`
2. trace plugin action invocation
3. identify existing executor/thread boundaries
4. instrument without changing plugin semantics
5. preserve reload behavior

A plugin dashboard should initially report what OpenRSC already knows rather than require metadata rewrites.

## Database policy

OpenRSC already has a rich database abstraction.

Before adding a table:

- search `GameDatabase`
- inspect MySQL and SQLite implementations
- inspect existing logging queries
- inspect the Website Portal if the data is already consumed there

Avoid creating a second source of truth.

If new audit tables are required, preserve both supported database implementations unless the project deliberately decides otherwise.

## Threading and performance

OpenRSC is concurrent.

Admin code must respect:

- Netty event loops
- game update/tick work
- plugin executor threads
- SQL/logging pools
- scheduled executors

Avoid:

- blocking game processing on dashboard clients
- synchronous network calls from hot paths
- full-world serialization
- unbounded event queues
- high-frequency packet event streaming by default
- synchronous expensive queries from tick execution

Prefer:

- immutable/snapshot DTOs
- bounded queues
- periodic aggregation
- asynchronous transport
- existing thread pools only when semantically appropriate

Do not casually reuse a pool whose workload has different latency/safety requirements.

## Multi-server awareness

`Server.serversList` can contain multiple configured server instances in one process.

DTOs and events should include an explicit server/world identifier from the beginning.

Do not assume there is only one `Server`.

A central external broker is not required merely because multi-world support exists.

## Privacy

OpenRSC has extensive logging capabilities.

Technical availability is not equivalent to permission to expose data.

Especially sensitive:

- private messages
- IP addresses
- linked-account information
- recovery/account security information

Require explicit product policy and role gating before exposing sensitive data.

## Testing

JUnit 5 is already configured in `server/build.gradle`.

Prefer tests around new boundaries:

1. DTO mapping
2. command validation
3. capability authorization
4. command handlers with narrow fakes/mocks
5. API contract behavior
6. event bus behavior
7. integration smoke tests

Do not begin by trying to create complete unit coverage for the legacy framework.

## Dependency policy

Before adding a dependency:

- verify it is maintained
- check supported Java version
- check Gradle compatibility
- check license
- check whether Netty/JDK already solves the problem
- avoid adding a web framework solely for convenience if a smaller integration works

Do not perform broad dependency modernization as part of an Admin 2026 feature unless required.

## Vertical-slice progression

### Step 1 — status DTO — complete

The live status slice is implemented. It currently exposes:

- server name
- uptime
- player count
- NPC count
- running/shutdown state
- tick duration
- tick-budget overrun
- stage timings
- current tick and configured tick interval

### Step 2 — plugin inventory — active next slice

Expose loaded plugin classes, trigger relationships, quest/minigame metadata, and other safe read-only plugin descriptors without exposing mutable plugin instances.

### Step 3 — online players

Expose small `PlayerSummary` DTOs.

### Step 4 — player detail

Expose a deliberately selected snapshot.

### Step 5 — events

Emit login/logout events first.

### Step 6 — one command

Prefer player message as the initial mutation.

It exercises:

- auth
- target lookup
- validation
- command execution
- audit
- UI feedback

without changing durable player state.

### Step 7 — dashboard

Build only enough UI to exercise the vertical slice.

## Git/change discipline

Prefer:

- small reviewable changes
- no unrelated formatting churn
- no broad refactors in feature commits
- no mass plugin rewrites
- documentation updates with contract changes
- tasklist updates with project-state changes

Preserve surrounding OpenRSC style when changing legacy files.

## Agent workflow

Before coding:

1. read this file
2. read `admin-2026/readme.md`
3. read `admin-2026/docs/tasklist.md`
4. inspect relevant OpenRSC classes
5. check threading impact
6. check multi-server impact
7. check security/privacy impact
8. identify existing functionality that can be reused
9. define minimal tests
10. move the active task into **Doing**

During implementation:

1. keep admin code isolated
2. reuse OpenRSC domain behavior
3. validate all external input
4. avoid blocking hot paths
5. keep queues bounded
6. add focused tests
7. update documentation when architecture/contracts change
8. keep the tasklist accurate

Before declaring work complete:

1. run relevant Gradle tests
2. run server build
3. verify normal startup
4. verify admin-disabled startup
5. verify unauthorized mutations fail
6. verify admin client failure does not affect gameplay
7. update `tasklist.md`
8. summarize limitations

## Primary principle

**Expose OpenRSC before extending OpenRSC.** The browser is a presentation/control layer; the OpenRSC runtime remains authoritative.
