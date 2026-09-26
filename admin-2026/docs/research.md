# Admin 2026 — RSC Ecosystem Research

_Updated after migration to OpenRSC Core Framework: 2026-09-26_

This document records the initial landscape check of open-source RuneScape Classic projects and the implications for Admin 2026.

## Decision outcome

Admin 2026 is now being developed against **OpenRSC Core Framework** rather than the older 2003Scape Node.js server.

Primary repository:

- `seanvosler/OpenRSC-Core-Framework`

Upstream reference:

- `Open-RSC/Core-Framework`

The main reasons for the move are:

- OpenRSC is actively maintained.
- It has a substantially richer game/server feature set.
- It already contains mature staff/admin/moderation systems.
- It already has extensive logging and database support.
- It already tracks useful operational metrics.
- It has an established plugin system with load/unload/reload behavior.
- It supports many configurable world variants and custom features.

The original 2003Scape research remains useful because several of its libraries and tools are still attractive for admin/debug UI work.

---

## OpenRSC Core Framework

Repository:

- https://github.com/Open-RSC/Core-Framework

Status observed during research:

- active through September 2026
- Java server framework
- Netty networking
- MySQL and SQLite support
- extensive plugin/content system
- extensive admin/moderator commands
- AGPLv3

### Existing operational features relevant to Admin 2026

OpenRSC already includes:

- Owner/Admin/Moderator/Developer/Event-style groups
- save-all operations
- graceful server update/restart workflows
- shutdown operations
- player messaging and moderation commands
- bans/mutes/IP-related moderation tooling
- inventory/bank/stat manipulation commands
- NPC and item spawning tools
- world/event control commands
- plugin reload infrastructure
- database-backed logging
- login/staff/moderation logging
- server tick-stage timing fields
- incoming/outgoing packet opcode timing/count fields
- world snapshots
- PCAP logging support
- multi-server registry in-process

### Admin 2026 implication

Admin 2026 should not replicate the existing command system.

Instead, existing command implementations should be treated as domain references for explicit API operations.

For example:

```text
existing ::saveall behavior
        ↓
Admin 2026 world.saveAll command
        ↓
authorization + validation + audit
```

Likewise, existing staff groups should inform default capability mappings, not become the only authorization mechanism.

---

## OpenRSC Website Portal

Repository:

- https://github.com/Open-RSC/Website-Portal

Observed useful features include:

- player search/listing
- player detail views
- inventory views
- bank views
- item/NPC databases
- chat logs
- private-message logs
- staff logs
- trade logs
- login history
- rename logs
- auction logs
- world map
- admin maintenance tasks

### Admin 2026 implication

The Website Portal is a valuable reference for:

- fields operators actually use
- log filters
- database query patterns
- moderation workflows
- economy views
- player inspection UX

Admin 2026 should differ by emphasizing live runtime state and live operations rather than being primarily database-driven.

Private-message and IP visibility should not be copied automatically; those remain explicit privacy/product decisions.

---

## RSCPlus

Repository:

- https://github.com/RSCPlus/rscplus

Relevant ideas:

- packet/session replay
- diagnostic recording
- player/NPC/item debug overlays
- server extension system
- world subscription metadata

### Admin 2026 implication

Replay tooling remains a good long-term idea but should stay deferred until normal structured events and metrics are working.

The server-extension concept may later be useful for exposing world metadata or enhanced-client features.

---

## 2003Scape projects still worth using

Although Admin 2026 moved away from the 2003Scape server runtime, some 2003Scape libraries remain attractive.

### `2003scape/rsc-world-map`

An embeddable JavaScript RSC world map with:

- zoom
- plane switching
- labels
- points of interest
- object overlays
- search

This remains a strong candidate for a future live admin map if its coordinate/data assumptions can be reconciled cleanly with OpenRSC.

### `2003scape/rsc-landscape`

Useful reference/tooling for:

- world-map rendering
- tile inspection
- terrain/sector decoding

OpenRSC has its own world representation, so this should be treated as optional tooling rather than a runtime dependency.

### `2003scape/rsc-path-finder`

Useful reference for:

- path visualization
- collision debug
- line-of-sight tooling

Admin 2026 should first inspect OpenRSC's own pathfinding/debug facilities before importing another implementation.

### `2003scape/rsc-models`

Possible future use for content/model inspection. Back burner.

---

## damiantw/rsc-docker

Repository:

- https://github.com/damiantw/rsc-docker

Useful deployment reference showing OpenRSC packaged with:

- database
- server
- browser client
- Docker Compose

This may inform a future Admin 2026 local-development stack, but containerization is not a Phase 0 requirement.

---

## RSCGo

Repository:

- https://github.com/Zlacki/RSCGo

Useful mainly as an alternate protocol/server implementation.

It appears substantially less active and less operationally complete than OpenRSC, so it is not a primary implementation reference.

---

## Era/authenticity note

OpenRSC Preservation is not a strict 2003 snapshot.

OpenRSC aims broadly at preserving the mature/final RuneScape Classic experience and also supports multiple configured world variants, including retro/custom configurations.

This matters when borrowing gameplay/content:

- admin/operations patterns are broadly reusable
- protocol and bug-fix research can be broadly useful
- gameplay/content changes still need era/authenticity review if a particular historical target matters

Admin 2026 itself is largely era-agnostic because it operates on server/runtime state.

---

## Updated feature overlap matrix

| Admin 2026 idea | Existing prior art | Current approach |
|---|---|---|
| Server status | OpenRSC `Server.java` metrics | Expose existing values |
| Tick profiler | OpenRSC timing fields | Expose before adding instrumentation |
| Packet metrics | OpenRSC opcode counters/timers | Expose selectively |
| Player list/detail | OpenRSC runtime + Website Portal | Live DTOs informed by portal UX |
| Inventory/bank viewer | OpenRSC `Player` + Portal | Live DTOs |
| Staff roles | OpenRSC `Group` | Map to capabilities |
| Moderation actions | OpenRSC command plugins | Wrap domain behavior in explicit API commands |
| Audit/staff history | Existing OpenRSC logging | Reuse/extend |
| Chat/login/trade logs | Website Portal/OpenRSC DB | Reuse existing persistence |
| Plugin inventory | OpenRSC `PluginHandler` | Expose existing registrations |
| Plugin reload | OpenRSC `PluginHandler` | Controlled future command |
| Snapshot browser | OpenRSC `World` snapshots | Direct future reuse |
| Live map | 2003Scape world-map + OpenRSC world data | Evaluate integration |
| Replay/debug sessions | RSC+ | Back burner |
| Multi-world dashboard | `Server.serversList` | Support in-process first |
| Docker dev stack | rsc-docker | Optional future onboarding |

---

## Recommended immediate research

During Phase 0:

1. trace `Server` startup, lifecycle and game update scheduling
2. locate the concrete game-state updater/tick loop
3. inspect `GameEventHandler`
4. inventory getters for existing timing metrics
5. inspect login/logout paths for safe event insertion points
6. inspect staff command plugins and their permission checks
7. inspect staff/login/trade/chat logging query classes
8. inspect Website Portal queries for operator-facing fields
9. determine supported Java/Gradle versions in practice
10. establish a repeatable local boot/test environment

---

## Implementation note

This file is a landscape/research record, not the live implementation plan.

Since this research was completed, Admin 2026 has:

- selected OpenRSC Core Framework as the server platform
- adopted a Vite + React + TypeScript GUI architecture
- created a working mock-backed dashboard scaffold under `admin-2026/web/`

For current architecture and execution state, use:

- `admin-2026/readme.md`
- `admin-2026/docs/gui-stack.md`
- `admin-2026/docs/tasklist.md`

## Current architecture recommendation

```text
OpenRSC Core Framework
  + existing Server/World/Player models
  + existing plugin infrastructure
  + existing logging/database layer
  + existing timing/packet instrumentation
              |
              v
       Admin 2026 Java API
              |
        HTTP + live events
              |
              v
      React/TypeScript UI
```

This is now the baseline direction for Admin 2026.
