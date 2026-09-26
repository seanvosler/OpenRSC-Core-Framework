# Admin 2026 Tasklist

> This file is the canonical lightweight progress tracker for Admin 2026.
> Update it whenever work changes project state.

Keep this document short and operational.

Use only these states:

- **Doing**
- **To Do**
- **Done**
- **Back Burner**

Keep **Doing** to one or two items whenever possible.

---

## Doing

### Phase 0 — OpenRSC architecture and baseline

- [ ] Verify local OpenRSC server startup from this fork.
- [ ] Record the supported/recommended Java and Gradle runtime.
- [ ] Record baseline startup steps, database requirements, and required config.
- [ ] Record baseline tick behavior, JVM memory, and startup/runtime warnings.
- [ ] Inventory existing server/tick/packet metrics already exposed in `Server.java`.
- [ ] Inventory existing admin/moderator command capabilities.
- [ ] Inventory existing logging and database query capabilities relevant to admin.
- [ ] Define initial DTO, command, and event naming conventions.
- [ ] Establish initial local-development authentication approach.
- [ ] Define the minimum verification/test strategy for new admin code.

## To Do

### Phase 1 — Observation

- [ ] Add isolated admin bootstrap wiring.
- [ ] Add `ServerStatus` DTO.
- [ ] Add `WorldStatus` DTO.
- [ ] Add `PlayerSummary` DTO.
- [ ] Add `PlayerDetails` DTO.
- [ ] Add read-only status API.
- [ ] Add online players API.
- [ ] Add player details API.
- [ ] Add internal admin event bus.
- [ ] Emit player login events.
- [ ] Emit player logout events.
- [ ] Add WebSocket or SSE live event stream.
- [ ] Expose existing tick-stage metrics.
- [ ] Expose existing packet count/timing metrics.
- [ ] Add first dashboard application shell.
- [ ] Add server/world status view.
- [ ] Add live online-player list.
- [ ] Add player inspector.
- [ ] Add basic live event feed.

### Phase 2 — Controlled operations

- [ ] Define dashboard capability mapping from existing OpenRSC staff groups.
- [ ] Categorize existing OpenRSC admin/mod commands into dashboard-relevant operations.
- [ ] Add admin mutation audit integration.
- [ ] Add player message command.
- [ ] Add player teleport command.
- [ ] Add player kick command.
- [ ] Add mute/unmute command.
- [ ] Add ban/unban command.
- [ ] Add world broadcast command.
- [ ] Add save-all command.
- [ ] Add graceful restart/update command.
- [ ] Add audit-history view.

### Phase 3 — Plugin observability

- [ ] Inventory current plugin trigger classes and registrations.
- [ ] Expose loaded plugin inventory.
- [ ] Instrument plugin invocation counts.
- [ ] Instrument plugin execution timing.
- [ ] Capture plugin errors safely.
- [ ] Expose quest/minigame/shop plugin relationships.
- [ ] Add plugin/content explorer.
- [ ] Evaluate controlled plugin reload from the dashboard.

### Phase 4 — World tooling

- [ ] Add entity inspector.
- [ ] Add shop inspector.
- [ ] Add spawn inspection.
- [ ] Add snapshot browser.
- [ ] Evaluate existing OpenRSC/2003Scape map assets for a live world map.
- [ ] Add live world map.
- [ ] Add pathfinding/debug views.

### Phase 5 — Historical analytics

- [ ] Inventory existing OpenRSC logging tables and portal queries before adding schema.
- [ ] Add moderation history views.
- [ ] Add economy-flow analytics.
- [ ] Add quest/content analytics.
- [ ] Add operational trend views.
- [ ] Introduce new historical storage only for gaps not covered by OpenRSC.

### Phase 6 — Multi-world control plane

- [ ] Expose multiple in-process servers from `Server.serversList`.
- [ ] Add server/world selector in the dashboard.
- [ ] Add cross-world operations where safe.
- [ ] Determine whether external pub/sub is actually necessary.
- [ ] Add external control-plane infrastructure only if deployment topology requires it.

## Done

### Project setup

- [x] Create original Admin 2026 project manifest.
- [x] Create agent guidance.
- [x] Create canonical lightweight task tracker.
- [x] Complete initial RSC/RuneScape Classic GitHub landscape research.
- [x] Select OpenRSC Core Framework as the primary server platform for Admin 2026.
- [x] Migrate Admin 2026 planning documents into `seanvosler/OpenRSC-Core-Framework`.
- [x] Rewrite Admin 2026 architecture assumptions for OpenRSC/Java/Netty/database/plugin systems.

## Back Burner

- [ ] Redis/pub-sub for distributed multi-process worlds.
- [ ] Prometheus integration.
- [ ] Grafana dashboards.
- [ ] OpenTelemetry tracing.
- [ ] Separate PostgreSQL analytics store.
- [ ] Deep packet inspection UI.
- [ ] Full replay tooling inspired by RSC+.
- [ ] PCAP browser/inspection UI.
- [ ] Containerized all-in-one development stack.
- [ ] Broad legacy dependency modernization.
- [ ] 3D model/content preview tooling.
