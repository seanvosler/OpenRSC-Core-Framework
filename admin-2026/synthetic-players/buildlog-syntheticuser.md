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
