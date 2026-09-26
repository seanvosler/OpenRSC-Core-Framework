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
