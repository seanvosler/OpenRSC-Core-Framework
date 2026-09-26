# Admin 2026 Tasklist

> Canonical lightweight progress tracker for Admin 2026.

Project sequence:

**inventory → expose → visualize → operate → extend**

Use only **Doing**, **To Do**, **Done**, and **Back Burner**. Keep **Doing** small.

---

## Doing

### Next vertical slice — login/logout events

See `admin-2026/docs/next-slices.md` for the implementation rationale.

- [ ] Identify authoritative login/logout insertion points.
- [ ] Add a bounded internal admin event bus.
- [ ] Define the first transport-safe login/logout event DTO.
- [ ] Add SSE or WebSocket read-only event transport.
- [ ] Invalidate/refetch player queries from login/logout events.
- [ ] Replace the mock activity feed with live login/logout events.

### Phase 0 — Inventory and baseline

- [ ] Record normal startup steps, database requirements, and required config.
- [x] Inventory server lifecycle/status data and tick-stage metrics.
- [ ] Inventory packet count/timing metrics in detail.
- [ ] Inventory admin/moderator commands by category.
- [x] Inventory initial plugin system state that can already be exposed.
- [ ] Inventory logging/history tables and queries.
- [ ] Inventory snapshots and existing debug utilities.
- [ ] Define initial DTO/query/command/event conventions.
- [ ] Define initial authentication and capability approach.
- [ ] Define backend verification/test strategy.
### GUI foundation

- [x] Define GUI architecture in `admin-2026/docs/gui-stack.md`.
- [x] Create local sparse development checkout under `~/rsc/OpenRSC-Core-Framework`.
- [x] Scaffold `admin-2026/web/` with React + TypeScript + Vite.
- [x] Add Tailwind CSS 4 and shadcn/ui foundation.
- [x] Add TanStack Router and TanStack Query providers.
- [x] Add TanStack Table, Recharts, React Flow, React Hook Form, and Zod dependencies.
- [x] Add RSC Classic theme tokens and application shell.
- [x] Add representative overview/player/plugin/metrics/diagram mock UI.
- [x] Add Vitest + React Testing Library smoke-test baseline.
- [x] Verify production frontend build succeeds.
- [x] Add reusable TanStack `DataTable` abstraction.
- [ ] Add reusable chart/diagram primitives.
- [ ] Add reusable admin form/action pattern.
- [ ] Add OpenAPI-generated client/type workflow.
- [ ] Add Playwright browser-test baseline.
- [ ] Add route-level code splitting for heavy visualization packages.

## To Do

### Phase 1 — Expose

- [x] Add initial privacy-safe `PlayerSummary` DTO.
- [ ] Add `PlayerDetails` DTO.
- [x] Add initial `PluginSummary` inventory DTO.
- [ ] Add `AdminUtility` descriptor model.
- [x] Add online-player API.
- [ ] Add player-detail API.
- [x] Add plugin inventory API.
- [ ] Add admin utility catalog API.
- [ ] Expose packet count/timing metrics.
- [ ] Add internal admin event bus and login/logout events.
- [ ] Add WebSocket or SSE live event stream.

### Phase 2 — Visualize

- [ ] Replace remaining overview mock data as APIs become available.
- [x] Build initial live player list.
- [ ] Build player inspector.
- [x] Build initial live plugin/content explorer.
- [ ] Build admin utility catalog UI.
- [ ] Add packet metric visualizations.
- [ ] Build live event feed.
- [ ] Build server/world selector.
- [ ] Add read-only log/history views.

### Phase 3 — Operate

- [ ] Map OpenRSC groups to dashboard capabilities.
- [ ] Add mutation audit integration.
- [ ] Add message, teleport, kick, mute, and ban actions.
- [ ] Add broadcast, save-all, and graceful restart actions.
- [ ] Add selected spawn/debug utilities.
- [ ] Add confirmation/danger levels and audit-history UI.

### Phase 4 — Plugin control & diagnostics

- [ ] Expose trigger registrations and content relationships.
- [ ] Add plugin invocation/timing/error metrics where performance-safe.
- [ ] Add plugin diagnostics UI.
- [ ] Evaluate controlled plugin reload from GUI.
- [ ] Add quest/content debugging views.

### Phase 5 — World & developer tooling

- [ ] Add entity, shop, spawn, and snapshot inspectors.
- [ ] Evaluate and add live world map.
- [ ] Add pathfinding/debug views.
- [ ] Add runtime configuration viewer.
- [ ] Evaluate safe PCAP/debug tooling exposure.

### Phase 6 — Historical analytics

- [ ] Reuse existing moderation/login/trade/chat/staff logs.
- [ ] Identify historical-data gaps.
- [ ] Add economy, quest/content, and operational trend analytics.
- [ ] Add new historical storage only for demonstrated gaps.

### Phase 7 — Multi-world control plane

- [ ] Expose all in-process servers from `Server.serversList`.
- [ ] Add cross-world overview and safe operations.
- [ ] Add external pub/sub only if deployment topology requires it.

### Phase 8 — Extend

- [ ] Maintain a documented list of capability gaps discovered through GUI work.
- [ ] Add new server capabilities only with explicit rationale and tests.

## Done

### Online player summaries vertical slice — 2026-09-26

- [x] Add privacy-safe `PlayerSummary` / per-server player-list snapshots.
- [x] Exclude IP addresses, private communications, and recovery/account-security data.
- [x] Add live `GET /admin/api/players` endpoint.
- [x] Add typed frontend player client/query and API tests.
- [x] Remove fake player rows from Overview.
- [x] Build live searchable/sortable `/players` route with the shared DataTable.
- [x] Verify the real default world returns `0` online players and renders a truthful empty state.
- [x] Identify the repository-supported non-empty validation route: single-player mode / `make run-client`.
- [ ] Perform a real local client login and verify a populated player row once client/Ant tooling is available.

### Plugin inventory vertical slice — 2026-09-26

- [x] Add copied/unmodifiable plugin type and trigger-registration snapshots to `PluginHandler`.
- [x] Add transport-safe plugin inventory metadata without exposing live plugin instances.
- [x] Enrich quest/minigame plugins from registered world metadata.
- [x] Add live `GET /admin/api/plugins` endpoint.
- [x] Verify 455 handlers, 31 trigger types, 50 quests, 9 minigames, and 92 shops against the running default world.
- [x] Add typed frontend plugin client/query and API tests.
- [x] Add reusable TanStack Table v9 `DataTable` foundation.
- [x] Replace overview mock plugin cards with live OpenRSC content metadata.
- [x] Build searchable/sortable live `/plugins` route.
- [x] Browser-verify live plugin counts, Dragon Slayer metadata, and search filtering.

### Live status vertical slice — 2026-09-26

- [x] Verify the bundled default/Preservation OpenRSC world starts locally against SQLite.
- [x] Record current Java/build compatibility findings in `docs/backend-api.md`.
- [x] Add isolated, opt-in localhost Admin 2026 HTTP bootstrap.
- [x] Add `ServerStatus`, `WorldStatus`, and `TickMetrics` transport snapshots.
- [x] Add read-only `GET /admin/api/status` endpoint.
- [x] Expose all active in-process servers from `Server.serversList`.
- [x] Expose live world counts and existing tick-stage metrics.
- [x] Add typed frontend status client and TanStack Query polling.
- [x] Add Vite proxy for the local Java admin listener.
- [x] Replace overview server-health mock values with live OpenRSC status data.
- [x] Add rolling live tick-duration visualization.
- [x] Wire shell world name and connection state to the live API.
- [x] Browser-verify live values from a running OpenRSC world.
- [x] Add API client tests and document the backend status contract.

### Project setup

- [x] Create Admin 2026 project manifest and agent guidance.
- [x] Complete initial RSC ecosystem research.
- [x] Select OpenRSC Core Framework as the primary platform.
- [x] Migrate Admin 2026 docs to this fork.
- [x] Refocus Admin 2026 as a GUI control plane for existing OpenRSC capabilities.

### Progress log

- **2026-09-26:** Landed the first live end-to-end slice: OpenRSC runtime → read-only Java Admin API → Vite proxy → TanStack Query → live dashboard status/tick data.
- **2026-09-26:** Verified the bundled default world boots locally with SQLite and populated plugin/world data.
- **2026-09-26:** Completed the plugin inventory slice with real handler/trigger/content metadata and a live searchable Plugins page.
- **2026-09-26:** Completed online-player summaries and a live Players page; the default world correctly renders a zero-player empty state.
- **2026-09-26:** Login/logout events are now the active slice.

## Back Burner

- [ ] Redis/pub-sub for distributed worlds.
- [ ] Prometheus / Grafana / OpenTelemetry.
- [ ] Separate analytics database.
- [ ] Deep packet inspection and full replay UI.
- [ ] Containerized all-in-one development stack.
- [ ] Broad dependency modernization.
- [ ] 3D model/content preview tooling.
