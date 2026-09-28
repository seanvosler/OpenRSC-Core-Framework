# Admin Extensions

> Architecture concept for optional tools that appear as first-class parts of Admin 2026 without requiring every tool to live inside the Admin repository or runtime.

## Purpose

Admin 2026 is the OpenRSC GUI control plane. It should be able to assemble specialized operational and developer tools into one coherent administrative experience without turning the Admin codebase into a monolith.

An **Admin Extension** is an optional UI/tool integration that:

- appears inside the Admin 2026 information architecture;
- can have its own repository, build, dependencies, and release lifecycle;
- can initially run as a separately hosted application;
- can later become a native React integration without changing its product identity;
- receives only explicit Admin context/capabilities;
- cannot make the OpenRSC game runtime depend on the extension;
- must fail soft if unavailable.

The key distinction is:

~~~text
OpenRSC Plugin
    = game/server behavior loaded by OpenRSC

Admin Extension
    = administrative UI/tool integrated into Admin 2026
~~~

Use **extension**, not **plugin**, for this concept so the frontend/tooling architecture does not collide with OpenRSC's established plugin vocabulary.

## Current implementation status

As of 2026-09-27, the first extension-host slice is implemented:

- static extension registry;
- reusable iframe `ExtensionHost`;
- `/world` registered as `world-viewer`;
- configurable hosted URL;
- loading/reload/standalone states;
- versioned, origin-validated two-way bridge;
- selected server-name context;
- unit and browser validation.

This is currently **Level C plus the first Level B context bridge**. Level A native React integration remains future work.

## Product principle

Admin 2026 should be a **control plane and host for specialized OpenRSC tools**, not necessarily the implementation home of every tool.

From an operator's perspective, an extension should feel like part of one product:

~~~text
Admin 2026
├── Overview
├── Players
├── Plugins
├── Utilities
├── Logs
├── Developer
└── Extensions
    ├── World Viewer
    ├── Packet Inspector
    ├── Replay Viewer
    └── ...
~~~

Internally, those tools may remain independent:

~~~text
OpenRSC-Core-Framework
        │
        └── Admin 2026 extension host
                 │
        ┌────────┼─────────┐
        ▼        ▼         ▼
   built-in   external   separately
   feature    web app    versioned UI
~~~

This keeps Admin cohesive for users while preserving clean ownership boundaries for developers.

## Why extensions

Specialized tools often have concerns that should not be pulled into the core Admin runtime.

Examples include WebGL world rendering, packet tooling, replay storage/playback, cache/content inspection, large visualization dependencies, and experimental developer utilities.

Keeping these as extensions provides independent dependencies, build pipelines, release cadence, easier experimentation, reduced Admin bundle size, clearer ownership, easier disablement, and lower risk to the game runtime.

The extension seam should remain intentionally small.

## Core architecture

~~~text
                   OpenRSC Server
                         │
                  Admin API / events
                         │
                         ▼
                  Admin 2026 SPA
                         │
                 Extension Registry
                         │
                  Extension Host
               ┌─────────┴─────────┐
               ▼                   ▼
        Hosted extension      Native extension
        iframe / URL          React component
~~~

Admin owns the shell, security policy, navigation, server/world selection, and extension registration.

The extension owns its specialized domain UI and rendering/tooling behavior.

## C -> A integration path

The preferred evolution is:

~~~text
C — hosted / iframe integration
        ↓
B — hosted but connected integration
        ↓
A — native React integration
~~~

These are integration levels of the same extension, not separate products.

### Level C — Hosted

The extension is built and served independently. Admin provides a route and embeds it with an iframe or equivalent host.

~~~text
Admin route
   │
   ▼
ExtensionHost
   │
   ▼
iframe -> separately built extension
~~~

Benefits:

- minimal coupling;
- fastest way to validate a tool;
- extension dependencies do not enter the Admin bundle;
- extension can be developed and deployed independently;
- failures remain isolated.

This should be the default first integration for substantial external tools.

### Level B — Connected

The extension is still separately hosted but receives explicit Admin context.

Potential context includes:

- selected server/world;
- extension configuration;
- authorized capability set;
- safe API base URL;
- optional short-lived extension session/token;
- theme/presentation hints;
- navigation intents.

The mechanism may be URL/bootstrap configuration, a small postMessage bridge, or a dedicated extension-session API.

Do not expose the Admin application's internal state object directly.

### Level A — Native

The extension becomes an imported React feature/component while preserving the same extension identity and route.

Conceptually:

~~~text
WorldViewerExtension
├── server context
├── capabilities
└── events
~~~

At this level the extension can participate directly in Admin layout, shared dialogs, entity inspectors, TanStack Query state, route/search state, shared theme primitives, keyboard navigation, and contextual admin actions.

A Level A extension does not have to be physically moved into this repository. A separately versioned package is acceptable.

## Minimal extension descriptor

The first registry should be deliberately small.

Conceptual model:

~~~ts
type AdminExtensionMode = "iframe" | "component"

interface AdminExtensionDescriptor {
  id: string
  name: string
  route: string
  mode: AdminExtensionMode

  url?: string
  icon?: string
  category?: string

  requiredCapabilities?: string[]
}
~~~

Example:

~~~text
id:                   world-viewer
name:                 World Viewer
route:                /world
mode:                 iframe
url:                   /extensions/world-viewer/
category:              World
requiredCapabilities:  [world.read]
~~~

Do not start by creating a large extension SDK. Add fields only when a real extension demonstrates the need.

## Extension registry

Admin should maintain one authoritative extension registry.

The registry answers:

- which extensions exist;
- which are enabled;
- where they appear;
- how they are hosted;
- which capability is required to view them;
- how to resolve their entry point.

The registry may initially be static configuration committed with Admin 2026.

Later it could be supplemented by build-time discovery, server-provided descriptors, deployment-local configuration, or an extension manifest.

Do not make runtime discovery from arbitrary URLs the first implementation.

## Routing

Extensions should occupy normal Admin routes.

Examples:

~~~text
/world
/developer/packet-inspector
/developer/replay
/data/cache-browser
~~~

Prefer meaningful product routes over implementation-shaped URLs.

An extension may be external internally while still looking native in the information architecture.

Route ownership should remain with Admin.

## Hosting

### Same-origin hosted extension

Preferred for first iframe integrations when practical:

~~~text
/admin/
/admin/api/*
/extensions/world-viewer/
~~~

Benefits include simpler Content Security Policy, deployment, reverse-proxy configuration, and fewer cross-origin problems.

### Separate origin

Also valid:

~~~text
admin.example.org
world-admin.example.org
~~~

Use explicit allowlists and a narrow context/authentication bridge.

Never assume same-origin privileges are available.

## Admin context

Extensions should receive a small explicit context rather than reaching into Admin internals.

Potential future model:

~~~ts
interface AdminExtensionContext {
  extensionId: string

  server: {
    id: string
    name: string
  } | null

  operator: {
    displayName: string
    capabilities: string[]
  }

  apiBase: string
}
~~~

Sensitive operator/session information should stay inside the Admin authentication boundary.

Do not send passwords, long-lived session secrets, arbitrary cookies/tokens, or undocumented internal Java object identifiers.

## Authentication and authorization

Extensions must not bypass Admin 2026 authorization.

Rules:

1. Extension visibility may be capability-gated in the UI.
2. Server-side APIs remain authoritative.
3. A hidden route is not authorization.
4. Extension-specific backend actions still require explicit capability checks.
5. Hosted extensions should receive only narrowly scoped credentials/session context.
6. State-changing operations must follow the normal Admin audit rules.

Potential capability families:

~~~text
world.read
world.observe
world.inspect
packets.read
packets.capture
replay.read
developer.tools
~~~

Do not grant broad Admin authority merely because a tool is loaded inside the Admin UI.

## Read-only first

New extensions should normally enter Admin as read-only tools.

Preferred progression:

~~~text
observe
   ↓
inspect
   ↓
diagnose
   ↓
act
~~~

Any extension that introduces mutations must use the same command/capability/audit architecture as built-in Admin features.

Extensions must not introduce arbitrary command-string execution, generic Java method invocation, arbitrary SQL, shell execution, or generic mutation of OpenRSC model objects.

## Failure isolation

Admin 2026 and OpenRSC must remain healthy when an extension is unavailable.

An extension outage must not stop the game loop, prevent login, prevent saves, break plugins, break Admin core routes, block Admin bootstrap, or make normal server startup/shutdown depend on the extension.

The extension host should render a clear unavailable/error state.

Hosted extensions should load lazily and remain isolated.

Native extensions with heavy dependencies should use route-level code splitting where practical.

## Performance

Extensions can be expensive.

Examples include WebGL, large map assets, replay data, packet traces, and large tables.

Rules:

- do not load extension bundles on Admin startup unless needed;
- prefer route-level lazy loading;
- keep live event feeds bounded;
- avoid full-world serialization per tick;
- avoid high-frequency state entering global React context;
- let specialized extensions maintain domain-local render state;
- preserve OpenRSC tick/runtime performance over dashboard fidelity.

## Visual integration

Hosted extensions do not need to share Admin's internal component implementation to feel integrated.

At minimum Admin can provide route title, breadcrumb, selected server/world, extension status, and surrounding Admin chrome.

Connected/native integrations can later share RSC Classic/Modern Dark theme tokens, typography, dialogs, tables, inspectors, command palette, and keyboard behavior.

The extension architecture should preserve the project rule:

> Build modern accessible interactions first; apply the RSC visual identity through presentation rather than legacy interaction limitations.

## Accessibility

The extension host should preserve keyboard navigation, focus management, visible focus, screen-reader route/title context, and meaningful fallback states.

Hosted extensions are responsible for accessibility within their own document.

Admin must not assume iframe content automatically inherits accessibility or theme behavior.

## Versioning and compatibility

Native or connected extensions should have an explicit compatibility boundary.

Potential future manifest fields:

~~~text
extensionApiVersion
extensionVersion
minimumAdminVersion
maximumAdminVersion
requiredCapabilities
requiredServerFeatures
~~~

Do not implement these until the first real compatibility problem exists, but do not couple extensions to undocumented Admin internals.

Stable contracts should be preferred over shared mutable implementation state.

## Extension lifecycle

Conceptual lifecycle:

~~~text
registered
   ↓
capability checked
   ↓
route selected
   ↓
lazy load / bootstrap
   ↓
ready
   ↓
connected
   ↓
unmount / disconnect
~~~

Extensions with subscriptions must clean them up on unmount/navigation.

Hosted extensions should not continue expensive hidden work after the user leaves the route unless explicitly required.

## Candidate extensions

### World Viewer

3D/2D OpenRSC world visualization and observation.

See **world-observer-extension.md**.

### Packet Inspector

Read-only packet/opcode observation, timing, and diagnostics using existing OpenRSC metrics first.

### Replay Viewer

Playback of recorded world/admin observations.

### Cache / Content Browser

Inspect definitions, sprites, models, maps, items, NPCs, and other content artifacts.

### Collision / Pathfinding Debugger

Visualize collision, regions, routes, and pathfinding decisions.

### Quest / Plugin Graph

Potentially native rather than separately hosted, but still useful as an extension-shaped tool if it grows specialized dependencies.

## Repository ownership

Preferred boundary:

~~~text
Admin owns:
- extension registry
- route
- host
- permissions
- operator/server context
- shared admin actions
- audit integration

Extension owns:
- specialized rendering
- domain-specific UI
- heavy dependencies
- build artifacts
- specialized state/reconciliation
~~~

The line between them should remain explicit.

## Initial implementation slice

The first extension-host implementation should be intentionally modest:

1. Add an extension descriptor type.
2. Add a static registry.
3. Add one ExtensionHost component.
4. Support mode: iframe.
5. Add capability-aware route visibility once Admin auth/capabilities are live.
6. Add clear loading/unavailable states.
7. Add CSP/allowed-origin configuration where required.
8. Integrate the World Viewer as the first real extension.
9. Learn from that integration before adding an SDK.

Do not block the current authentication/capability/audit vertical slice to build this. The extension host can remain a documented upcoming architecture until those prerequisites are in place.

## Long-term model

~~~text
                         Admin 2026
                    control plane / shell
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
   Core Admin UI        Native Extensions    Hosted Extensions
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                     explicit contracts
                              │
                              ▼
                         OpenRSC Server
~~~

Admin remains coherent without requiring every specialized tool to be merged into one repository, one frontend bundle, or one release lifecycle.

## Primary principle

**An Admin Extension should feel native to the operator while remaining optional and independently evolvable underneath.**
