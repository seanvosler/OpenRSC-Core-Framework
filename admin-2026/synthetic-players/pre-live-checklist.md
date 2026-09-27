# Synthetic Players — Pre-Live Readiness Checklist

This checklist defines what must be true before the synthetic population harness is treated as ready for routine use on a live development/test server.

"Live" here means an actively running test world used by developers/admins. It does **not** mean public production worlds; the harness remains development-only unless that policy is deliberately revisited.

## 1. Catalog reconciliation

- [ ] Import the synthetic profile catalog into the repository under a stable path.
- [ ] Validate every profile and scenario against a versioned schema.
- [ ] Resolve every `PLACEHOLDER_*` value against authoritative OpenRSC repository data.
- [ ] Verify all item identifiers against real item definitions.
- [ ] Verify all equipment choices are valid for their intended slots.
- [ ] Verify all named spawn areas map to known walkable coordinates.
- [ ] Verify all object/NPC/resource targets exist in the selected server configuration.
- [ ] Verify scenario profile references resolve and actor counts are correct.
- [ ] Document server-config dependencies for profiles that require members/custom content.
- [ ] Reject unknown profile fields, invalid IDs, impossible ranges, and unsupported behavior names with actionable errors.

Do not guess unresolved coordinates, item IDs, quest IDs, NPC IDs, or resource IDs. Reconcile them against the repository/configuration actually used by the target world.

## 2. Profile resolution and variants

- [ ] Implement `ProfileCatalog` / loader.
- [ ] Implement deterministic `VariantResolver`.
- [ ] Produce an immutable `ResolvedSyntheticProfile` before player creation.
- [ ] Derive actor variation from scenario seed + profile ID + actor ordinal.
- [ ] Clamp skill variance to legal/configured server ranges.
- [ ] Validate weighted equipment choices before resolution.
- [ ] Apply spawn jitter only to valid/walkable coordinates.
- [ ] Define explicit semantics for items listed in both inventory and equipment: equipment should consume/equip the starting item rather than duplicate it.
- [ ] Preserve enough resolution metadata to reproduce any actor exactly.
- [ ] Add a dry-run/resolve-only mode that can print a scenario without starting actors.

## 3. Player fixture correctness

- [ ] Initialize skills through consistent XP/level APIs.
- [ ] Confirm current/max skill state remains internally consistent.
- [ ] Provision inventory through normal container models.
- [ ] Provision equipment through normal equipment rules where feasible.
- [ ] Validate client-capability limits for all fixture items.
- [ ] Give synthetic users unmistakably synthetic names/metadata.
- [ ] Keep synthetic database IDs isolated from real-account IDs.
- [ ] Ensure no synthetic fixture writes real account persistence.
- [ ] Confirm no password/account/login credentials are required.
- [ ] Ensure synthetic actors cannot impersonate existing player hashes/names.

## 4. Lifecycle safety

- [x] Start scenario without affecting normal server startup when disabled.
- [ ] Stop one actor cleanly.
- [x] Stop an entire scenario cleanly.
- [x] Stop all synthetic actors cleanly.
- [x] Remove actors from world/player/region indexes.
- [x] Remove or stop all owned synthetic behavior events.
- [ ] Clear queued synthetic client packets.
- [x] Confirm no persistence/logout side effects during synthetic teardown.
- [x] Confirm scenario restart does not leak actors/events/state.
- [x] Confirm server shutdown stops synthetic actors before normal player persistence.
- [ ] Add lifecycle tests for create -> register -> tick -> unregister -> destroy.

## 5. Behavior authenticity

- [ ] Keep behaviors intent-driven; no direct XP/loot/resource reward mutation.
- [ ] Route movement through normal movement/path systems.
- [ ] Route object interactions through normal action/plugin triggers.
- [ ] Route NPC interactions through normal action/plugin triggers.
- [ ] Route combat through normal combat initiation/mechanics.
- [ ] Route banking through normal bank/container logic.
- [ ] Route shops/trading through normal game systems where implemented.
- [ ] Confirm behavior retries are bounded and cannot spin every tick indefinitely.
- [ ] Confirm depleted/blocked/invalid targets result in safe fallback state.
- [ ] Add behavior timeouts/stuck detection.
- [ ] Log behavior failures without crashing the world tick.

## 6. Mining baseline

- [x] Synthetic player can locate a real mineable rock.
- [x] Synthetic player can invoke the authentic `Mining.onOpLoc` plugin.
- [x] Mining reward and XP come from normal OpenRSC mining logic.
- [x] Synthetic player can change target as rocks deplete.
- [ ] Run miner until inventory-full condition.
- [ ] Add deterministic resource preferences.
- [ ] Add bank/deposit loop.
- [ ] Test contention with multiple synthetic miners.
- [ ] Verify resource respawn/depletion behavior under multiple actors.

## 7. Behavior catalog mapping

- [ ] Define the supported public behavior vocabulary.
- [ ] Map catalog behavior aliases to runtime implementations.
- [ ] Reject unavailable behaviors clearly instead of silently falling back.
- [ ] Implement/verify `IDLE`.
- [ ] Implement/verify `WANDER`.
- [x] Implement initial `MINER`.
- [ ] Implement `WOODCUTTER`.
- [ ] Implement `FISHER`.
- [ ] Implement `COOK`.
- [ ] Implement melee combat behavior.
- [ ] Implement ranged behavior.
- [ ] Implement magic behavior.
- [ ] Implement banking/resource-running.
- [ ] Implement shopper/merchant behavior.
- [ ] Implement controlled synthetic-to-synthetic trading.
- [ ] Implement safe social behavior.
- [ ] Define quest-state tester boundaries.
- [ ] Define edge/stress behavior semantics.

## 8. Admin 2026 observability

- [x] Synthetic actors appear in normal player counts.
- [x] Scaffold dedicated `/developer/synthetic-players` Admin page using the existing live player feed.
- [ ] Add synthetic-player list endpoint.
- [x] Expose actor identity through normal player API and dedicated synthetic read model; profile/scenario metadata remains future work.
- [x] Expose behavior name.
- [x] Expose behavior state.
- [ ] Expose target entity/object/location where safe.
- [x] Expose coordinates.
- [ ] Expose relevant skills/XP.
- [ ] Expose inventory/equipment summaries.
- [ ] Expose actor age / last decision / last successful action.
- [ ] Expose stuck/error state.
- [x] Expose explicit `synthetic` metadata and distinguish synthetic actors in the dedicated Developer panel.
- [ ] Add scenario-level status: requested/running/stopped/error counts.
- [ ] Add explicit dev-only start/stop scenario commands.
- [ ] Keep synthetic controls separate from normal moderation actions.

## 9. Real-client visibility

- [ ] Log a genuine client into the same test world.
- [ ] Confirm nearby synthetic players render normally.
- [ ] Confirm appearance data renders correctly.
- [ ] Confirm synthetic walking is visible to real clients.
- [ ] Confirm animations/interactions caused by gameplay are visible where expected.
- [ ] Verify synthetic actors do not require their own network channel.
- [ ] Fix any missing player-update initialization discovered by this test.

## 10. Scale and performance

- [x] 1 synthetic actor stable.
- [x] 15 simultaneous synthetic actors stable.
- [ ] 20-profile mixed scenario stable.
- [ ] 50 actors stable.
- [ ] 100 actors stable.
- [ ] Establish an initial supported actor-count ceiling.
- [ ] Measure game-tick duration under each scale target.
- [ ] Measure behavior/event execution cost.
- [ ] Confirm no unbounded packet/event/message queues.
- [ ] Confirm no thread-per-actor behavior.
- [ ] Test resource contention and dense same-region populations.
- [ ] Test actors distributed across multiple regions.
- [ ] Test multiple OpenRSC `Server` instances if relevant.

## 11. Safety and operational controls

- [x] Harness disabled by default.
- [ ] Require explicit dev/test enable flag.
- [x] Add server-side maximum bootstrap population limit.
- [ ] Add scenario maximum lifetime / optional auto-stop.
- [x] Add idempotent server-side `stopAll()` lifecycle operation; Admin command wiring remains gated on auth/audit.
- [ ] Prevent synthetic actors from connecting to or mutating unintended worlds.
- [ ] Prevent public-production enablement by accidental default configuration.
- [ ] Log scenario start/stop and configuration source.
- [ ] Make actor/scenario seed visible for reproduction.
- [ ] Document rollback/disable procedure.

## 12. Tests

- [ ] Unit tests for profile parsing.
- [ ] Unit tests for profile validation.
- [ ] Unit tests for deterministic variant resolution.
- [ ] Unit tests for equipment/inventory resolution semantics.
- [ ] Unit tests for behavior alias mapping.
- [ ] Integration test for synthetic player creation.
- [ ] Integration test for clean teardown.
- [ ] Integration test for movement.
- [ ] Integration test for mining through plugins.
- [ ] Integration test for scenario start/stop.
- [ ] Regression test ensuring harness-disabled startup is unchanged.

## 13. Documentation

- [ ] Document catalog file locations and schema version.
- [ ] Document supported JVM/config flags.
- [ ] Document how to run one actor.
- [ ] Document how to run a scenario.
- [ ] Document how to reproduce an actor from its seed.
- [ ] Document how to add a new profile.
- [ ] Document how to add a new behavior.
- [ ] Document known unsupported gameplay paths.
- [ ] Keep the build log concise and current.
- [ ] Mark experimental APIs/configuration clearly until stabilized.

## Initial readiness gate

For the first routine dev-server deployment, the minimum recommended gate is:

1. catalog imports and validates;
2. all placeholders used by the chosen scenario are reconciled;
3. resolved profiles are deterministic and inspectable;
4. lifecycle start/stop is clean;
5. synthetic actors are visibly distinguishable from real users;
6. real-client visibility has been proven;
7. Admin can list actor/profile/behavior/state;
8. the chosen scenario runs for an extended test without tick degradation or queue growth;
9. emergency stop-all works;
10. the harness remains disabled by default.
