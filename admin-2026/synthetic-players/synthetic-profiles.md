# Synthetic Player Profiles and Scenarios

## Purpose

Synthetic profiles define the **initial conditions** for server-side test actors. They are deliberately separate from behaviors.

A profile answers: *what kind of player is this when the scenario starts?*

A behavior answers: *what does this player try to do after startup?*

This separation lets Admin 2026 create reproducible populations with varied levels, equipment, inventories, locations, and gameplay goals without embedding fixture assumptions inside behavior code.

## Separation of concerns

```text
SyntheticScenario
  -> one or more SyntheticProfile assignments
       -> identity / appearance
       -> skills + XP
       -> equipment
       -> inventory
       -> spawn
       -> behavior selection + behavior parameters
       -> deterministic seed
            |
            v
       SyntheticActor
            |
            v
       normal OpenRSC gameplay systems
```

Profiles may configure **starting state**. Once the actor begins running, gameplay outcomes should come from normal OpenRSC mechanics.

Allowed fixture setup examples:
- starting skill XP/levels
- starting inventory
- starting equipped items
- starting location
- appearance
- behavior assignment
- deterministic random seed

Behavior code should not directly grant ore, combat XP, loot, fish, logs, quest rewards, or other gameplay outcomes.

## Proposed profile schema

The on-disk representation can be YAML, JSON, or another validated declarative format. The exact parser is intentionally deferred.

```yaml
id: low-level-miner
displayName: Low-level Miner

identity:
  namePattern: "SynthMiner%02d"
  appearancePreset: worker-basic

spawn:
  region: east-varrock-mine
  x: 70
  y: 542
  radius: 4

skills:
  mining: 15
  attack: 1
  defense: 1
  strength: 1
  hits: 10

equipment:
  weapon: bronze-pickaxe

inventory:
  - item: bronze-pickaxe
    amount: 1
  - item: cooked-meat
    amount: 3

behavior:
  type: MINER
  parameters:
    resource: copper
    stopWhenInventoryFull: true

seed: 1001
tags:
  - gathering
  - low-level
  - mining
```

## Field guidance

### Identity

Keep synthetic accounts unmistakable. Names should remain RSC-safe and deterministic. Avoid impersonating real users.

Suggested fields:
- `namePattern`
- `appearancePreset`
- optional fixed appearance values

### Skills

Prefer configuring **experience** through existing skill APIs and deriving levels where possible. A convenience profile may specify levels, but the loader should translate those levels into internally consistent XP/current/max skill state.

Profiles should be able to specify only relevant skills and inherit normal minimums for everything else.

### Equipment and inventory

Fixture provisioning should use normal item/container models. Validate:
- item definition exists
- client capability supports the item
- inventory capacity is respected
- equipment slot/type is valid
- level requirements are satisfied where appropriate

Do not use profile configuration as a way to bypass gameplay checks after startup.

### Spawn

Support:
- exact `x/y`
- named known-safe fixture locations
- bounded offsets/radius
- scenario-level default with profile override

Prefer known walkable coordinates over arbitrary random global coordinates.

### Behavior

Behavior is referenced by name and optional parameters. Profiles should not contain executable code.

Examples:
- `IDLE`
- `WANDER`
- `MINER`
- future `WOODCUTTER`, `FISHER`, `COMBAT_TRAINER`, `BANKER`, `SHOPPER`

### Determinism

A profile or scenario seed should control non-gameplay test choices such as:
- appearance variation
- spawn offset
- target preference
- idle timing
- behavior assignment

Normal OpenRSC gameplay randomness may remain authoritative unless a dedicated deterministic test mode is introduced later.

## Scenario schema

A scenario composes profiles into a population.

```yaml
id: mixed-20
seed: 2003

defaults:
  spawnRegion: varrock-area
  lifetimeMinutes: 60

population:
  - profile: new-player
    count: 2
  - profile: low-level-miner
    count: 2
  - profile: melee-trainee
    count: 3
  - profile: fisher
    count: 2
  - profile: woodcutter
    count: 2
  - profile: banker
    count: 1
  - profile: shopper
    count: 1
  - profile: social-wanderer
    count: 2
  - profile: mid-level-adventurer
    count: 3
  - profile: high-level-observer
    count: 2
```

Scenario responsibilities:
- population composition
- profile count/assignment
- shared or overridden spawn areas
- deterministic seed
- lifetime / stop conditions
- optional activity-rate limits
- future failure/fault injection settings

## Suggested generalized profile catalog

These are broad archetypes, not final scripts. A later authoring pass can expand each into concrete skills, equipment, inventory, coordinates, behavior parameters, and expected Admin telemetry.

1. **Fresh New Player** — near-minimum stats, starter inventory, mostly idle/wander.
2. **Low-level Miner** — basic Mining, bronze/iron pickaxe, copper/tin loop.
3. **Mid-level Miner** — stronger Mining, better pickaxe, iron/coal targets.
4. **High-level Miner** — high Mining, high-tier pickaxe, advanced ore targets.
5. **Low-level Woodcutter** — basic axe, normal trees.
6. **Mid-level Woodcutter** — improved axe, oak/willow-style progression.
7. **Fisher** — fishing tool/bait fixture, repeated fishing interaction.
8. **Cook** — food inventory plus cooking-range/fire interaction.
9. **Melee Trainee** — low combat stats, simple weapon/armor, weak NPC targets.
10. **Mid-level Fighter** — balanced melee stats, food, sustained NPC combat.
11. **High-level Fighter** — high combat stats/equipment for heavier combat telemetry.
12. **Ranger** — ranged equipment/ammunition and ranged combat behavior.
13. **Mage** — magic level, runes, spell-based combat or utility behavior.
14. **Banker / Resource Runner** — moves between activity area and bank, deposits/withdraws.
15. **Shopper / Merchant** — walks to shops and performs safe buy/sell loops.
16. **Trader** — pairs with another synthetic actor for controlled player-trade scenarios.
17. **Social Wanderer** — walks populated areas and occasionally emits safe deterministic chat.
18. **Quest-state Tester** — fixture quest/cache state for exercising gated objects/NPCs.
19. **Wealthy Veteran** — diverse high-level stats, inventory, bank/equipment for Admin inspection.
20. **Edge-case / Stress Player** — intentionally unusual but valid state: near-full inventory, low HP, high fatigue, many items/statuses, useful for monitoring/UI boundaries.

## Authoring checklist for expanded profiles

When turning an archetype into a concrete profile, specify:

- unique profile `id`
- human-readable purpose
- expected behavior
- starting coordinate or named safe area
- relevant skill XP/levels
- equipment
- inventory and quantities
- behavior type
- behavior parameters/targets
- deterministic seed
- expected observable Admin state
- stop/failure conditions
- assumptions or required server config
- whether gameplay plugins/features are required
- whether the profile is safe to run concurrently with others

Prefer several small focused profiles over one giant profile with many unrelated capabilities.
