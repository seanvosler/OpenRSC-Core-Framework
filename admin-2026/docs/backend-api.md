# Admin 2026 Backend API

_Last updated: 2026-09-26_

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
- support for multiple in-process OpenRSC servers through `Server.serversList`
- frontend Vite proxy to the admin listener

No authentication, mutation endpoints, or live-event transport exist yet.

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

Player rows, plugin cards, activity feed, and admin actions remain mock/planned until their corresponding APIs exist.

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

The repository's Gradle 7.0 wrapper does not currently evaluate cleanly on this checkout:

- Java 18 causes Groovy/Gradle class-version incompatibility
- Java 8 reaches project evaluation but `ant.importBuild("build.xml")` collides with Gradle's existing `clean` task

The legacy Ant build file targets Java 8 source/target, but Ant was not installed on the test machine.

For this integration checkpoint, the full core source tree was successfully compiled directly with `javac -source 8 -target 8` and `server/lib/*`.

This is a baseline/tooling issue, not an Admin 2026 API failure. Do not silently modernize the repository build as part of unrelated admin work.
