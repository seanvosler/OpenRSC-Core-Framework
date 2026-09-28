# Admin 2026 Architecture — v0.0.5

> System map for the current Admin 2026 + World Viewer integration.
>
> Version: **v0.0.5**
> Updated: **2026-09-27**

This diagram is the current high-level architecture snapshot for the Admin 2026 control plane, the hosted World Viewer Admin Extension, the OpenRSC Java server, and the baked world-asset pipeline.

Solid arrows represent implemented connections. Dashed arrows represent the next planned integration boundary.

```mermaid
flowchart LR
    classDef browser fill:#eef6ff,stroke:#4f8fd8,stroke-width:1.5px,color:#10233f
    classDef admin fill:#edf5ff,stroke:#4f8fd8,stroke-width:1.5px,color:#10233f
    classDef viewer fill:#ecfbf7,stroke:#32a58d,stroke-width:1.5px,color:#123a32
    classDef server fill:#f3efff,stroke:#7668d8,stroke-width:1.5px,color:#28204d
    classDef assets fill:#f8f6ff,stroke:#8d80df,stroke-width:1.5px,color:#28204d
    classDef api fill:#ffffff,stroke:#4f8fd8,stroke-width:1.25px,color:#10233f
    classDef planned fill:#f0fbf8,stroke:#2c9b83,stroke-width:1.5px,stroke-dasharray: 6 4,color:#123a32

    subgraph BROWSER["1 · Operator / Browser"]
        OP["Operator Browser<br/><br/>Overview<br/>Players<br/>Plugins<br/>World"]:::browser
    end

    subgraph ADMIN["2 · Admin 2026"]
        SPA["Admin 2026 Web SPA<br/>React + Vite + TanStack"]:::admin
        CORE["Overview / Players / Plugins<br/>status · player list · plugin info"]:::admin
        WORLD["World Route: /world<br/>loads the World Viewer extension"]:::admin
        HOST["ExtensionHost<br/>iframe host + postMessage bridge"]:::admin
        CLIENT["Admin API Client"]:::api

        SPA --> CORE
        SPA --> WORLD
        WORLD --> HOST
        SPA --> CLIENT
    end

    subgraph VIEWER["3 · World Viewer Extension"]
        WV["World Viewer Admin Extension<br/>rsc-map-renderer-observe"]:::viewer
        WEBGL["Standalone WebGL Viewer<br/>Three.js · independently hosted · iframe embedded"]:::viewer
        WV --> WEBGL
    end

    subgraph OPENRSC["4 · OpenRSC / Assets"]
        subgraph SERVER["OpenRSC Java Server"]
            ADMINHTTP["Admin HTTP Listener<br/>127.0.0.1:8787<br/>read-only status · plugins · players · events"]:::server
            RUNTIME["Game Runtime<br/>world state · players · NPCs · plugins · tick loop"]:::server
            RUNTIME <--> ADMINHTTP
        end

        ASSETS["Baked World Assets<br/>upstream gh-pages or local asset site<br/><br/>terrain + scenery mesh<br/>textures + sprite atlases<br/>world3d / map data"]:::assets
    end

    OP -->|"HTTPS / web SPA"| SPA

    CLIENT -->|"GET /admin/api/status"| ADMINHTTP
    CLIENT -->|"GET /admin/api/plugins"| ADMINHTTP
    CLIENT -->|"GET /admin/api/players"| ADMINHTTP
    CLIENT -->|"GET /admin/api/events · SSE"| ADMINHTTP

    HOST -->|"iframe"| WEBGL

    HOST <-->|"postMessage bridge v1<br/>viewer.ready<br/>context.changed<br/>context.applied<br/>origin validated"| WEBGL

    WEBGL -->|"/api/world3d/*<br/>/api/map/*<br/>/api/npc-spawns<br/>/api/items/wearables<br/>/api/demo/entities.json"| ASSETS

    RUNTIME -.-> FUTURE["Planned next step<br/>Observer[] / world-state source<br/>live entities + live observation"]:::planned
    FUTURE -.-> WEBGL
```

## Current state

Implemented today:

- OpenRSC exposes the read-only Admin API on the localhost Admin HTTP listener.
- Admin 2026 consumes status, plugin, player, and SSE event endpoints.
- `/world` is registered through the generic Admin Extension system.
- `ExtensionHost` embeds the standalone World Viewer via iframe.
- Admin and the viewer communicate over the versioned **postMessage bridge v1**.
- The bridge currently carries `viewer.ready`, `context.changed`, and `context.applied`.
- Cross-frame messages are origin validated.
- The viewer independently loads static baked world assets.
- Full WebGL rendering has been browser-verified through Admin 2026.

## Next boundary

The next World Viewer integration is deliberately read-only:

```text
OpenRSC Game Runtime
        ↓
bounded transport-safe world state
        ↓
Observer[] / world-state adapter
        ↓
World Viewer
```

That lane should initially carry live entities and observation state only.

It must not introduce world mutations ahead of the Admin security lane:

```text
authentication
    ↓
capabilities
    ↓
audit contract
    ↓
explicit typed mutations
```

## Ownership boundary

### Admin 2026 owns

- authentication and operator identity;
- capability checks;
- navigation and route ownership;
- selected server/world context;
- extension registry and hosting;
- Admin API clients;
- administrative inspectors and actions;
- mutation validation and audit.

### World Viewer owns

- baked world rendering;
- Three.js/WebGL scene;
- terrain and scenery;
- world coordinates;
- entity visualization;
- interpolation;
- observer merging/reconciliation;
- map-specific presentation.

### OpenRSC owns

- authoritative game state;
- players, NPCs, objects, plugins, and tick loop;
- existing server behavior;
- transport-safe Admin snapshots/events;
- eventual authoritative world-state source.

## Related docs

- [Admin Extensions](./admin-extensions.md)
- [World Observer Admin Extension](./world-observer-extension.md)
- [Backend API](./backend-api.md)
- [GUI Stack](./gui-stack.md)
- [Current Implementation Lanes](./next-slices.md)
- [Tasklist](./tasklist.md)

## Primary architectural rule

> **Native in experience, independent in implementation.**

For the World Viewer specifically:

> **Observe first, inspect second, diagnose third, and only then operate.**
