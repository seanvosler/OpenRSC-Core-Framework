# Admin 2026 Integration — Synthetic Population

## Product placement

Synthetic population controls belong in a dedicated **Developer utility** surface, not normal player moderation.

Current route:

```text
/developer/synthetic-players
```

The page should feel native to Admin 2026 while remaining explicitly development-only and experimental.

## Page responsibilities

The page owns three concerns:

1. **Configuration**
   - actor count
   - profile/scenario selection
   - spawn anchor X/Y or named safe location
   - deterministic seed
   - future variant policy overrides

2. **Lifecycle**
   - start/spawn a synthetic population
   - stop one synthetic actor
   - stop a scenario
   - emergency stop all synthetic actors

3. **Observability**
   - live actor count
   - identity / PID / synthetic database ID
   - position
   - profile
   - behavior
   - behavior state
   - current target
   - last decision/action
   - errors/stuck state

The generic Admin player API already observes synthetic actors because they are real world `Player` objects. Synthetic-specific APIs should add only the metadata and commands the generic player model does not know about.

## Current frontend scaffold

The route is intentionally read-only today.

It:
- consumes the existing live player feed with explicit `synthetic` metadata;
- consumes `GET /admin/api/synthetic-population` for synthetic runtime state;
- displays live actor behavior, state, decision count, identity, and coordinates;
- provides editable spawn/count/behavior fields for the future start-command contract;
- keeps Spawn and Stop All buttons disabled until Admin mutation authorization/audit is merged.

Do not enable mutations until Admin authentication/capabilities/audit and clean synthetic teardown are complete.

## Proposed capabilities

Keep capabilities explicit and separate from normal player moderation:

```text
synthetic.population.read
synthetic.population.resolve
synthetic.population.start
synthetic.population.stop
```

Potential later split:

```text
synthetic.actor.stop
synthetic.scenario.start
synthetic.scenario.stop
synthetic.population.stop_all
```

## Proposed backend command boundary

Avoid browser-provided JVM properties and arbitrary Java mutation.

Conceptual commands:

```text
StartSyntheticPopulationCommand
  serverId
  count
  profileId | scenarioId
  spawnAnchor?
  seed?
  lifetime?

StopSyntheticPopulationCommand
  serverId
  scenarioInstanceId?

StopSyntheticActorCommand
  serverId
  actorId
```

All inputs must be validated against the synthetic profile catalog, server/world selection, population limits, and capability policy.

## Proposed read model

A synthetic-specific read DTO can extend observability without changing `PlayerSummary`:

```text
SyntheticActorSummary
  actorId
  playerIndex
  databaseId
  username
  scenarioId
  profileId
  behavior
  state
  target
  x
  y
  seed
  startedAt
  lastDecisionAt
  lastActionAt
  error
```

Scenario-level status should expose requested/running/stopped/error counts and resolved configuration.

## Lifecycle gate before enabling controls

Spawn/stop controls remain disabled until the remaining Admin mutation gates are complete.

Proven on this branch:

- actor teardown removes world/region/player indexes;
- shared and player-owned behavior events are stopped/removed;
- repeated start/stop does not leak actors/events/state;
- stop-all is idempotent;
- server shutdown removes synthetic actors before normal player persistence;
- a server-side bootstrap population ceiling exists.

Still required before enabling buttons:

- Admin authentication and capabilities are live;
- mutations are audited;
- explicit validated runtime start/stop commands are wired;
- dev-only/production policy gating is enforced at the command boundary.

## Integration principle

Synthetic Population is a first-class Admin page, but the OpenRSC server remains authoritative.

```text
Admin page
  -> explicit validated command
  -> SyntheticPopulationService
  -> normal OpenRSC world/game systems
  -> explicit read DTO / normal player summaries
  -> Admin page
```

No generic shell, SQL, Java reflection, raw `::command`, or arbitrary model mutation belongs in this path.
