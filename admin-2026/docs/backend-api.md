# Admin 2026 Backend API

_Last updated: 2026-09-27_

This document records the first live Java integration between OpenRSC and the Admin 2026 SPA.

## Current scope

The backend integration is intentionally read-only.

Implemented:

- process-level Admin 2026 HTTP listener
- localhost-only binding by default
- opt-in enablement through JVM properties
- typed `ServerStatus`, `WorldStatus`, and `TickMetrics` snapshots
- `GET /admin/api/status`
- `GET /admin/api/plugins`
- `GET /admin/api/players`
- `GET /admin/api/events` (Server-Sent Events)
- support for multiple in-process OpenRSC servers through `Server.serversList`
- frontend Vite proxy to the admin listener
- local-development operator authentication/session introspection
- first capability-gated, audited online-player alert mutation

Additional mutations remain disabled until they are audited and granted operation-by-operation.


## Enable the listener

Admin 2026 is disabled by default.

Enable it with:

```bash
-Dopenrsc.admin.enabled=true
```
Optional properties:

```text
-Dopenrsc.admin.bind=127.0.0.1
-Dopenrsc.admin.port=8787
```

Defaults:

- bind: `127.0.0.1`
- port: `8787`

The implementation logs a warning when bound to a non-loopback address because authentication is not implemented yet.

## Endpoint

```http
GET /admin/api/status
```

Response shape:

```json
{
  "generatedAtEpochMillis": 1790453706535,
  "servers": [
    {
      "name": "Runescape",
      "running": true,
      "restarting": false,
      "shuttingDown": false,
      "uptimeMillis": 16234,
      "currentTick": 25,
      "gameTickMillis": 640,
      "world": {
        "players": 0,
        "npcs": 3608,
        "shops": 92,
        "snapshots": 0
      },
      "tick": {
        "durationMillis": 24.85,
        "lateMillis": 0,
        "eventsMillis": 3.18,
        "incomingPacketsMillis": 0,
        "outgoingPacketsMillis": 0,
        "worldUpdateMillis": 0.01,
        "playersMillis": 0,
        "npcsMillis": 19.77,
        "messageQueuesMillis": 0.01,
        "clientUpdateMillis": 0,
        "cleanupMillis": 0.69,
        "walkActionsMillis": 0
      }
    }
  ]
}
```
## Operator session endpoint

```http
GET /admin/api/session
```

This endpoint is the first authenticated Admin 2026 boundary.

The current mode is explicitly for local development and is configured through JVM properties:

```text
openrsc.admin.authToken
openrsc.admin.operator
openrsc.admin.group
```

When auth is not configured, the endpoint returns:

```http
HTTP/1.1 503 Service Unavailable
```

```json
{
  "authMode": "local-bearer",
  "error": "auth_not_configured"
}
```

When configured, a valid bearer token resolves to an `AdminOperator` with OpenRSC group metadata and a conservative capability set. The configured token is never returned by the API.

The session payload reports `mutationsEnabled` based on whether the authenticated operator currently holds an implemented mutation capability. The first implemented capability is `players.message`.

See `admin-2026/docs/auth-and-audit.md` for capability mapping, audit contract, limitations, and production-session direction.

## First mutation endpoint

```http
POST /admin/api/players/message
Authorization: Bearer <local-development token>
Content-Type: application/json
```

Request:

```json
{
  "serverName": "Runescape",
  "databaseId": 42,
  "message": "Please meet an administrator in Lumbridge."
}
```

The first operation deliberately mirrors the existing moderator alert behavior:

- target must be an online player
- message is trimmed, required, and capped at 240 characters
- execution is marshalled onto the OpenRSC game-event handler
- clients supporting message boxes receive an administrator alert box
- all clients receive an administrator server message
- the browser cannot send raw `::commands`

Authorization requires `players.message`. The initial group mapping grants it to Owner, Admin, Super Moderator, Moderator, and Player Moderator, matching the existing `::alert` command boundary.

Every authorized mutation attempt receives a request ID and produces a typed result. Success and operation failures are persisted as `Admin2026Audit` JSON records through OpenRSC's existing `GameLogger` / `generic_logs` path.

Observed local verification:

- unauthenticated session request → `401 unauthorized`
- authenticated Admin session → reports `players.message` and `mutationsEnabled: true`
- offline player mutation → `404 player_not_online`
- the failed mutation was confirmed persisted in SQLite `generic_logs`

## Authoritative world snapshot

`GET /admin/api/world/snapshot?serverName=Runescape` returns a versioned, transport-safe read-only snapshot copied from the selected OpenRSC world. Version 1 currently includes online players, all live NPCs, and current ground items.

Player snapshots include identity, server index, coordinates, combat level, HP, combat/sleep/skull state, and appearance. NPC snapshots include definition identity, server index, coordinates, HP, and combat state. Ground-item snapshots include definition identity, amount, and coordinates.

The endpoint never serializes mutable `World`, `Player`, `Npc`, or `GroundItem` objects directly. The current browser integration polls the full snapshot once per second and forwards it through the explicit World Viewer extension bridge. This is a development/proof transport, not the intended high-population architecture; dynamic scenery and ephemeral events should move to bounded deltas/streams before scaling.

## Live event endpoint

```http
GET /admin/api/events
Accept: text/event-stream
```

The first live event transport uses Server-Sent Events.

Current event types:

```text
player.logged_in
player.logged_out
```

Event envelope:

```json
{
  "id": 1,
  "type": "player.logged_in",
  "timestampEpochMillis": 1790456525112,
  "serverName": "Runescape",
  "data": {
    "databaseId": 42,
    "index": 0,
    "username": "Alice",
    "combatLevel": 87,
    "x": 120,
    "y": 640,
    "fatigue": 12,
    "questPoints": 18,
    "groupId": 10,
    "groupName": "User"
  }
}
```

The process-local `AdminEventBus` is intentionally bounded:

- 200 recent events retained for short reconnect history
- 100 queued events per SSE subscriber
- publishing never blocks gameplay threads
- a slow subscriber drops its oldest queued event rather than applying back-pressure

Login events are emitted from `World.registerPlayer` after successful registration.

Logout events are emitted from `World.removePlayer` after actual removal from the live player list.

The Admin HTTP transport uses an isolated fixed worker pool so long-lived SSE clients do not block normal status/plugin/player queries.

A synthetic transport smoke test verified:

- SSE event delivery with event IDs
- recent-event framing
- concurrent `/admin/api/status` availability while an SSE stream is open

The SPA uses native `EventSource`, de-duplicates events by ID, and invalidates player/status TanStack Query caches on login/logout.

## Online players endpoint

```http
GET /admin/api/players
```

This endpoint returns privacy-safe summaries of currently online players grouped by OpenRSC server.

The initial `PlayerSummary` includes:

- database ID
- runtime entity index
- username
- combat level
- x/y coordinates
- fatigue
- quest points
- group ID/name

It intentionally excludes:

- current/previous IP address
- private messages
- recovery/security information
- account-linkage information
- passwords/session secrets

The default local world was verified returning:

```json
{
  "servers": [
    {
      "serverName": "Runescape",
      "onlineCount": 0,
      "players": []
    }
  ]
}
```

The frontend Overview and `/players` route render this real empty state rather than mock users.

For populated validation, the repository's normal single-player workflow runs the client through `make run-client`, which maps to `ant -f Client_Base/build.xml runclient`. The current sparse Admin 2026 checkout does not include the client tree, and the test Mac does not yet have a working Ant setup, so a real populated login remains a follow-up verification task.

## Plugin inventory endpoint

```http
GET /admin/api/plugins
```

This endpoint returns one read-only plugin inventory per active OpenRSC server.

Current metadata includes:

- instantiated plugin handler count
- distinct trigger type count
- quest count
- minigame count
- shop count
- plugin class name / simple name / package
- implemented trigger interface names
- inferred kinds such as quest, minigame, shop, registrar, default-handler, and trigger-handler
- quest metadata when the plugin implements `QuestInterface`
- minigame metadata when the plugin implements `MiniGameInterface`
- current plugin-handler reload state

The implementation adds copied/unmodifiable snapshot accessors to `PluginHandler`. It does **not** expose mutable registration maps, the plugin loader, or live plugin instances.

Observed against the default world:

```text
instantiatedPlugins: 455
triggerTypes: 31
quests: 50
minigames: 9
shops: 92
```

Dragon Slayer was verified as a quest/trigger handler with its actual quest metadata and trigger interfaces.

## Metric semantics

All OpenRSC timing fields are recorded internally in nanoseconds and are converted to milliseconds in the admin DTO.

`tick.durationMillis` is the duration of the last completed game tick work.

`tick.lateMillis` is defined by Admin 2026 as:

```text
max(tick duration - configured game tick interval, 0)
```

This intentionally does not expose `Server.getTimeLate()` directly because that value is also used as scheduler phase/offset state between ticks and is misleading when sampled asynchronously.

## Frontend integration

The SPA uses:

```text
/admin/api/status
```

During Vite development, that path is proxied to:

```text
http://127.0.0.1:8787
```

Override the proxy target with:

```text
VITE_ADMIN_API_PROXY_TARGET
```
The overview currently polls status every two seconds using TanStack Query.

Live values currently drive:

- server/world name
- API connected/disconnected state
- online player count
- NPC count
- latest tick duration
- tick overrun
- configured tick rate
- current tick number
- uptime
- rolling tick-duration chart

Player rows, plugin/content views, and the login/logout activity feed are live. Administrative mutation actions remain disabled/planned until authentication, capability checks, and auditing are established.

## Security boundary

The current API is intentionally:

- disabled by default
- read-only
- loopback-bound by default

Do not add mutation endpoints until authentication, capability authorization, validation, and audit behavior are implemented.

## Local verification performed

The first live integration was verified against the bundled Preservation/default world.

Observed startup included:

- SQLite connection
- 836 NPC definitions
- 1,593 item definitions
- 27,781 world objects
- 3,608 NPC spawns
- 50 quests
- 9 minigames
- 455 plugin handlers
- TCP listener on 43594
- WebSocket listener on 43494
- Admin API listener on 8787

A live browser verification confirmed the SPA rendered values returned by the Java endpoint.

## Build/runtime notes

The current test Mac exposes two incompatible Java choices for the legacy server build:

- Java 18 is a full JDK, but Gradle 7.0/Groovy cannot evaluate under class-file major version 62.
- Java 8 can run the Gradle wrapper under Rosetta, but the installed Java 8 is only a JRE/browser runtime and has no `tools.jar`, so it cannot compile Java sources.

Additional legacy build friction observed while probing:

- `ant.importBuild("build.xml")` imports an Ant `clean` target that collides with Gradle's built-in `clean` task.
- the MySQL Connector/J dependency uses the legacy group coordinate `mysql:mysql-connector-j:9.4.0`; current Maven Central publishes it as `com.mysql:mysql-connector-j:9.4.0`.

Experimental local fixes were reverted; no build-system modernization is part of the World Viewer extension commits.

A proper JDK compatible with the existing Gradle 7-era build (for example JDK 11, subject to verification) is the next prerequisite for server-side world-observation work.

This is a baseline/tooling issue, not an Admin 2026 API failure. Do not silently modernize the repository build as part of unrelated Admin work.
