# Admin 2026 — Current Implementation Lanes

_Last updated: 2026-09-27_

This document captures the current implementation ordering and preserves completed read-only slice notes as historical design context.

## Status update

The initial read-only foundation is implemented:

- live status/tick metrics;
- plugin/content inventory;
- online player summaries;
- bounded login/logout SSE events;
- generic hosted Admin Extension support;
- World Viewer iframe integration with a versioned two-way context bridge;
- browser-verified static 3D world rendering.

Authentication/capabilities/audit are the active prerequisite before mutations.

The World Viewer may continue in parallel as a **read-only** lane. Its next meaningful boundary is a live `Observer[]` / world-state source; server-native work is currently gated by the local Java/JDK build environment.

## Recommendation

Keep two coordinated lanes:

```text
PRIMARY SECURITY LANE
authentication
   ↓
capability mapping
   ↓
audit contract
   ↓
first explicit mutation

PARALLEL READ-ONLY WORLD LANE
hosted World Viewer        complete
   ↓
Admin context bridge       initial complete
   ↓
live observation source
   ↓
entity selection/inspect
   ↓
server-truth comparison
```

Do not let World Viewer integration introduce mutation paths ahead of the security lane.

---

## Completed reference — 1. Plugin inventory

### Why this was first

The default local world provides useful plugin data immediately, even with zero connected players.

Observed during local startup:

- 455 instantiated plugin handlers
- 50 quests
- 9 minigames
- 92 shops

The existing plugin runtime already contains most of the relationships the GUI wants to display.

### Existing source surfaces

`PluginHandler` currently owns:

- `loader.getLoadedClasses()`
- `triggerTypes`
- `triggerTypeToInstance`
- `pluginInstances`
- reload state
- plugin executor

`World` already exposes:

- quests
- minigames
- shops

`QuestInterface` exposes:

- quest ID
- quest name
- quest points
- members flag

`MiniGameInterface` exposes:

- minigame ID
- minigame name
- members flag
### Safe accessor strategy

Do **not** expose `PluginHandler`'s mutable maps, loader, or live plugin instances to Admin 2026.

Prefer small read-only snapshot accessors on `PluginHandler`, for example conceptually:

```java
Set<Class<?>> getInstantiatedPluginTypesSnapshot()
Map<Class<?>, Set<Class<?>>> getTriggerRegistrationsSnapshot()
boolean isReloading()
```

The returned collections should be copies/unmodifiable snapshots.

The admin DTO layer can then translate Java classes into transport-safe strings and metadata.

### Proposed first contract

A first `PluginSummary` can include:

```text
className
simpleName
packageName
triggerNames[]
kinds[]
quest?
minigame?
```

Potential kinds:

```text
quest
minigame
shop
registrar
default-handler
trigger-handler
```

Quest/minigame metadata should come from the already-registered world instances where possible.

### First endpoint

```http
GET /admin/api/plugins
```

The response should include an explicit server/world identifier and a generated timestamp.

### First UI

Replace the overview's mock plugin cards with live plugin data, then create the first real `/plugins` route.

The first route should focus on:

- search
- class/display name
- category/kinds
- implemented triggers
- quest/minigame metadata
- server/world

Do not add reload controls, invocation timing, or error instrumentation in the same slice unless the existing state makes them essentially free.

---

## Completed reference — 2. Online player summaries

### Existing source surfaces

`World.getPlayers()` returns an `EntityList<Player>`.

`EntityList.iterator()` already creates an immutable list snapshot before iterating, which is useful for a read-only admin query.

Useful existing player/entity getters include:

- database ID
- username
- combat level
- x/y coordinates
- fatigue
- group ID
- current/last login timing
- last client activity
### Proposed safe first summary

Keep the first contract deliberately small:

```text
id
username
combatLevel
x
y
fatigue
groupId
```

Potential later additions:

- quest points
- current HP / max HP
- current activity
- clan/party
- moderation state

Do **not** include in the first contract:

- current IP
- previous IP
- private messages
- recovery/security state
- other sensitive account linkage

### Endpoints

```http
GET /admin/api/servers/:server/players
GET /admin/api/servers/:server/players/:id
```

The exact routing convention should be finalized before implementation; the important part is preserving explicit server/world context.

### Validation caveat

The default local world starts with zero players, so end-to-end UI validation needs either:

- a real local client login, or
- a narrowly scoped test fixture/harness

Do not create fake server-side players solely for the dashboard.

---

## Completed reference — 3. Login/logout events

Once player summaries exist, login/logout is the smallest useful live event stream.

It can power:

- activity feed
- online-player invalidation
- player-count refresh
- basic operator awareness

Start with login/logout before broad world/plugin event streaming.

Prefer an explicit bounded event transport such as SSE or WebSocket.

---

## 4. Mutations remain later

Do not move to administrative writes yet.

Before the first mutation, establish:

- authenticated operator identity
- capability authorization
- audit contract
- validation/result model

A player-message action remains a good first mutation after those foundations exist because it exercises the full command path without modifying durable player state.

---

## Immediate implementation sequence

```text
Authentication/capability/audit contract
        ↓
read-only auth/session introspection
        ↓
first explicit audited mutation
        ↓
player detail / richer inspectors

Parallel:
World Viewer extension
        ↓
live Observer[] or bounded server-world snapshots
        ↓
entity selection into Admin inspectors
        ↓
observer truth vs server truth
```

This sequence preserves the project's main rule:

> **Expose OpenRSC before extending OpenRSC.**
