# Admin 2026 Tasklist

> Canonical lightweight progress tracker for Admin 2026.

Project sequence:

**inventory → expose → visualize → operate → extend**

Use only **Doing**, **To Do**, **Done**, and **Back Burner**. Keep **Doing** small.

---

## Doing

### Phase 0 — Inventory and baseline

- [ ] Verify local OpenRSC server startup from this fork.
- [ ] Record supported/recommended Java and Gradle runtime.
- [ ] Record startup steps, database requirements, and required config.
- [ ] Inventory server lifecycle/status data, tick metrics, and packet metrics.
- [ ] Inventory admin/moderator commands by category.
- [ ] Inventory plugin system state that can already be exposed.
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
- [ ] Add reusable TanStack `DataTable` abstraction.
- [ ] Add reusable chart/diagram primitives.
- [ ] Add reusable admin form/action pattern.
- [ ] Add OpenAPI-generated client/type workflow.
- [ ] Add Playwright browser-test baseline.
- [ ] Add route-level code splitting for heavy visualization packages.

## To Do

### Phase 1 — Expose

- [ ] Add isolated Java admin bootstrap.
- [ ] Add `ServerStatus` and `WorldStatus` DTOs.
- [ ] Add `PlayerSummary` and `PlayerDetails` DTOs.
- [ ] Add `PluginSummary` and `PluginDetails` DTOs.
- [ ] Add `AdminUtility` descriptor model.
- [ ] Add read-only server/status API.
- [ ] Add online-player and player-detail APIs.
- [ ] Add plugin inventory API.
- [ ] Add admin utility catalog API.
- [ ] Expose existing tick and packet metrics.
- [ ] Expose available server/world instances.
- [ ] Add internal admin event bus and login/logout events.
- [ ] Add WebSocket or SSE live event stream.

### Phase 2 — Visualize

- [ ] Replace overview mock data with live APIs.
- [ ] Build live player list and player inspector.
- [ ] Build plugin/content explorer.
- [ ] Build admin utility catalog UI.
- [ ] Build tick/packet metric visualizations.
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

### Project setup

- [x] Create Admin 2026 project manifest and agent guidance.
- [x] Complete initial RSC ecosystem research.
- [x] Select OpenRSC Core Framework as the primary platform.
- [x] Migrate Admin 2026 docs to this fork.
- [x] Refocus Admin 2026 as a GUI control plane for existing OpenRSC capabilities.

## Back Burner

- [ ] Redis/pub-sub for distributed worlds.
- [ ] Prometheus / Grafana / OpenTelemetry.
- [ ] Separate analytics database.
- [ ] Deep packet inspection and full replay UI.
- [ ] Containerized all-in-one development stack.
- [ ] Broad dependency modernization.
- [ ] 3D model/content preview tooling.
