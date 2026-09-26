# Synthetic Players

Development-only synthetic population tooling for Admin 2026 / OpenRSC.

## Purpose

Provide controllable server-side test actors that appear in a development OpenRSC world so Admin 2026 and server features can be exercised without requiring real players.

The initial goal is deliberately small:

- spawn a configurable number of synthetic players on a dev server
- make them visible through normal world/player inspection paths where practical
- give each actor a simple behavior profile
- start/stop synthetic population cleanly
- keep the feature optional and disabled by default
- avoid requiring a graphical or network client for the first implementation

This is **not** intended to be a production botting system and should not be enabled on public production worlds.

## Naming

OpenRSC already uses the term "plugin" for its trigger-based gameplay/content plugin system.

Until implementation proves otherwise, this project should be treated as a **synthetic population harness** rather than an OpenRSC plugin.

## Proposed architecture

```text
Admin 2026 (eventually)
        |
        | explicit dev-only commands
        v
SyntheticPopulationService
        |
        +-- SyntheticPlayerFactory
        |
        +-- SyntheticActor 01 -- BehaviorProfile
        +-- SyntheticActor 02 -- BehaviorProfile
        +-- ...
        +-- SyntheticActor 15 -- BehaviorProfile
        |
        v
OpenRSC World / normal server systems
```

The OpenRSC server remains authoritative.

Synthetic actors should use existing world, movement, event, NPC, object, inventory, combat, and plugin behavior where feasible rather than reimplementing those systems.

## First behavior profiles

Start with behaviors that are useful for testing and easy to reason about:

- `IDLE` — remain online/in-world
- `WANDER` — walk within a bounded region
- `PATROL` — follow a fixed route
- `SOCIAL` — occasional safe public messages
- `INTERACT` — interact with selected safe NPCs/objects

Later candidates:

- mining / banking loops
- fishing / cooking loops
- combat
- shops
- trading between synthetic actors
- quest-state testing
- disconnect/reconnect or failure scenarios

## Design constraints

1. **Dev-only and disabled by default.**
2. **No impact on normal startup** when the harness is disabled.
3. **No arbitrary browser-to-Java mutation.** Admin controls must eventually use explicit validated commands.
4. **No passwords, account secrets, or real-user impersonation.**
5. **Synthetic identities must be unmistakable** in logs/admin surfaces.
6. **Multi-server aware.** Never assume only one OpenRSC `Server` exists.
7. **Bounded work.** Synthetic activity must not create unbounded queues or block the game tick.
8. **Deterministic mode where useful** so scenarios can be reproduced from a seed.
9. **Clean teardown.** Stopping a scenario must remove actors and release associated scheduled work.
10. **Tests before scale.** Prove 1 actor, then 3-5, then the initial target of 15.

## Initial implementation path

### Phase 0 — investigation

Trace how a normal player is represented, registered with the world, processed per tick, moved, and removed.

Inspect at minimum:

- `server/src/com/openrsc/server/model/entity/player/Player.java`
- `server/src/com/openrsc/server/model/world/World.java`
- player login/session creation paths under `server/src/com/openrsc/server/net/`
- player processing in `Server.java`
- movement/walk-action code
- event scheduling / `GameEventHandler`
- plugin trigger entry points

The first technical question is whether a safe server-side actor can reuse `Player` directly, should subclass it, or should use a narrower adapter/facade.

### Phase 1 — one idle synthetic actor

Create one actor entirely server-side with explicit lifecycle:

```text
create -> register -> visible -> tick/process -> unregister -> destroy
```

No autonomous behavior yet.

Success means normal server operation continues and Admin/player inspection can distinguish the actor from a real user.

### Phase 2 — behavior engine

Introduce a small state-machine interface, for example:

```java
interface SyntheticBehavior {
    void onStart(SyntheticActor actor);
    void onTick(SyntheticActor actor);
    void onStop(SyntheticActor actor);
}
```

Keep behaviors cooperative and bounded. Avoid one thread per actor.

### Phase 3 — population scenarios

Add declarative scenarios such as:

```text
mixed-15
  5 x IDLE
  5 x WANDER
  3 x PATROL
  2 x INTERACT
```

A scenario should support:

- actor count
- spawn region
- behavior mix
- random seed
- maximum lifetime
- start/stop status

### Phase 4 — Admin 2026 control surface

Only after the server-side lifecycle is stable, expose explicit dev-only operations such as:

- list synthetic actors
- start scenario
- stop scenario
- stop all
- inspect synthetic actor state

The eventual GUI can provide a **Synthetic Population** developer utility rather than mixing these controls into normal player moderation.

## Questions to answer during investigation

- What invariants does `Player` assume about an attached network session?
- Can a player safely exist without a channel/session?
- Which world registration APIs must be used for normal visibility?
- Which player processing paths assume a real client?
- What persistence/database behavior must synthetic actors bypass?
- Should synthetic actors participate in saves?
- How should plugin triggers identify synthetic actors?
- Which events/actions are safe to invoke directly from server-side behavior?
- Can existing NPC/pathfinding/walk-action machinery be reused cleanly?
- What lifecycle hooks are required to guarantee clean shutdown?

## Initial target

A good first milestone is:

> Start a dev server, spawn 15 clearly marked synthetic actors, have a subset wander safely around a bounded area for several minutes, observe them in normal Admin 2026 player/server views, then remove all 15 cleanly without restarting the server.

That is enough to validate the server-side approach before adding richer gameplay automation.
