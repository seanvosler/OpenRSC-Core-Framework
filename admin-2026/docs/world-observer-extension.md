# World Observer Admin Extension

> Architecture and integration plan for using rsc-map-renderer-observe as the world-visualization and observation engine for Admin 2026.

Repositories:

- seanvosler/rsc-map-renderer-observe
- upstream: swazrgb/rsc-map-renderer

Related Admin docs:

- admin-extensions.md
- gui-stack.md
- backend-api.md

## Executive summary

The World Observer extension should make the OpenRSC world visible as a first-class Admin 2026 surface without requiring the renderer to be merged into the Admin repository or tightly coupled to the OpenRSC server runtime.

The renderer is best treated as a specialized visualization engine.

Conceptually:

~~~text
OpenRSC / RSC-compatible server
            │
            ▼
observer client / adapter
            │
            ▼
normalized Observer[] state
            │
            ▼
rsc-map-renderer-observe
            │
            ▼
Admin 2026 World Viewer
~~~

The important nuance is that the renderer itself does **not** have to log into or modify the OpenRSC server. It consumes normalized observations produced by another source.

That source can be:

- a normal/headless RSC client;
- multiple observer clients;
- a bridge around existing bot tooling;
- a direct OpenRSC Admin adapter;
- a recorded replay;
- synthetic/demo data.

This makes the viewer transport- and source-agnostic.

For Admin 2026, the preferred evolution is:

~~~text
C — iframe-hosted World Viewer
        ↓
B — connected hosted extension
        ↓
A — native React World Viewer extension
~~~

The user-facing feature remains **World Viewer** throughout.

## What the renderer is

rsc-map-renderer-observe is more than a map website.

It contains a pipeline for interpreting OpenRSC data, baking browser-oriented world assets, rendering the world in 2D/3D, and layering dynamic observed entities over the static world.

High-level architecture:

~~~text
OpenRSC data
    │
    ▼
world/game-data loaders
    │
    ├── classic JAG/MEM landscape
    ├── .orsc landscape
    ├── scenery locations
    ├── boundary/door locations
    ├── NPC locations
    ├── definitions
    └── world/server profiles
    │
    ▼
offline render/bake pipeline
    │
    ├── 2D map rasters
    ├── walls/collision layers
    ├── GeoJSON features
    ├── world mesh cells
    ├── textures
    ├── object/door libraries
    ├── NPC/item/scenery atlases
    ├── fonts
    └── player sprite layers
    │
    ▼
static asset tree
    │
    ▼
React + Three.js viewer
    ▲
    │
dynamic Observer[] state
~~~

The expensive interpretation of historic RSC data happens before or outside the browser.

The browser is then responsible for interactive rendering and dynamic reconciliation.

## Current renderer module roles

### game-data/

Shared OpenRSC data interpretation.

Responsibilities include locating server configuration, selecting world profiles, loading landscape data, reading NPC/scenery/boundary locations, reading item/NPC/object/door/tile definitions, and presenting JAG/MEM and .orsc landscapes behind a common abstraction.

The selected world can alter landscape, location data, custom content, and enabled features. This allows the renderer to support multiple OpenRSC worlds/configurations rather than assuming one immutable RSC map.

### client-render/

Headless adaptation of OpenRSC/RSC client rendering logic.

It includes world/scene/model/sprite rendering code and can rasterize terrain/scenery/walls without launching a graphical client.

This is useful for authentic rendering, sprite/asset generation, map generation, visual validation, and tooling.

### world3d-bake/

Compiles the static world into browser-consumable assets.

The result is a static asset contract under paths resembling:

~~~text
/api/world3d/*
/api/map/*
/api/npc-spawns
/api/items/wearables
~~~

The /api name should not be confused with requiring a live application server. These may be static files served by a dumb HTTP host.

### map2d/

Generates per-floor map layers.

Current concepts include:

- light terrain;
- dim/minimap-like terrain;
- walls;
- impassable tiles;
- previews/thumbnails;
- GeoJSON feature layers such as doors and NPC spawns.

This structured geographic layer is especially interesting for future Admin overlays.

### viewer/

Standalone modern frontend:

~~~text
React
TypeScript
Vite
Three.js
~~~

The viewer exports a reusable world component and observation types.

Its rendering responsibilities include terrain/world mesh, scenery, doors/walls, NPC sprites, player sprites, ground items, projectiles, wilderness/world presentation, chat text, and observed dynamic world changes.

## Static world + dynamic world

The viewer has a strong separation between immutable/slow-changing world data and live entity state.

~~~text
STATIC / BAKED
├── terrain
├── mesh
├── textures
├── normal scenery
├── normal doors/walls
├── definitions
└── sprite atlases
          │
          ▼
      Three.js world
          ▲
          │
DYNAMIC / OBSERVED
├── observers
├── players
├── NPCs
├── ground items
├── scenery overrides
├── door/wall overrides
├── projectiles
├── combat state
└── chat/transient effects
~~~

This is exactly the right shape for Admin world observation.

The server or observer transport does not need to continuously resend terrain, buildings, trees, or definitions. Only live state needs to update.

## Observer model

The key runtime contract is conceptually:

~~~ts
observers: Observer[]
~~~

Each Observer represents one vantage point into the world.

An observer may represent a bot, instrumented game client, online player, monitoring account, synthetic region, or server-side adapter that presents authoritative state.

An observer includes its own state plus its local visible world.

Conceptually:

~~~text
Observer
├── username / identity
├── server tick
├── own position
├── own server index
├── appearance/direction
├── HP / damage
├── combat/sleep/skull state
├── chat/action bubble state
│
├── NPCs visible
├── players visible
├── ground items visible
├── objects visible
├── wall objects visible
└── projectiles visible
~~~

This lets many partial viewpoints combine into one shared visual world.

## MapEntity model

Visible entities use a transport model similar to:

~~~text
serverIndex
definition id
name

x
z / absolute vertical coordinate
direction

combat state
appearance
combat level
skull

HP
max HP
damage
damage tick

message
message tick

action bubble
bubble tick
~~~

The model intentionally tolerates incomplete observations. An observer should send only the state it actually knows.

That makes the format suitable for multiple data sources with different visibility or privilege.

## Multi-observer merge

One observer normally sees only a local region.

Multiple observers can therefore build a larger picture:

~~~text
Observer: Varrock ──┐
Observer: Falador ──┼──► merged observed world
Observer: Lumbridge ┘
~~~

Overlapping observations are deduplicated.

For players/NPCs the stable serverIndex can act as identity. Other world entities can be reconciled using their appropriate tile/location identity.

This gives the system a path toward a server-wide live map without requiring a privileged world-state API.

## Tick interpolation

Observation sources can send authoritative discrete positions once per server tick:

~~~text
tick N     (100, 200)
tick N+1   (101, 200)
tick N+2   (102, 200)
~~~

The browser interpolates movement between updates.

Responsibility is therefore cleanly divided:

~~~text
observer/server
    = simulation truth

viewer
    = presentation interpolation
~~~

Do not push animation paths through the Admin API merely for visual smoothness.

## Dynamic scenery reconciliation

The viewer can overlay runtime world changes on top of the static bake.

Examples include mined rocks, chopped/regrown resources, opened/closed chests, quest scenery, temporary scenery, and doors/gates.

Conceptually:

~~~text
static object
    │
    │ observed runtime override
    ▼
dynamic object state
    │
    │ override disappears
    ▼
static object restored
~~~

A tombstone-style entry can indicate that a normally baked object should be absent.

This is important because "not currently observed" and "known to be removed" are different states.

## Player appearance

The renderer does not need a pre-baked sprite for every possible player appearance.

Player sprites are composited in the browser from layers and recolor information.

~~~text
body
head
legs
cape
weapon
shield
other layers
    │
    ├── recolor
    ├── order
    └── compose
          │
          ▼
     final player sprite
~~~

This preserves RSC-style appearance while remaining efficient enough for arbitrary player configurations.

## Transient world events

Tick-stamped state supports presentation of transient effects such as damage splats, overhead chat, action bubbles, projectiles, and combat indicators.

The observation should describe the event semantically. The viewer owns the short-lived animation/presentation.

## Public/demo simulation

The renderer can demonstrate a populated world without a live server.

The build pipeline can generate collision-aware NPC wander tracks and sample players.

This is useful for frontend development, hosted demonstrations, rendering validation, and testing the extension host without requiring a running game world.

For Admin integration, keep a demo/offline mode available where practical.

# Admin integration

## Product location

The World Viewer should become a first-class Admin route:

~~~text
/world
~~~

Potential later tabs/modes:

~~~text
World
├── Live
├── 3D
├── 2D
├── Observers
├── Collision
├── Spawns
└── Replay
~~~

Do not force all of these into the first implementation.

## Extension ownership boundary

### Admin owns

- route/navigation;
- operator authentication;
- capability checks;
- selected OpenRSC server/world;
- extension hosting;
- configuration/bootstrap;
- live Admin API transport when server-derived data is used;
- entity detail panels tied to Admin data;
- administrative actions;
- command validation;
- audit records.

### Renderer owns

- baked world assets;
- terrain rendering;
- Three.js scene;
- camera behavior;
- world coordinates;
- scenery rendering;
- NPC/player sprite rendering;
- player appearance composition;
- interpolation;
- observed-entity merge/deduplication;
- static/dynamic visual reconciliation;
- map-specific UI primitives.

This boundary should remain visible even after Level A native integration.

# Phase C — hosted iframe

The first Admin integration should not require rewriting or packaging the renderer.

Architecture:

~~~text
Admin 2026
   │
   └── /world
        │
        ▼
   ExtensionHost
        │
        ▼
   iframe / separately built viewer
~~~

The viewer may be served under:

~~~text
/extensions/world-viewer/
~~~

or from a separately configured origin.

Initial success criterion:

> An operator can navigate to World inside Admin 2026 and see the independently built viewer without any renderer code becoming a dependency of the core Admin bundle.

### Phase C responsibilities

Admin:

- register world-viewer;
- expose the /world route;
- lazy-load the extension host;
- render unavailable/loading states;
- gate route visibility once world.read capability exists.

Viewer:

- build independently;
- load its static baked world;
- run its existing demo/simulation mode or its own observer connection;
- remain usable outside Admin.

No cross-frame mutation API is required for the first milestone.

# Phase B — connected hosted extension

Once hosting is proven, connect the viewer to Admin context.

Potential bootstrap information:

~~~text
extension id
selected server/world id
world display name
asset base URL
observer endpoint
authorized feature flags
safe extension session
theme hints
~~~

Potential mechanisms:

- URL bootstrap parameters for non-sensitive values;
- server-generated extension bootstrap endpoint;
- narrow postMessage bridge;
- extension-specific short-lived session.

Do not pass long-lived Admin secrets through URL parameters.

## Suggested host/viewer message bridge

If iframe integration needs richer communication, keep it small and versioned.

Example conceptual events:

~~~text
admin -> viewer
----------------
context.changed
theme.changed
server.changed
selection.focus
viewer.resize

viewer -> admin
----------------
viewer.ready
entity.selected
observer.selected
position.selected
viewer.error
~~~

Do not make postMessage a generic remote procedure call system.

Validate message origin and message shape.

# Phase A — native React extension

The renderer already uses React + TypeScript + Vite, which aligns well with Admin 2026.

The eventual integration can therefore become conceptually:

~~~tsx
<World3DView observers={worldState} />
~~~

or a thin Admin-specific wrapper:

~~~tsx
<WorldObserverExtension
  serverId={serverId}
  observers={observers}
  onEntitySelect={setSelection}
/>
~~~

A native integration enables shared Admin layout, Admin entity inspectors, shared dialogs, command palette integration, route/search-param synchronization, server/world selector integration, shared auth/capability state, Admin actions from selected entities, side-by-side logs/metrics, and shared keyboard behavior.

The renderer can still remain in its own repository and be consumed as a versioned package.

# Data-source strategies

The renderer should remain source agnostic.

Admin can support more than one strategy.

## Strategy 1 — external observer clients

~~~text
OpenRSC server
     │ ordinary game protocol
     ▼
observer clients / bots
     │ normalized observations
     ▼
World Viewer
~~~

Advantages:

- no server-runtime integration required;
- observes the same information ordinary clients receive;
- useful for protocol/client visibility debugging;
- naturally works against compatible remote servers.

Limitations:

- only observed regions are populated;
- authoritative hidden state is unavailable;
- requires observer accounts/processes;
- coverage depends on observer placement.

## Strategy 2 — server-native Admin adapter

~~~text
OpenRSC World
     │
     ├── players
     ├── NPCs
     ├── items
     ├── objects
     └── events
          │
          ▼
transport-safe world snapshots/events
          │
          ▼
Observer adapter
          │
          ▼
World Viewer
~~~

Advantages:

- authoritative server truth;
- potentially complete-world coverage;
- no observer accounts required;
- direct integration with selected Admin world.

Requirements:

- explicit DTOs;
- bounded update strategy;
- no full mutable model serialization;
- no game-loop blocking;
- multi-server/world identifier;
- careful performance measurements.

Do **not** serialize World, Player, Npc, or GameObject directly.

## Strategy 3 — hybrid comparison

The most powerful eventual mode is to preserve both data paths:

~~~text
                  OpenRSC
                  /     \
                 /       \
        game protocol    Admin API
             │               │
             ▼               ▼
      observer state     server truth
             │               │
             └───────┬───────┘
                     ▼
                World Viewer
~~~

Potential mode selector:

~~~text
View source:

● Server Truth
○ Observer Network
○ Compare
~~~

Compare mode could expose discrepancies such as server entity exists but client does not see it, stale observer location, door/object disagreement, missing despawn, duplicated server index, region/visibility synchronization bug, or packet update failure.

This turns the viewer into a protocol/runtime debugging tool, not merely a map.

# Observer protocol as a boundary

The Observer / MapEntity contract is important enough that it should eventually be documented separately from the viewer implementation.

Possible future package:

~~~text
@openrsc/world-observer-protocol
~~~

or a repository-neutral schema under Admin docs.

It could define protocol version, observer identity, server/world identity, server tick, position/floor encoding, entity identity/deduplication, NPC/player fields, ground item identity, object/wall-object identity, projectiles, transient events, tombstones, optional fields, and snapshot vs delta semantics.

Consumers could include observer bots, OpenRSC Admin adapter, World Viewer, replay recorder, replay viewer, test fixtures, and future analytics.

Do not tie this contract to Three.js.

# Transport

The renderer contract and the network transport should remain separate decisions.

Potential transports include direct in-process React state, WebSocket, SSE where appropriate, periodic snapshots, recorded JSON replay, or a local IPC/bridge for desktop tooling.

For high-frequency world state, WebSocket is likely a more natural future transport than ordinary Admin SSE, but this should be measured rather than assumed.

The existing Admin event stream is intended for meaningful operational events, not necessarily every world tick.

Do not overload the existing login/logout SSE feed with full world-state replication.

# Snapshot/delta model

A future server-native adapter should avoid sending the entire world every tick.

Potential model:

~~~text
initial bounded snapshot
        │
        ▼
tick-stamped deltas
        │
        ├── entity upserts
        ├── entity removals
        ├── object overrides
        ├── projectiles/events
        └── observer/self changes
~~~

Alternatively, region-scoped snapshots may be easier to reason about initially.

Requirements:

- bounded payloads;
- bounded queues;
- explicit resync behavior;
- server/world id;
- tick sequence;
- dropped-frame tolerance;
- no blocking in game update paths.

# Multi-server awareness

OpenRSC can host multiple server instances via Server.serversList.

The World Viewer must not assume one global world.

Every live-world contract should include an explicit server/world identifier.

Admin's selected server should determine which asset profile is loaded, which observation stream is connected, which entity inspector queries are used, and which commands are available.

Changing selected server should safely tear down the previous world connection.

# Asset/world matching

A live observation stream is only meaningful if the viewer's baked world matches the selected OpenRSC world configuration.

The renderer supports world profiles/configuration that may differ in landscape source, location data, enabled custom features, scenery, NPC placements, and custom regions.

A future world asset manifest should therefore expose compatibility metadata.

Potential manifest:

~~~text
assetFormatVersion
rendererVersion
worldProfileId
worldDisplayName
landscapeType
landscapeRevision/hash
bounds
floors
generatedAt
sourceCommit
~~~

Admin should eventually be able to detect:

> selected runtime world and loaded baked world do not match.

Do not silently display mismatched static world data as authoritative.

# Admin entity selection

A major native-integration benefit is using the 3D world as a spatial entry point into existing Admin data.

Example:

~~~text
click player
    │
    ▼
Admin Player Inspector
├── identity
├── coordinates
├── stats
├── inventory/equipment
├── quest state
├── moderation state
├── recent events
└── permitted actions
~~~

Example NPC:

~~~text
Goblin #386
├── server index
├── definition id
├── position/floor
├── HP/combat
├── spawn location
├── roam/collision context
├── plugin/content references
└── recent observed events
~~~

The renderer should emit an entity-selection event. Admin should own the richer administrative inspector.

# Administrative actions

The World Viewer should enter Admin as read-only.

Later, selected world entities may expose authorized actions such as message player, teleport player, inspect player, kick/mute/ban, teleport operator, spawn/remove debug entities, or open plugin/content references.

These must use normal Admin command endpoints.

The renderer must not gain a generic sendCommand(string) capability.

Existing viewer verbs such as walk/interact controls should not automatically become Admin mutations.

Admin remains responsible for capability checks, typed inputs, validation, confirmations, command execution, and audit.

# World overlays

The renderer could eventually host optional Admin overlays.

### World/content

- NPC spawns;
- object spawns;
- doors;
- shops;
- quest locations;
- minigame areas;
- teleport destinations.

### Runtime

- online players;
- active NPCs;
- ground items;
- combat;
- observed mutable scenery;
- observer coverage.

### Developer

- collision;
- walkability;
- regions/sectors;
- pathfinding routes;
- line of sight;
- plugin trigger locations;
- event boundaries.

### Operational analytics

- player density;
- deaths;
- trades;
- packet activity;
- event rates.

Analytics overlays should be added only when a clear data source and privacy policy exist.

# 2D mode

The 2D renderer is valuable independently of the 3D viewer.

Potential Admin uses include fast world overview, spawn inspection, collision overlay, location picking, quest/content authoring, density heatmaps, and easier mobile/lower-power display.

The existing GeoJSON-style feature output may provide a strong basis for clickable structured overlays.

A future World extension may share one selection model across 2D map, 3D viewer, entity table, and inspector.

# Observer coverage

With client-based observers, Admin should eventually visualize coverage.

Example metrics:

~~~text
Observers online    14
Observed players    62
Observed NPCs       1,284
Ground items        37
Coverage estimate   41%
Last observer tick  9,381,225
~~~

Potential view:

- observer locations;
- each observer's visible radius/region;
- stale observers;
- overlapping coverage;
- uncovered active areas.

Coverage is an observation metric, not server truth. Make that distinction explicit in UI labels.

# Replay

The tick-oriented observation format naturally suggests replay support.

~~~text
Observer[] / world deltas
           │
           ▼
       recorder
           │
           ▼
 timestamp/tick stream
           │
           ▼
       replay viewer
~~~

Potential Admin UX:

~~~text
LIVE ─────────────────●

14:28 ──────●──────── 14:35
             ▲
         selected tick
~~~

Potential uses include incident analysis, moderation review where policy allows, synchronization debugging, reproducing world bugs, and visualization testing.

Replay storage must have an explicit retention/privacy policy before recording sensitive live data.

# Server truth vs observer truth

Preserving both models is strategically valuable.

Server truth answers:

> What does OpenRSC believe exists?

Observer truth answers:

> What did an actual RSC-compatible client receive/see?

Those are different operational questions.

A future comparison panel could show:

~~~text
Entity                   Server     Observer
------------------------------------------------
Goblin #386              present    present
Door 121,664,N           open       closed
Ground item #42          present    absent
Player index 18 position 100,200    99,200
~~~

This can expose networking, region-update, visibility, or stale-state issues that conventional server metrics cannot.

# Plugin/content integration

The world viewer can become a spatial front-end for OpenRSC content inspection.

~~~text
select Guildmaster
      │
      ▼
NPC definition
      │
      ▼
registered trigger
      │
      ▼
Dragon Slayer plugin
      │
      ▼
quest/content inspector
~~~

Admin already treats plugins/content as a first-class domain.

World selection should therefore link into existing Admin plugin/content routes rather than reproducing all plugin metadata inside the renderer.

# Security and privacy

The World Viewer can surface sensitive operational information.

Potentially sensitive examples include player locations, private/admin-only areas, observer usernames/accounts, chat, ground-item/economy activity, moderator activity, and replay history.

Requirements:

- capability-gate the route;
- capability-gate sensitive overlays independently where useful;
- do not assume all Admin operators may see all observation fields;
- do not expose IP addresses through this extension;
- do not transmit private messages unless explicitly designed, authorized, and audited;
- avoid leaking tokens/credentials to hosted iframe URLs;
- treat replay persistence as a separate privacy decision.

The first extension should be read-only and avoid sensitive chat/history expansion.

# Performance constraints

World observation can produce significantly more data than existing Admin pages.

Rules:

- never serialize the full live World object;
- never block the game tick on viewer clients;
- never require viewer availability for server operation;
- use immutable/snapshot DTOs;
- use bounded queues;
- support dropped visual frames;
- do not stream every internal server detail;
- aggregate/filter by selected world;
- lazy-load Three.js and world assets;
- measure payload/update costs before increasing frequency;
- use route-level code splitting in the native integration.

The visualization may be slightly stale; the game server may not be slow.

# Failure behavior

If the viewer fails:

- OpenRSC continues;
- Admin core continues;
- login continues;
- saves continue;
- plugins continue;
- other Admin routes continue.

The /world route should distinguish viewer unavailable, asset mismatch, observer disconnected, no observers, loading assets, and stale stream states where possible.

# Deployment shapes

## Development

~~~text
OpenRSC                    : game/admin runtime
Admin 2026 Vite            : admin frontend
World viewer Vite/static   : extension
observer/demo source       : optional
~~~

## Same-origin production

~~~text
/
├── admin/
├── admin/api/
└── extensions/
    └── world-viewer/
~~~

## Separate deployment

~~~text
admin.example.org
world-viewer.example.org
~~~

Admin should not require one specific deployment topology.

# Recommended implementation milestones

## Milestone 0 — document and preserve contracts

- keep rsc-map-renderer-observe independently buildable;
- document the Admin extension boundary;
- document the current Observer/MapEntity semantics;
- identify viewer package entry points;
- avoid renderer-specific code in Admin core.

## Milestone 1 — Level C hosted extension

- add general Admin extension registry/host;
- register world-viewer;
- add /world;
- host the independently built viewer;
- use existing demo/simulation data initially;
- verify Admin and viewer can fail independently.

## Milestone 2 — connected world identity

- pass selected server/world context;
- define world asset/profile manifest;
- show mismatch/unavailable state;
- keep authentication boundary explicit.

## Milestone 3 — live external observations

- connect an existing observer/bot source;
- normalize to Observer[];
- show observer health/coverage;
- validate deduplication and tick interpolation.

## Milestone 4 — Admin entity selection

- viewer emits selected entity;
- Admin opens player/NPC/object inspector;
- link selected entities to existing Admin routes/data.

## Milestone 5 — Level A native integration

- consume viewer as package or workspace dependency;
- lazy-load native route;
- share server selection/theme/navigation;
- keep renderer-specific state inside the world feature.

## Milestone 6 — server-native truth

- define bounded world DTOs/deltas;
- add opt-in server-world observation adapter;
- verify game-loop impact;
- support Server Truth mode.

## Milestone 7 — compare/debug

- preserve observer state independently;
- add Observer vs Server comparison;
- expose synchronization discrepancies.

## Milestone 8 — overlays and replay

- collision/spawn/plugin overlays;
- optional recorded observation format;
- replay UI;
- explicit retention/privacy rules.

# Suggested Admin file layout

Eventually:

~~~text
admin-2026/web/src/features/world/
├── world-page.tsx
├── extension/
│   ├── world-extension-host.tsx
│   └── world-extension-context.ts
├── selection/
│   ├── world-selection.ts
│   └── entity-inspector.tsx
├── queries/
│   └── world-observation.ts
└── types/
    └── world-observer.ts
~~~

Do not create these files until the implementation reaches the relevant milestone.

Generic extension-host code belongs outside the world feature, for example under a shared app/extensions area selected when implementation begins.

# Suggested capabilities

Potential future capabilities:

~~~text
world.read
world.observe
world.inspect
world.debug.collision
world.debug.observers
world.replay.read
~~~

World mutations should reuse existing domain capabilities rather than hiding them behind one broad world.write.

Examples:

~~~text
players.teleport
players.message
players.kick
world.spawn
world.remove
~~~

Final names should be decided with the broader Admin capability model.

# Architectural decisions

1. **The World Viewer is an Admin Extension, not a reason to merge renderer code into Admin.**
2. **The renderer remains independently runnable and useful outside Admin.**
3. **Level C iframe integration is the preferred first implementation.**
4. **Level A native React integration is the preferred mature UX.**
5. **The Observer contract is the stable seam between observation sources and rendering.**
6. **The viewer remains transport agnostic.**
7. **Server-native world state is optional and should be added only through explicit DTO/event boundaries.**
8. **Observer truth and server truth should remain distinguishable.**
9. **Read-only observation comes before administrative world mutations.**
10. **OpenRSC runtime health always has priority over visualization freshness.**

# Long-term vision

The mature World extension can become more than a world map.

It can become a spatial observability and debugging surface for OpenRSC:

~~~text
2003 game world
       +
2026 operational tooling
~~~

Possible mature workflow:

~~~text
World Viewer
   │
   ├── see live players/NPCs/items
   ├── inspect entity
   ├── inspect observer coverage
   ├── compare observer vs server truth
   ├── inspect collision/pathfinding
   ├── jump to plugin/content relationships
   ├── replay a prior incident
   └── invoke explicit authorized Admin actions
~~~

The World Viewer should feel like a first-class part of Admin 2026 while remaining a specialized engine with its own clean lifecycle.

## Primary principle

**Observe first, inspect second, diagnose third, and only then operate. Keep the renderer independent; make the Admin integration native in experience rather than monolithic in implementation.**
