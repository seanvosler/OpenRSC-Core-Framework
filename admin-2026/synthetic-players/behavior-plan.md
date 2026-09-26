# Synthetic Behavior Runtime Plan

## Goal

Turn server-side synthetic players into bounded autonomous actors that can exercise real OpenRSC gameplay systems for Admin 2026 monitoring.

The first gameplay proof is one synthetic miner that uses normal pathing and the normal mining plugin path.

## Design rules

- Synthetic players remain normal server-side `Player` objects.
- Behavior code chooses intent; it must not award XP, spawn ore, or directly mutate gameplay outcomes.
- Gameplay actions should flow through existing OpenRSC action/plugin machinery.
- Behaviors run cooperatively from the game event/tick system; no thread per bot.
- Decision cadence is bounded and slower than the game tick where practical.
- Every actor exposes behavior/state metadata for future Admin APIs.
- Population size, behavior assignment, and spawn location stay deterministic/configurable.

## Runtime layers

```text
SyntheticPopulationService
  -> SyntheticActor
       -> Player
       -> SyntheticBehavior
       -> SyntheticActions
            -> walking / plugin triggers / combat / banking adapters
```

`SyntheticBehavior` owns decisions and state transitions. `SyntheticActions` is the narrow bridge into existing game mechanics.

Starting skills, XP, equipment, inventory, spawn state, and behavior assignment belong to a separate declarative profile/scenario layer; see [`synthetic-profiles.md`](synthetic-profiles.md). Profiles establish fixture state, while behaviors drive normal gameplay after startup.

## Milestones

1. Behavior runtime
   - actor wrapper
   - behavior interface
   - periodic decision loop
   - IDLE and WANDER proof behaviors

2. Semantic object action adapter
   - locate world objects
   - walk adjacent
   - invoke `OpLocTrigger` using the object's real command

3. Basic miner
   - spawn one miner near a known mine
   - provision only fixture prerequisites such as a bronze pickaxe
   - discover a nearby object with an `ObjectMiningDef`
   - walk to the rock
   - invoke its normal "mine" operation
   - observe inventory/XP/object depletion through existing systems

4. Looping miner
   - retry depleted/busy rocks
   - choose another nearby rock
   - stop or change state when inventory is full

5. Mixed population
   - deterministic behavior assignment across 15 actors
   - add woodcutting/combat/fishing/banking incrementally
   - expose behavior/state/target through Admin DTOs

## Initial test acceptance

- 15 synthetic users remain live.
- At least one actor is driven by the behavior runtime.
- WANDER demonstrates repeated autonomous decisions without packet input.
- The mining adapter reaches the registered mining plugin rather than reimplementing mining.
- No gameplay reward is granted directly by synthetic behavior code.
