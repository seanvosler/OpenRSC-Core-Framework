# Synthetic User Build Log

Goal: one live server-side synthetic user in a local OpenRSC test server.

- 2026-09-26: Dedicated worktree ready on `feature/synthetic-players`. Starting runtime archaeology.

- 2026-09-26: Found channel-less `Player(World,long)` constructor and existing `dummyplayer` convention.
- 2026-09-26: Added dev-only synthetic bootstrap behind `-Dopenrsc.synthetic.enabled=true`; dummy actors skip client-output generation.
- 2026-09-26: Direct javac build succeeds; Gradle wrapper currently fails on legacy duplicate `clean` task.
- 2026-09-26: Independent SyntheticDev world booted on TCP 43694 / WS 43695 / Admin 8797. First actor registered as pid 0 at respawn (120,648).
- 2026-09-26: First tick exposed null `ClientLimitations`; patching synthetic initialization before stability check.

- 2026-09-26: Added synthetic client-version limitations; subsequent run is stable across 30+ ticks.
- 2026-09-26: GOAL REACHED — live Admin status from SyntheticDev reports `world.players: 1`; actor remains server-side, logged in, channel-less, and tick-processed.
- Verification: synthetic world TCP 43694, WS 43695, Admin 8797. Actor log: `Synthetic player online: Synthetic On (pid=0, x=120, y=648)`.
- Note: the ad-hoc core-only javac test does not build gameplay plugins, so startup reports 0 plugin handlers / StartupTrigger warning. This is independent of the synthetic-player tick path and should be resolved by the normal full build at integration time.

- 2026-09-26: NEXT MILESTONE REACHED — Synthetic One now uses the normal `Player.walk()` / `WalkingQueue` path and moved from (120,648) to (123,648).
- Movement proof: queued target (123,648), then delayed runtime check reported `x=123, y=648, finished=true`; Admin status still reported `players: 1`.
- This validates that a channel-less synthetic player can participate in ordinary server-side movement across game ticks.

- 2026-09-26: Pivoted from one actor to population scaling. New target: 15 simultaneous unique synthetic players.
- Refactored bootstrap to `openrsc.synthetic.count` (default 15, capped at 100), unique names `SynthBot01..`, unique synthetic DB IDs, varied appearances, and a compact 5-column spawn grid.

- 2026-09-26: POPULATION MILESTONE REACHED — 15 unique synthetic users registered simultaneously as `Synthbot01` through `Synthbot15`, PIDs 0–14.
- Spawned in a 5×3 grid near respawn; Admin status reported `world.players: 15` at tick 19 with no post-start synthetic runtime errors.
- Bootstrap count is configurable with `-Dopenrsc.synthetic.count=N`, defaults to 15, and is currently capped at 100 for this experimental path.

- 2026-09-26: Added reusable behavior runtime: `SyntheticActor`, `SyntheticBehavior`, `SyntheticPopulationService`, IDLE/WANDER behaviors, and a bounded 2-tick decision loop.
- Added configurable spawn anchor via `openrsc.synthetic.spawnX/spawnY` and behavior selection via `openrsc.synthetic.behavior`.
- Added generic `SyntheticActions` object discovery/interaction bridge; object actions dispatch through normal `OpLocTrigger` handling.
- Added initial `MINER` behavior and test fixture provisioning of a bronze pickaxe.
- Discovered custom client version 10009 requires login-supplied capability metadata; headless synths now default to explicit protocol capabilities for client 235 (override with `openrsc.synthetic.clientVersion`).
- REAL MINING PROOF: Synthbot01 at east Varrock mine targeted copper rock 100, invoked authentic `Mining.onOpLoc`, walked as targets changed, reached copper ore 2 and Mining XP 140. No ore/XP mutation exists in synthetic behavior code.
- Hardened dummy-player output handling to discard queued client packets each tick so channel-less gameplay activity does not accumulate outbound packets.

- 2026-09-26: Documented the next configuration layer in `synthetic-profiles.md`: declarative starting skills/XP, equipment, inventory, spawn, behavior assignment, deterministic seeds, scenario composition, and 20 generalized player archetypes.
- Profiles are explicitly fixture/setup state; post-start gameplay outcomes remain owned by normal OpenRSC systems.

- 2026-09-26: Added `pre-live-checklist.md` to separate prototype success from routine dev-server readiness. It tracks catalog reconciliation (including all `PLACEHOLDER_*` values), profile resolution, lifecycle safety, behavior authenticity, Admin observability, real-client rendering, scale/performance, operational controls, tests, and documentation.

- 2026-09-26: Synced `feature/synthetic-players` with current `origin/develop` (through `790eca7`) with no source conflicts.
- Integration smoke test: latest Admin `GET /admin/api/players` reported 3 live synthetic users with real usernames, PIDs/indexes, coordinates, combat level, fatigue, group, quest points, and synthetic negative database IDs; `/admin/api/status` simultaneously reported `world.players: 3`.
- This proves the existing Admin live-player slice already observes synthetic actors without a synthetic-specific API.

- 2026-09-26: Scaffolded native Admin route `/developer/synthetic-players`. It already reads the normal live player feed and shows synthetic actors via the current negative database-ID convention.
- Added read-only configuration UI for count, behavior/scenario, and spawn X/Y. Spawn and Stop All controls are intentionally disabled pending authenticated/audited mutation APIs and clean lifecycle teardown.
- Documented the future command/capability boundary in `admin-integration.md`. Frontend production build succeeds; Vitest reports 4 files / 7 tests passing.

## 2026-09-27 — lifecycle + Admin read model checkpoint

- Made `SyntheticPopulationService` a first-class per-server service.
- Added idempotent `stopAll()` teardown.
- Teardown stops the shared behavior loop and all actor-owned game events.
- Synthetic players are reset, marked offline, removed from region membership, username-hash lookup, and indexed `PlayerList` without invoking normal account save/logout.
- Server shutdown now stops synthetic actors before `World.unloadPlayers()`.
- Repeated 3-actor start → stop → start → stop smoke test passed with no synthetic save attempts or leaked world/region/event state.
- Added explicit `synthetic`, behavior, and state metadata to the normal Admin player summary.
- Added read-only `GET /admin/api/synthetic-population`.
- Wired `/developer/synthetic-players` to the dedicated runtime read model.
- Browser-verified three live synthetic actors and captured `~/Desktop/OpenRSC-Synthetic-Panel-Live.png`.
- Spawn/Stop controls remain disabled pending the shared Admin auth/capability/audit mutation layer.
